/**
 * POST /api/lead — Cloudflare Pages Function
 *
 * The single endpoint behind all three signup forms and the optional
 * follow-up answers. Runs on Cloudflare's edge; writes to D1.
 *
 * Requires a D1 binding named DB on the Pages project
 * (Settings → Functions → D1 database bindings). Schema is in schema.sql.
 *
 * Every request writes twice, in one atomic batch:
 *   submissions — append-only log of this exact request
 *   leads       — one row per email, filled in as answers arrive
 *
 * No credentials live in the browser: main.js posts to a same-origin path
 * and this function holds the only access to the database.
 */

const MAX_BODY_BYTES = 8192;
const MAX_CONCEPT = 800;          // matches the textarea's maxlength
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Only values the page can actually produce are stored. Anything else is
   discarded rather than written, so a hand-crafted POST cannot put arbitrary
   strings into the columns the leasing team reads. */
const ALLOWED = {
  stage:     ['signup', 'profile'],
  source:    ['hero', 'retail', 'closing'],
  lead_type: ['residential', 'commercial'],
  interest:  ['interest_1br', 'interest_2br', 'interest_townhome',
              'interest_livework', 'interest_retail', 'interest_unsure'],
  timeline:  ['timeline_6mo', 'timeline_6_12mo', 'timeline_exploring']
};

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await readBody(request);
  } catch (err) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Honeypot. A real visitor never sees this field, so anything in it is a
  // bot. Answer as if it worked and write nothing, which is quieter than a
  // rejection and gives the bot no signal to adapt to.
  if (body._gotcha) { return json({ ok: true }); }

  const email = String(body.email || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  if (!env.DB) {
    // Binding missing or misnamed. Logged so it shows up in `wrangler pages
    // deployment tail`, since the browser only sees a generic failure.
    console.error('D1 binding "DB" is not configured on this Pages project.');
    return json({ ok: false, error: 'server_misconfigured' }, 500);
  }

  const allow = (key) => (ALLOWED[key].indexOf(body[key]) !== -1 ? body[key] : null);

  const leadId    = String(body.lead_id || '').slice(0, 64) || crypto.randomUUID();
  const stage     = allow('stage') || 'signup';
  const source    = allow('source');
  const leadType  = allow('lead_type');
  const interest  = allow('interest');
  const timeline  = allow('timeline');
  const concept   = body.concept ? String(body.concept).slice(0, MAX_CONCEPT) : null;

  // Country only. The raw IP is deliberately not stored: it is personal data
  // under CCPA, it is not needed to run a mailing list, and Cloudflare already
  // logs it at the edge for abuse handling.
  const country = (request.cf && request.cf.country) || null;

  const logRow = env.DB.prepare(
    `INSERT INTO submissions
       (lead_id, email, stage, source, lead_type, interest, timeline, concept, country)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(leadId, email, stage, source, leadType, interest, timeline, concept, country);

  // COALESCE so a later request that carries only one answer cannot blank the
  // fields already captured. source and joined_at are absent from the SET
  // clause on purpose: both describe the original signup and must not move.
  const upsertLead = env.DB.prepare(
    `INSERT INTO leads
       (email, lead_id, source, lead_type, interest, timeline, concept)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       lead_id    = COALESCE(leads.lead_id, excluded.lead_id),
       lead_type  = COALESCE(excluded.lead_type, leads.lead_type),
       interest   = COALESCE(excluded.interest,  leads.interest),
       timeline   = COALESCE(excluded.timeline,  leads.timeline),
       concept    = COALESCE(excluded.concept,   leads.concept),
       updated_at = datetime('now')`
  ).bind(email, leadId, source, leadType, interest, timeline, concept);

  try {
    await env.DB.batch([logRow, upsertLead]);
  } catch (err) {
    console.error('D1 write failed:', err && err.message);
    return json({ ok: false, error: 'db_error' }, 500);
  }

  return json({ ok: true, lead_id: leadId });
}

/* Accepts JSON (what main.js sends) and form-encoded (what a browser sends
   natively if JavaScript fails), so the email is still captured either way. */
async function readBody(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) { throw new Error('payload too large'); }

  const type = request.headers.get('content-type') || '';
  if (type.indexOf('application/json') !== -1) { return JSON.parse(raw); }

  const out = {};
  new URLSearchParams(raw).forEach(function (value, key) { out[key] = value; });
  return out;
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
