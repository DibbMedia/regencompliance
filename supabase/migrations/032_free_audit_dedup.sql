-- ============================================================
-- Migration 032: Free-audit lead dedup constraint
-- ============================================================
-- Pairs with the per-email daily cap added in
-- app/api/free-audit/route.ts. Even if the rate limits permit
-- another insert (e.g. user retries 24h+1min later, or Redis
-- rate-limit cache evicts), the unique index prevents same-day
-- duplicates from cluttering the lead pipeline.
--
-- Index expressions must be IMMUTABLE. lower() qualifies. date_trunc()
-- on timestamptz is only STABLE (timezone-dependent), but
-- (timestamptz AT TIME ZONE 'UTC')::date is IMMUTABLE because the
-- timezone is a string literal and date is a calendar-day value.

CREATE UNIQUE INDEX IF NOT EXISTS uniq_free_audit_email_url_day
  ON free_audit_leads (
    lower(email),
    lower(website_url),
    ((created_at AT TIME ZONE 'UTC')::date)
  );

-- The route should write lower-cased emails. Backfill any older rows so the
-- new index doesn't false-fire on case-mismatched dupes.
UPDATE free_audit_leads
SET email = lower(email)
WHERE email <> lower(email);
