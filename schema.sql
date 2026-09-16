-- ==========================================================================
-- Poway Paseo — Cloudflare D1 schema
-- Apply with:  npx wrangler d1 execute poway-paseo --remote --file=./schema.sql
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- submissions — one row per request, append-only.
-- The page sends a request for the signup and another for each optional
-- answer, so one person produces two or three rows here. Nothing in the app
-- ever updates or deletes from this table. It is the audit trail, and it is
-- what evidences priority-list order if that is ever questioned.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id    TEXT NOT NULL,              -- correlates the requests from one visitor
  email      TEXT NOT NULL,              -- stored lowercased and trimmed
  stage      TEXT NOT NULL,              -- 'signup' | 'profile'
  source     TEXT,                       -- 'hero' | 'retail' | 'closing'
  lead_type  TEXT,                       -- 'residential' | 'commercial'
  interest   TEXT,                       -- interest_1br | interest_2br | ...
  timeline   TEXT,                       -- timeline_6mo | timeline_6_12mo | ...
  concept    TEXT,                       -- commercial free-text note
  country    TEXT,                       -- coarse, from Cloudflare. No IP is stored.
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_submissions_email   ON submissions (email);
CREATE INDEX IF NOT EXISTS idx_submissions_lead    ON submissions (lead_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions (created_at);

-- ---------------------------------------------------------------------------
-- leads — one row per person, filled in as the optional answers arrive.
-- This is the table the leasing team actually works from.
--
-- Keyed on email, not on lead_id, on purpose. If someone signs up a second
-- time from another form or another device, that updates this row instead of
-- creating a duplicate, and joined_at keeps its original value. Your landing
-- page promises "first choice of residence, in the order the list was joined"
-- and the privacy policy says position is set solely by when an address was
-- added, so joined_at must never move.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  email      TEXT PRIMARY KEY,
  lead_id    TEXT,
  source     TEXT,                       -- the form they first joined from
  lead_type  TEXT,
  interest   TEXT,
  timeline   TEXT,
  concept    TEXT,
  joined_at  TEXT NOT NULL DEFAULT (datetime('now')),   -- never updated
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_joined ON leads (joined_at);
CREATE INDEX IF NOT EXISTS idx_leads_type   ON leads (lead_type);
