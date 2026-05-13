-- CUTOVER — apply after backfill-scans-sites.ts and Wave 2B deploy is stable
--
-- Drops the legacy plaintext columns once every row's `*_enc` envelope is
-- populated and every callsite reads/writes through the repos in
-- lib/repos/{scans,monitored-sites,site-pages}.ts.
--
-- Order:
--   1. Run scripts/backfill-scans-sites.ts to encrypt every existing row.
--   2. Ship Wave 2B (this migration NOT YET applied) and soak in prod.
--   3. Once the plaintext-fallback paths in the repos no longer hit
--      (instrument or grep logs), apply this migration.
--   4. Remove the plaintext-fallback branches from the repos in a
--      follow-up commit.

ALTER TABLE scans
  DROP COLUMN IF EXISTS original_text,
  DROP COLUMN IF EXISTS rewritten_text,
  DROP COLUMN IF EXISTS flags,
  DROP COLUMN IF EXISTS source_url;

ALTER TABLE monitored_sites
  DROP COLUMN IF EXISTS domain,
  DROP COLUMN IF EXISTS name;

ALTER TABLE site_pages
  DROP COLUMN IF EXISTS url,
  DROP COLUMN IF EXISTS title;
