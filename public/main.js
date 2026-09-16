/* ==========================================================================
   POWAY PASEO — main.js
   Vanilla JS, no dependencies. One handler for all three signup forms,
   one success state, progressive profiling via chips, analytics stub.
   ========================================================================== */
'use strict';

/* --------------------------------------------------------------------------
   CONFIG — the only block you should need to edit.
   -------------------------------------------------------------------------- */

// FORM_ENDPOINT receives every submission (signup + each profiling step).
// This is a Cloudflare Pages Function at functions/api/lead.js, which writes
// to the D1 database bound as DB. Same-origin, so there is no CORS to set up
// and no API key anywhere in this file — the browser never touches the
// database directly. Setup steps and the schema are in README §15.
const FORM_ENDPOINT = '/api/lead';

// 'form' = application/x-www-form-urlencoded · 'json' = application/json
// The Function accepts either; JSON keeps the concept note's line breaks and
// punctuation intact.
const FORM_ENCODING = 'json';

// Profiling steps (chip clicks, concept note) are sent as separate requests
// keyed by lead_id + email. The Function handles every stage as a POST and
// merges the answers into one row per email, so leave this as 'POST'.
const PROFILE_METHOD = 'POST';

// Merged into every payload. Not needed for the Cloudflare setup; never put
// a secret here, since this file is public to every visitor.
const EXTRA_FIELDS = {};

// Honeypot input name. Checked here and again in the Function, since a bot
// can post straight to the endpoint without running this script.
const HONEYPOT_NAME = '_gotcha';


/* --------------------------------------------------------------------------
   ANALYTICS — trackEvent(name, params)
   Wire ONE of these up and remove the console fallback:
     GA4:       gtag('event', name, params)
     Plausible: plausible(name, { props: params })
   Events fired:
     form_view      { source }                          form scrolled into view (once each)
     signup_submit  { source, lead_type }               valid email, request sent
     signup_success { source, lead_type }               endpoint accepted it
     signup_error   { source }                          endpoint failed
     chip_select    { row, value, lead_type, source, auto }
     profile_note   { source, lead_type, length }       commercial concept note sent
     profile_skip   { row, source }
   Chip values are namespaced so residential and commercial demand can be
   read apart in any dashboard:
     interest_1br · interest_2br · interest_townhome · interest_livework ·
     interest_retail · interest_unsure
     timeline_6mo · timeline_6_12mo · timeline_exploring
   -------------------------------------------------------------------------- */
function trackEvent(name, params) {
  params = params || {};
  if (typeof window.gtag === 'function') { window.gtag('event', name, params); return; }
  if (typeof window.plausible === 'function') { window.plausible(name, { props: params }); return; }
  if (window.console && console.debug) { console.debug('[track]', name, params); }
}


/* --------------------------------------------------------------------------
   DATA
   -------------------------------------------------------------------------- */
const INTEREST_CHIPS = [
  { value: 'interest_1br',      label: 'One bedroom',               lead: 'residential' },
  { value: 'interest_2br',      label: 'Two bedroom',               lead: 'residential' },
  { value: 'interest_townhome', label: 'Townhome',                  lead: 'residential' },
  { value: 'interest_livework', label: 'Live-work',                 lead: 'residential' },
  { value: 'interest_retail',   label: 'Restaurant or retail space', lead: 'commercial'  },
  { value: 'interest_unsure',   label: 'Not sure yet',              lead: 'residential' }
];
const TIMELINE_CHIPS = [
  { value: 'timeline_6mo',       label: 'Within 6 months' },
  { value: 'timeline_6_12mo',    label: '6–12 months' },
  { value: 'timeline_exploring', label: 'Just exploring' }
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


/* --------------------------------------------------------------------------
   BOOT
   -------------------------------------------------------------------------- */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('form[data-signup]').forEach(initSignupForm);
  initReveals();
  initFaq();
  var year = document.querySelector('[data-year]');
  if (year) { year.textContent = String(new Date().getFullYear()); }
});


/* --------------------------------------------------------------------------
   SIGNUP FORM — shared by hero, retail, and closing
   -------------------------------------------------------------------------- */
function initSignupForm(form) {
  var source = form.dataset.source || 'unknown';
  var input  = form.querySelector('input[type="email"]');
  var error  = form.querySelector('.form__error');
  var button = form.querySelector('button[type="submit"]');
  var wrap   = form.closest('.signup') || form.parentNode;
  if (!input || !button) { return; }

  observeOnce(form, function () { trackEvent('form_view', { source: source }); });

  input.addEventListener('input', function () {
    if (input.getAttribute('aria-invalid') === 'true') { clearError(); }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (form.dataset.busy === '1') { return; }

    var email = input.value.trim();
    if (!EMAIL_RE.test(email)) {
      showError(email ? 'That address looks incomplete. Try the form name@example.com.'
                      : 'Add your email address to join the list.');
      return;
    }

    // Honeypot filled → a bot. Show success, send nothing.
    var trap = form.elements[HONEYPOT_NAME];
    var leadType = source === 'retail' ? 'commercial' : 'residential';
    var ctx = { email: email, leadId: makeId(), source: source, leadType: leadType, wrap: wrap };
    if (trap && trap.value) { renderSuccess(ctx); return; }

    setBusy(true);
    var payload = {
      email: email,
      source: source,
      lead_id: ctx.leadId,
      lead_type: leadType,
      stage: 'signup',
      page: window.location.href
    };
    if (source === 'retail') { payload.interest = 'interest_retail'; }

    trackEvent('signup_submit', { source: source, lead_type: leadType });

    send(payload, 'POST').then(function () {
      trackEvent('signup_success', { source: source, lead_type: leadType });
      renderSuccess(ctx);
    }).catch(function () {
      trackEvent('signup_error', { source: source });
      setBusy(false);
      showError('We couldn’t reach the list just now. Please try again in a moment.');
    });
  });

  function showError(message) {
    if (!error) { return; }
    error.textContent = message;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }
  function clearError() {
    if (!error) { return; }
    error.textContent = '';
    error.hidden = true;
    input.removeAttribute('aria-invalid');
  }
  function setBusy(state) {
    form.dataset.busy = state ? '1' : '0';
    button.setAttribute('aria-busy', state ? 'true' : 'false');
    button.textContent = state ? 'Joining…' : (button.dataset.label || button.textContent);
    if (!button.dataset.label && !state) { button.dataset.label = button.textContent; }
  }
  if (!button.dataset.label) { button.dataset.label = button.textContent; }
}


/* --------------------------------------------------------------------------
   SUCCESS STATE + PROGRESSIVE PROFILING
   The wrapper (.signup) carries aria-live="polite" in the HTML, so replacing
   its contents announces the confirmation. Focus moves to the confirmation.
   -------------------------------------------------------------------------- */
function renderSuccess(ctx) {
  var wrap = ctx.wrap;
  var root = el('div', { class: 'success', tabindex: '-1' });
  var uid  = ctx.source + '-' + ctx.leadId.slice(0, 6);

  root.appendChild(el('p', { class: 'eyebrow', text: 'You’re on the list' }));
  root.appendChild(el('p', { class: 'success__title', text: 'Thank you.' }));

  var lead = el('p', { class: 'success__lead' });
  lead.appendChild(document.createTextNode('Floor plans, pricing, and tour dates will reach '));
  lead.appendChild(el('strong', { text: ctx.email }));
  lead.appendChild(document.createTextNode(' before they’re public. Two optional questions, if you have a moment.'));
  root.appendChild(lead);

  // Row 1 — interest
  var row1 = buildChipRow({
    id: 'q-interest-' + uid,
    question: 'What are you interested in?',
    chips: INTEREST_CHIPS,
    rowName: 'interest',
    preselect: ctx.source === 'retail' ? 'interest_retail' : null,
    onSelect: function (chip, auto) {
      ctx.leadType = chip.lead;
      if (!auto) {
        sendProfile(ctx, { interest: chip.value });
      }
      trackEvent('chip_select', { row: 'interest', value: chip.value, lead_type: chip.lead, source: ctx.source, auto: !!auto });
      renderStage2(ctx, stage2);
    },
    onSkip: function () {
      trackEvent('profile_skip', { row: 'interest', source: ctx.source });
      renderStage2(ctx, stage2);
    }
  });
  // Both question rows live in one block. Answering the last one collapses the
  // whole block to a single closing line, so no half-answered row is left behind.
  var profiling = el('div', { class: 'profiling' });
  ctx.profiling = profiling;
  profiling.appendChild(row1);

  var stage2 = el('div', { class: 'success__stage2' });
  profiling.appendChild(stage2);
  root.appendChild(profiling);

  wrap.innerHTML = '';
  wrap.appendChild(root);
  root.focus({ preventScroll: true });

  // Retail form: the commercial chip is pre-selected and stage 2 opens as the concept note.
  if (ctx.source === 'retail') {
    var pre = row1.querySelector('[data-value="interest_retail"]');
    if (pre) { pre.setAttribute('aria-pressed', 'true'); }
    ctx.leadType = 'commercial';
    trackEvent('chip_select', { row: 'interest', value: 'interest_retail', lead_type: 'commercial', source: ctx.source, auto: true });
    renderStage2(ctx, stage2);
  }
}

function renderStage2(ctx, container) {
  var wanted = ctx.leadType === 'commercial' ? 'note' : 'timeline';
  if (ctx.done) { return; }
  if (container.dataset.stage === wanted) { return; }
  container.dataset.stage = wanted;
  container.innerHTML = '';

  if (wanted === 'note') {
    container.appendChild(buildNote(ctx));
    return;
  }
  container.appendChild(buildChipRow({
    id: 'q-timeline-' + ctx.leadId.slice(0, 6),
    question: "What's your move-in timeframe?",
    chips: TIMELINE_CHIPS,
    rowName: 'timeline',
    onSelect: function (chip) {
      sendProfile(ctx, { timeline: chip.value });
      trackEvent('chip_select', { row: 'timeline', value: chip.value, lead_type: ctx.leadType, source: ctx.source, auto: false });
      finish(ctx, 'Noted. That’s everything. Thank you.');
    },
    onSkip: function () {
      trackEvent('profile_skip', { row: 'timeline', source: ctx.source });
      finish(ctx, 'That’s everything. Thank you.');
    }
  }));
}

function buildChipRow(opts) {
  var row = el('div', { class: 'chips', 'data-row': opts.rowName });
  var q = el('p', { class: 'chips__q', id: opts.id, text: opts.question + ' ' });
  q.appendChild(el('span', { class: 'chips__opt', text: 'Optional' }));
  row.appendChild(q);

  var group = el('div', { class: 'chips__row', role: 'group', 'aria-labelledby': opts.id });
  opts.chips.forEach(function (chip) {
    var b = el('button', {
      type: 'button', class: 'chip', text: chip.label,
      'data-value': chip.value, 'aria-pressed': 'false'
    });
    b.addEventListener('click', function () {
      group.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      status.textContent = 'Noted.';
      skip.hidden = true;
      opts.onSelect(chip, false);
    });
    group.appendChild(b);
  });
  row.appendChild(group);

  var actions = el('div', { class: 'chips__actions' });
  var skip = el('button', { type: 'button', class: 'btn--text', text: 'Skip this' });
  var status = el('span', { class: 'chips__status' });
  skip.addEventListener('click', function () {
    skip.hidden = true;
    status.textContent = 'Skipped.';
    opts.onSkip();
  });
  actions.appendChild(skip);
  actions.appendChild(status);
  row.appendChild(actions);
  return row;
}

function buildNote(ctx) {
  var id = 'note-' + ctx.leadId.slice(0, 6);
  var box = el('div', { class: 'note' });
  var label = el('label', { class: 'note__label', for: id, text: 'Tell us about your concept and the size you need ' });
  label.appendChild(el('span', { class: 'chips__opt', text: 'Optional' }));
  var field = el('textarea', { class: 'note__field', id: id, name: 'concept', maxlength: '800', rows: '4' });
  var actions = el('div', { class: 'chips__actions' });
  var sendBtn = el('button', { type: 'button', class: 'btn', text: 'Send note' });
  var skip = el('button', { type: 'button', class: 'btn--text', text: 'Skip this' });
  var broker = document.querySelector('[data-broker]');
  var followUp = (broker ? broker.textContent.trim() : 'The leasing team') + ' will follow up directly.';

  sendBtn.addEventListener('click', function () {
    var text = field.value.trim();
    if (!text) { field.focus(); return; }
    sendProfile(ctx, { concept: text, lead_type: 'commercial' });
    trackEvent('profile_note', { source: ctx.source, lead_type: 'commercial', length: text.length });
    finish(ctx, 'Thank you. ' + followUp);
  });
  skip.addEventListener('click', function () {
    trackEvent('profile_skip', { row: 'note', source: ctx.source });
    finish(ctx, 'Thank you. ' + followUp);
  });

  actions.appendChild(sendBtn);
  actions.appendChild(skip);
  box.appendChild(label);
  box.appendChild(field);
  box.appendChild(actions);
  return box;
}

function finish(ctx, message) {
  ctx.done = true;
  var block = ctx.profiling;
  if (!block) { return; }
  block.innerHTML = '';
  // tabindex so focus has somewhere to land: the control that was just
  // activated is being removed, and focus would otherwise fall to <body>.
  var done = el('p', { class: 'success__done', tabindex: '-1', text: message });
  block.appendChild(done);
  done.focus({ preventScroll: true });
}

function sendProfile(ctx, fields) {
  var payload = { email: ctx.email, lead_id: ctx.leadId, source: ctx.source, lead_type: ctx.leadType, stage: 'profile' };
  Object.keys(fields).forEach(function (k) { payload[k] = fields[k]; });
  return send(payload, PROFILE_METHOD).catch(function () { /* profiling is best-effort */ });
}


/* --------------------------------------------------------------------------
   TRANSPORT
   -------------------------------------------------------------------------- */
function send(data, method) {
  var body = {};
  Object.keys(EXTRA_FIELDS).forEach(function (k) { body[k] = EXTRA_FIELDS[k]; });
  Object.keys(data).forEach(function (k) { body[k] = data[k]; });

  // Endpoint not configured yet: simulate a short round-trip so the UI can be reviewed.
  if (!FORM_ENDPOINT || FORM_ENDPOINT.indexOf('{{') === 0) {
    if (window.console) { console.warn('[Poway Paseo] FORM_ENDPOINT is not set. Not sent:', body); }
    return new Promise(function (resolve) { setTimeout(resolve, 400); });
  }

  var headers = { 'Accept': 'application/json' };
  var encoded;
  if (FORM_ENCODING === 'json') {
    headers['Content-Type'] = 'application/json';
    encoded = JSON.stringify(body);
  } else {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    encoded = new URLSearchParams(body).toString();
  }
  return fetch(FORM_ENDPOINT, { method: method || 'POST', headers: headers, body: encoded })
    .then(function (res) {
      if (!res.ok) { throw new Error('HTTP ' + res.status); }
      return res;
    });
}


/* --------------------------------------------------------------------------
   SCROLL REVEALS — instant when reduced motion is preferred (CSS handles it)
   -------------------------------------------------------------------------- */
function initReveals() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) { return; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (n) { n.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  items.forEach(function (n) { io.observe(n); });
}

function observeOnce(node, callback) {
  if (!('IntersectionObserver' in window)) { callback(); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { callback(); io.disconnect(); }
    });
  }, { threshold: 0.5 });
  io.observe(node);
}


/* --------------------------------------------------------------------------
   FAQ — exclusive accordion fallback for browsers without <details name>
   -------------------------------------------------------------------------- */
function initFaq() {
  var items = document.querySelectorAll('.faq__item');
  if (!items.length) { return; }
  items.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) { return; }
      items.forEach(function (other) { if (other !== item && other.open) { other.open = false; } });
    });
  });
}


/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
function el(tag, attrs) {
  var node = document.createElement(tag);
  Object.keys(attrs || {}).forEach(function (k) {
    if (k === 'text') { node.textContent = attrs[k]; }
    else { node.setAttribute(k, attrs[k]); }
  });
  return node;
}

function makeId() {
  if (window.crypto && crypto.randomUUID) { return crypto.randomUUID(); }
  return 'lead-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}
