-- ============================================================
-- Migration 032: Free-audit lead dedup constraint
-- ============================================================
-- Pairs with the per-email daily cap added in
-- app/api/free-audit/route.ts. Even if the rate limits permit
-- another insert (e.g. user retries 24h+1min later, or Redis
-- rate-limit cache evicts), the unique index prevents same-day
-- duplicates from cluttering the lead pipeline.
--
-- The expression is index-immutable: lower() and date_trunc()
-- with constant first arg are both IMMUTABLE in PostgreSQL.

CREATE UNIQUE INDEX IF NOT EXISTS uniq_free_audit_email_url_day
  ON free_audit_leads (
    lower(email),
    lower(website_url),
    (date_trunc('day', created_at))
  );

-- The route should write lower-cased emails. Backfill any older rows so the
-- new index doesn't false-fire on case-mismatched dupes.
UPDATE free_audit_leads
SET email = lower(email)
WHERE email <> lower(email);
