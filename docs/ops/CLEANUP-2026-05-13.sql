-- ============================================================
-- Post-cutover cleanup SQL (2026-05-13)
-- ============================================================
-- Run in Supabase Studio SQL editor (project pdioqkvwmyboqpbilbfw).
-- Safe to re-run; all statements are idempotent.
--
-- Why: encryption cutover happened without the planned 24h dual-state
-- soak. Some users (isaac@dibbenterprizes.com) hit dropped-column
-- PGRST204 errors that have since been patched in code (commits
-- a86b1f5, 62ae773, 78f4e47, c4fd937). This bundle clears the
-- residual state those crashes left behind:
--   1. Stale rate_limits entries that never expired naturally
--   2. site_pages stuck in status='scanning' from crashed scan loops

-- ─── 1. Expire all stale rate_limits ───
-- Standard housekeeping; safe to run anytime. Removes entries that
-- have already expired but haven't been swept.
DELETE FROM rate_limits WHERE expires_at < now();

-- ─── 2. Optional: nuke isaac@dibbenterprizes.com's rate-limit
--           buckets so he can retry scans without waiting out the
--           hourly/daily windows. ───
DELETE FROM rate_limits
WHERE key LIKE 'scan-text:%'  AND key IN (
    SELECT 'scan-text:' || id     FROM auth.users WHERE email = 'isaac@dibbenterprizes.com'
  )
   OR key LIKE 'scan-text-day:%'  AND key IN (
    SELECT 'scan-text-day:' || id FROM auth.users WHERE email = 'isaac@dibbenterprizes.com'
  )
   OR key LIKE 'scan-url:%'  AND key IN (
    SELECT 'scan-url:' || id      FROM auth.users WHERE email = 'isaac@dibbenterprizes.com'
  )
   OR key LIKE 'scan-url-day:%'  AND key IN (
    SELECT 'scan-url-day:' || id  FROM auth.users WHERE email = 'isaac@dibbenterprizes.com'
  )
   OR key LIKE 'scan-file:%'  AND key IN (
    SELECT 'scan-file:' || id     FROM auth.users WHERE email = 'isaac@dibbenterprizes.com'
  )
   OR key LIKE 'scan-file-day:%'  AND key IN (
    SELECT 'scan-file-day:' || id FROM auth.users WHERE email = 'isaac@dibbenterprizes.com'
  )
   OR key LIKE 'crawl:%'  AND key LIKE ANY (
    ARRAY(SELECT 'crawl:' || id || ':%' FROM auth.users WHERE email = 'isaac@dibbenterprizes.com')
  )
   OR key LIKE 'crawl-user:%'  AND key IN (
    SELECT 'crawl-user:' || id    FROM auth.users WHERE email = 'isaac@dibbenterprizes.com'
  )
   OR key LIKE 'rewrite:%'  AND key IN (
    SELECT 'rewrite:' || id       FROM auth.users WHERE email = 'isaac@dibbenterprizes.com'
  )
   OR key LIKE 'rewrite-day:%'  AND key IN (
    SELECT 'rewrite-day:' || id   FROM auth.users WHERE email = 'isaac@dibbenterprizes.com'
  );

-- ─── 3. Reset site_pages stuck in status='scanning' ───
-- A page is stuck if it's been "scanning" for more than 10 minutes.
-- The cron sets a 5-min window per page; anything older is dead state
-- from a crashed scan loop. Setting back to 'pending' lets the next
-- scan run pick it up.
UPDATE site_pages
   SET status = 'pending',
       updated_at = now()
 WHERE status = 'scanning'
   AND updated_at < now() - interval '10 minutes';

-- ─── 4. Sanity checks (read-only; nothing modified) ───
-- Confirm cleanup applied cleanly. Expect zero stale entries and
-- zero stuck scanning pages after the above.
SELECT count(*) AS remaining_stale_rate_limits
  FROM rate_limits WHERE expires_at < now();

SELECT count(*) AS stuck_scanning_pages
  FROM site_pages
 WHERE status = 'scanning'
   AND updated_at < now() - interval '10 minutes';

SELECT key, count, expires_at
  FROM rate_limits
 WHERE key LIKE ANY (
   ARRAY(SELECT '%' || id || '%' FROM auth.users WHERE email = 'isaac@dibbenterprizes.com')
 )
 ORDER BY expires_at DESC;
