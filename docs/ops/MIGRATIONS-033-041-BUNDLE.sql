-- ============================================================
-- RegenCompliance — User-Level Encryption ADDITIVE Migrations
-- Bundle of supabase/migrations/{033,035,037,039,041}
-- ============================================================
--
-- Paste this entire file into Supabase Dashboard -> SQL Editor -> New query
-- and click Run. Wraps all 5 migrations in a single transaction so it's
-- all-or-nothing: if any statement fails, the whole bundle rolls back.
--
-- What this bundle does (NON-destructive of data; safe to apply during a
-- live deploy):
--   * Adds *_enc TEXT companion columns alongside every plaintext column
--     in the encryption scope (profiles, team_members, scans, monitored_sites,
--     site_pages, support_tickets, ticket_messages, notifications, audit_log,
--     impersonation_sessions, waitlist, beta_applications, free_audit_leads,
--     newsletter_subscribers, beta_purchases).
--   * Denormalizes profile_id onto site_pages and ticket_messages (with
--     an idempotent backfill from the parent row).
--   * Drops unique(email) constraints on waitlist, beta_applications,
--     newsletter_subscribers + the free_audit_leads compound dedup index
--     (per plan §12.1 — encrypted emails can't be unique-indexed).
--   * Drops NOT NULL on every legacy plaintext column whose repo no
--     longer writes plaintext, so the encrypted-only inserts can land
--     before migration 042 drops the columns outright.
--
-- What this bundle does NOT do (deferred to cutover migrations 034/036/038/040/042):
--   * Drop any plaintext columns. After this bundle, both plaintext and
--     *_enc columns coexist. Apply the cutover bundle only after:
--     (a) the 5 scripts/backfill-*.ts scripts have populated *_enc on
--         every existing row, AND
--     (b) the Wave 2 deploy has been live for >= 24 hours with no
--         decrypt errors in Vercel logs.
--
-- Operator timing: low traffic, single Vercel deploy is already live.
-- Expected runtime: <5 seconds for a founder-beta dataset.
--
-- Reference: docs/user-level-encryption-plan.md §12.7 + §12.8;
--            docs/security/soak-runbook.md for the full 48h procedure.

BEGIN;

-- ============================================================
-- Migration 033 — profiles + team_members
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS clinic_name_enc TEXT;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS treatments_enc TEXT;

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS email_enc TEXT;


-- ============================================================
-- Migration 035 — scans + monitored_sites + site_pages
-- ============================================================

-- scans
ALTER TABLE scans
  ADD COLUMN IF NOT EXISTS original_text_enc  TEXT,
  ADD COLUMN IF NOT EXISTS rewritten_text_enc TEXT,
  ADD COLUMN IF NOT EXISTS flags_enc          TEXT,
  ADD COLUMN IF NOT EXISTS source_url_enc     TEXT;

COMMENT ON COLUMN scans.original_text_enc IS
  'v1u. envelope of original_text under profile_id DEK. Populated by backfill; new writes go here exclusively. Plaintext column dropped in migration 036.';
COMMENT ON COLUMN scans.rewritten_text_enc IS
  'v1u. envelope of rewritten_text under profile_id DEK. NULL while a scan has not been rewritten.';
COMMENT ON COLUMN scans.flags_enc IS
  'v1u. envelope of flags (JSONB serialized as JSON text) under profile_id DEK.';
COMMENT ON COLUMN scans.source_url_enc IS
  'v1u. envelope of source_url under profile_id DEK. NULL for direct-text scans.';

-- monitored_sites
ALTER TABLE monitored_sites
  ADD COLUMN IF NOT EXISTS domain_enc TEXT,
  ADD COLUMN IF NOT EXISTS name_enc   TEXT;

COMMENT ON COLUMN monitored_sites.domain_enc IS
  'v1u. envelope of domain under profile_id DEK.';
COMMENT ON COLUMN monitored_sites.name_enc IS
  'v1u. envelope of name under profile_id DEK.';

-- site_pages: denormalize profile_id + add *_enc columns
ALTER TABLE site_pages
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS url_enc    TEXT,
  ADD COLUMN IF NOT EXISTS title_enc  TEXT;

UPDATE site_pages
   SET profile_id = (
     SELECT profile_id
       FROM monitored_sites
      WHERE monitored_sites.id = site_pages.site_id
   )
 WHERE profile_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_site_pages_profile_id ON site_pages(profile_id);

COMMENT ON COLUMN site_pages.profile_id IS
  'Denormalized from monitored_sites.profile_id. Used for per-user encryption AAD and (eventually) a direct-equality RLS policy. Existing site_id-join RLS continues to gate access during the transition.';
COMMENT ON COLUMN site_pages.url_enc IS
  'v1u. envelope of url under profile_id DEK.';
COMMENT ON COLUMN site_pages.title_enc IS
  'v1u. envelope of title under profile_id DEK.';


-- ============================================================
-- Migration 037 — support_tickets + ticket_messages + notifications
-- ============================================================

ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS subject_enc TEXT;

ALTER TABLE support_tickets
  ALTER COLUMN subject DROP NOT NULL;

ALTER TABLE ticket_messages
  ADD COLUMN IF NOT EXISTS profile_id UUID;

ALTER TABLE ticket_messages
  ADD COLUMN IF NOT EXISTS message_enc TEXT;

ALTER TABLE ticket_messages
  ALTER COLUMN message DROP NOT NULL;

UPDATE ticket_messages
SET profile_id = (
  SELECT profile_id
  FROM support_tickets
  WHERE support_tickets.id = ticket_messages.ticket_id
)
WHERE profile_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_ticket_messages_profile_id
  ON ticket_messages(profile_id);

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS title_enc TEXT;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS body_enc TEXT;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS action_url_enc TEXT;

ALTER TABLE notifications
  ALTER COLUMN title DROP NOT NULL;

ALTER TABLE notifications
  ALTER COLUMN body DROP NOT NULL;


-- ============================================================
-- Migration 039 — audit_log + impersonation_sessions
-- ============================================================

ALTER TABLE audit_log
  ADD COLUMN IF NOT EXISTS user_email_enc text,
  ADD COLUMN IF NOT EXISTS details_enc text,
  ADD COLUMN IF NOT EXISTS ip_address_enc text,
  ADD COLUMN IF NOT EXISTS user_agent_enc text;

ALTER TABLE impersonation_sessions
  ADD COLUMN IF NOT EXISTS admin_email_enc text,
  ADD COLUMN IF NOT EXISTS target_email_enc text;


-- ============================================================
-- Migration 041 — pre-auth leads + drop email uniques (plan §12.1)
-- ============================================================

-- Drop unique constraints + dedup indexes
ALTER TABLE waitlist DROP CONSTRAINT IF EXISTS waitlist_email_key;
DROP INDEX IF EXISTS waitlist_email_key;
DROP INDEX IF EXISTS idx_waitlist_email;

ALTER TABLE beta_applications DROP CONSTRAINT IF EXISTS beta_applications_email_key;
DROP INDEX IF EXISTS beta_applications_email_key;
DROP INDEX IF EXISTS idx_beta_applications_email;

ALTER TABLE newsletter_subscribers DROP CONSTRAINT IF EXISTS newsletter_subscribers_email_key;
DROP INDEX IF EXISTS newsletter_subscribers_email_key;
DROP INDEX IF EXISTS idx_newsletter_email;

DROP INDEX IF EXISTS uniq_free_audit_email_url_day;
DROP INDEX IF EXISTS idx_free_audit_leads_email;

-- waitlist *_enc
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS email_enc text;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS name_enc text;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS ip_address_enc text;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS user_agent_enc text;

-- beta_applications *_enc
ALTER TABLE beta_applications ADD COLUMN IF NOT EXISTS name_enc text;
ALTER TABLE beta_applications ADD COLUMN IF NOT EXISTS email_enc text;
ALTER TABLE beta_applications ADD COLUMN IF NOT EXISTS clinic_name_enc text;
ALTER TABLE beta_applications ADD COLUMN IF NOT EXISTS specialty_enc text;
ALTER TABLE beta_applications ADD COLUMN IF NOT EXISTS role_enc text;
ALTER TABLE beta_applications ADD COLUMN IF NOT EXISTS website_enc text;
ALTER TABLE beta_applications ADD COLUMN IF NOT EXISTS monthly_volume_enc text;
ALTER TABLE beta_applications ADD COLUMN IF NOT EXISTS why_apply_enc text;
ALTER TABLE beta_applications ADD COLUMN IF NOT EXISTS ip_address_enc text;
ALTER TABLE beta_applications ADD COLUMN IF NOT EXISTS user_agent_enc text;

-- free_audit_leads *_enc
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS email_enc text;
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS website_url_enc text;
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS page_title_enc text;
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS ip_address_enc text;
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS user_agent_enc text;
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS flags_enc text;

-- newsletter_subscribers *_enc
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS email_enc text;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS ip_address_enc text;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS user_agent_enc text;

-- beta_purchases *_enc
ALTER TABLE beta_purchases ADD COLUMN IF NOT EXISTS email_enc text;

-- Relax NOT NULL on legacy plaintext columns so encrypted-only writes work
ALTER TABLE beta_purchases ALTER COLUMN email DROP NOT NULL;
ALTER TABLE waitlist ALTER COLUMN name DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN name DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN email DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN clinic_name DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN specialty DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN role DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN monthly_volume DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN why_apply DROP NOT NULL;
ALTER TABLE newsletter_subscribers ALTER COLUMN email DROP NOT NULL;
ALTER TABLE free_audit_leads ALTER COLUMN email DROP NOT NULL;
ALTER TABLE free_audit_leads ALTER COLUMN website_url DROP NOT NULL;


-- ============================================================
-- Sanity check (run this AFTER the COMMIT to confirm all _enc columns exist)
-- ============================================================
--   SELECT table_name, column_name
--     FROM information_schema.columns
--    WHERE column_name LIKE '%_enc'
--      AND table_schema = 'public'
--    ORDER BY table_name, column_name;
-- Expected: 31 rows.

COMMIT;
