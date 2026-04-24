-- ============================================================
-- Migration 024: RLS completeness sweep
-- ============================================================
-- Adds the two missing user-data-ownership policies identified by
-- the 2026-04-24 RLS audit:
--   scans          - DELETE own rows
--   notifications  - DELETE own rows
-- Neither action is currently possible via the anon/auth clients,
-- which blocks user "delete my scan" / "clear notification" UX and
-- makes a proper GDPR right-to-be-forgotten flow awkward.
--
-- Everything else the audit covered is already correct:
--   profiles, team_members, compliance_rules, monitored_sites,
--   site_pages, support_tickets, ticket_messages, enforcement_actions,
--   beta_purchases, api_usage, audit_log, webhook_events, rate_limits,
--   waitlist, platform_admins, impersonation_sessions,
--   newsletter_subscribers, storage.objects (logos bucket).

-- ------------------------------------------------------------
-- scans: DELETE own rows
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can delete own scans" ON scans;
CREATE POLICY "Users can delete own scans" ON scans
  FOR DELETE
  USING (
    profile_id = auth.uid()
    OR profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)
  );

-- ------------------------------------------------------------
-- notifications: DELETE own rows
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE
  USING (
    profile_id = auth.uid()
    OR profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)
  );

-- ------------------------------------------------------------
-- rate_limits: housekeeping — expire old rows
-- ------------------------------------------------------------
-- Not strictly RLS, but while we are in a DB migration: delete any
-- rate-limit rows whose window closed more than a day ago. Service
-- role only; this is belt-and-suspenders cleanup for the upsert in
-- increment_rate_limit() which overwrites stale rows on demand.
DELETE FROM rate_limits WHERE expires_at < now() - interval '1 day';
