-- ============================================================
-- Migration 039: Encrypt audit_log + impersonation_sessions (add _enc)
-- ============================================================
-- Phase 5 of the user-level encryption plan
-- (docs/user-level-encryption-plan.md §3, §4, §12.7, §12.8).
--
-- Adds dual-write companion columns. Writes start populating *_enc
-- envelopes (v1u. for rows with user_id, v1s. for system rows; see
-- lib/repos/audit-log.ts + lib/repos/impersonation-sessions.ts).
-- Reads fall back to plaintext when *_enc IS NULL so historical rows
-- (pre-backfill) still decode.
--
-- Cutover (drop plaintext columns) ships in migration 040 after the
-- backfill script has populated every existing row.
--
-- All ALTERs are IF NOT EXISTS so the migration is rerunnable.

-- ------------------------------------------------------------
-- audit_log
-- ------------------------------------------------------------
ALTER TABLE audit_log
  ADD COLUMN IF NOT EXISTS user_email_enc text,
  ADD COLUMN IF NOT EXISTS details_enc text,
  ADD COLUMN IF NOT EXISTS ip_address_enc text,
  ADD COLUMN IF NOT EXISTS user_agent_enc text;

-- ------------------------------------------------------------
-- impersonation_sessions
-- ------------------------------------------------------------
ALTER TABLE impersonation_sessions
  ADD COLUMN IF NOT EXISTS admin_email_enc text,
  ADD COLUMN IF NOT EXISTS target_email_enc text;
