-- ============================================================
-- Migration 040: Cutover - drop plaintext on audit + impersonation
-- ============================================================
-- Phase 5 cutover migration. Pairs with 039 (which added *_enc
-- companion columns) and the backfill script
-- scripts/backfill-audit-impersonation.ts, which must have populated
-- every existing row's *_enc columns before this migration runs.
--
-- After this migration:
--   - audit_log loses user_email, details (jsonb), ip_address, user_agent
--   - impersonation_sessions loses admin_email, target_email
--   - All reads/writes go through lib/repos/audit-log.ts and
--     lib/repos/impersonation-sessions.ts which speak only the
--     encrypted column shape post-cutover.
--
-- Repos retain a plaintext-read fallback for the dual-write window
-- between 039 and 040 - once 040 lands, the plaintext branches in the
-- repos become dead code (still safe, just unused).
--
-- Operator note: also drop the admin audit-log UI's user_email ilike
-- filter (handled in code; the column literally won't exist after this).

-- ------------------------------------------------------------
-- audit_log
-- ------------------------------------------------------------
ALTER TABLE audit_log
  DROP COLUMN IF EXISTS user_email,
  DROP COLUMN IF EXISTS details,
  DROP COLUMN IF EXISTS ip_address,
  DROP COLUMN IF EXISTS user_agent;

-- ------------------------------------------------------------
-- impersonation_sessions
-- ------------------------------------------------------------
ALTER TABLE impersonation_sessions
  DROP COLUMN IF EXISTS admin_email,
  DROP COLUMN IF EXISTS target_email;
