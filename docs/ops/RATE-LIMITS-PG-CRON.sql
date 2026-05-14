-- ============================================================
-- pg_cron schedule: rate_limits cleanup (one-time setup)
-- ============================================================
-- Run ONCE in Supabase Studio SQL editor (project pdioqkvwmyboqpbilbfw).
--
-- Why: rate_limits (mig 012) grows unbounded otherwise. Every API request
-- that hits a rate-limit check writes a row; only the expires_at column
-- has an index. Migration 012 left a TODO comment saying "run periodically
-- via pg_cron or Supabase cron" — this bundle finalizes that schedule.
--
-- Flagged by the 2026-05-13 security audit. After this runs, the table
-- self-prunes every 15 minutes and stays small.
--
-- Idempotent: re-runs unschedule + reschedule with the same name.

-- ─── 1. Make sure pg_cron is enabled ───
-- (Already enabled on Supabase by default; this is a no-op if so.)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- ─── 2. Unschedule any prior job with this name (safe re-run) ───
DO $$
BEGIN
  PERFORM cron.unschedule(jobid)
    FROM cron.job
   WHERE jobname = 'rate-limits-purge';
EXCEPTION
  WHEN OTHERS THEN
    -- pg_cron not present or no prior job; safe to ignore.
    NULL;
END$$;

-- ─── 3. Schedule the purge every 15 minutes ───
SELECT cron.schedule(
  'rate-limits-purge',
  '*/15 * * * *',
  $$ DELETE FROM rate_limits WHERE expires_at < now() $$
);

-- ─── 4. Sanity check: confirm the job exists ───
SELECT jobid, schedule, command, jobname, active
  FROM cron.job
 WHERE jobname = 'rate-limits-purge';
