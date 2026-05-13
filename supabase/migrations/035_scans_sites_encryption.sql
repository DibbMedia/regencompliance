-- Phase 3 — encryption add-columns for scans, monitored_sites, site_pages.
--
-- Per docs/user-level-encryption-plan.md §3, §4, §12.7, §12.8: each table
-- gets a parallel `*_enc TEXT` column for every column we encrypt under
-- per-user DEKs. The plaintext columns stay in place during the dual-write
-- transition; migration 036 (CUTOVER) drops them once the backfill script
-- has populated every row and Wave 2B deploy is stable.
--
-- We also denormalize `profile_id` onto `site_pages` so the per-user AAD
-- (`site_pages:{col}:{row_id}`) can be derived without a JOIN through
-- `monitored_sites`. The existing RLS policy on `site_pages` continues to
-- work via the `site_id` -> `monitored_sites.profile_id` path during the
-- transition; the new `profile_id` column exists for crypto AAD purposes
-- and an explicit index aids the future direct-equality policy.

-- --------------------------------------------------------------------
-- scans
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- monitored_sites
-- --------------------------------------------------------------------
ALTER TABLE monitored_sites
  ADD COLUMN IF NOT EXISTS domain_enc TEXT,
  ADD COLUMN IF NOT EXISTS name_enc   TEXT;

COMMENT ON COLUMN monitored_sites.domain_enc IS
  'v1u. envelope of domain under profile_id DEK.';
COMMENT ON COLUMN monitored_sites.name_enc IS
  'v1u. envelope of name under profile_id DEK.';

-- --------------------------------------------------------------------
-- site_pages: denormalize profile_id + add *_enc columns
-- --------------------------------------------------------------------
ALTER TABLE site_pages
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS url_enc    TEXT,
  ADD COLUMN IF NOT EXISTS title_enc  TEXT;

-- Backfill profile_id from monitored_sites. Idempotent: only rows where
-- profile_id is still NULL get updated.
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
