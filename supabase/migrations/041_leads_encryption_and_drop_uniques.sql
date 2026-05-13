-- ============================================================
-- Migration 041: Pre-auth lead encryption (Phase 6 setup)
-- ============================================================
-- Phase 6 of docs/user-level-encryption-plan.md.
--
-- Step 1 of the dual-write transition: drop unique constraints
-- + indexes that depend on plaintext equality (these cannot
-- survive opaque encryption per plan §12.1), then add the *_enc
-- companion columns alongside the existing plaintext columns so
-- repos can write both during the cutover window.
--
-- Migration 042 drops the plaintext columns and finalizes the
-- cutover (and updates the reserve_beta_seat RPC, which writes
-- to `email`).
--
-- Idempotent: every drop uses IF EXISTS, every add uses IF NOT
-- EXISTS. Safe to re-run.

-- ─── (1) Drop unique constraints + dedup indexes per plan §12.1 ───

-- waitlist.email_key from mig 010 (`email text NOT NULL UNIQUE`).
-- Postgres autogenerates the constraint name as <table>_<col>_key.
ALTER TABLE waitlist DROP CONSTRAINT IF EXISTS waitlist_email_key;
-- Defensive: also drop the indexed-form name in case Postgres assigned a
-- non-standard identifier on this database.
DROP INDEX IF EXISTS waitlist_email_key;
-- Plaintext-email btree index is also useless after encryption (and would
-- block the eventual column drop on some Postgres setups). Remove it.
DROP INDEX IF EXISTS idx_waitlist_email;

-- beta_applications.email_key from mig 025.
ALTER TABLE beta_applications DROP CONSTRAINT IF EXISTS beta_applications_email_key;
DROP INDEX IF EXISTS beta_applications_email_key;
DROP INDEX IF EXISTS idx_beta_applications_email;

-- newsletter_subscribers.email_key from mig 023.
ALTER TABLE newsletter_subscribers DROP CONSTRAINT IF EXISTS newsletter_subscribers_email_key;
DROP INDEX IF EXISTS newsletter_subscribers_email_key;
DROP INDEX IF EXISTS idx_newsletter_email;

-- free_audit_leads compound dedup index from mig 032 + plaintext email index.
DROP INDEX IF EXISTS uniq_free_audit_email_url_day;
DROP INDEX IF EXISTS idx_free_audit_leads_email;

-- ─── (2) waitlist *_enc columns ───
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS email_enc text;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS name_enc text;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS ip_address_enc text;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS user_agent_enc text;

-- ─── (3) beta_applications *_enc columns ───
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

-- ─── (4) free_audit_leads *_enc columns ───
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS email_enc text;
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS website_url_enc text;
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS page_title_enc text;
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS ip_address_enc text;
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS user_agent_enc text;
-- flags JSONB encrypted as a base64url envelope string (encryptJSONForRow).
ALTER TABLE free_audit_leads ADD COLUMN IF NOT EXISTS flags_enc text;

-- ─── (5) newsletter_subscribers *_enc columns ───
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS email_enc text;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS ip_address_enc text;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS user_agent_enc text;

-- ─── (6) beta_purchases.email_enc ───
ALTER TABLE beta_purchases ADD COLUMN IF NOT EXISTS email_enc text;

-- Allow `email` to be NULL during the dual-write transition. The
-- reserve_beta_seat RPC currently inserts a sentinel placeholder
-- ('pending-<token>'), and post-encryption repos write only email_enc.
-- Migration 042 drops the column entirely; this just unblocks repos
-- that no longer set it.
ALTER TABLE beta_purchases ALTER COLUMN email DROP NOT NULL;

-- waitlist.name was NOT NULL in mig 010; same dual-write courtesy.
ALTER TABLE waitlist ALTER COLUMN name DROP NOT NULL;

-- beta_applications: every NOT NULL plaintext column needs a transition
-- relax so the encrypted-only repo writes can land before mig 042 drops
-- the columns outright.
ALTER TABLE beta_applications ALTER COLUMN name DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN email DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN clinic_name DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN specialty DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN role DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN monthly_volume DROP NOT NULL;
ALTER TABLE beta_applications ALTER COLUMN why_apply DROP NOT NULL;

-- newsletter_subscribers.email NOT NULL from mig 023.
ALTER TABLE newsletter_subscribers ALTER COLUMN email DROP NOT NULL;

-- free_audit_leads.email + website_url NOT NULL from mig 027.
ALTER TABLE free_audit_leads ALTER COLUMN email DROP NOT NULL;
ALTER TABLE free_audit_leads ALTER COLUMN website_url DROP NOT NULL;
