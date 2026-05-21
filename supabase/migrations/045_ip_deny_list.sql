-- ============================================================
-- Migration 045: Auto-populated IP deny list
-- ============================================================
-- Tracks IPs auto-banned by the bot-defense middleware (attacker-probe-
-- path hits, injection-pattern hits). Read on every middleware entry
-- via in-memory-cached lookup; written on probe/injection detections.
--
-- Rows expire 24h after first detection. A repeat offender that hits
-- another probe/injection signature within the window has their row
-- upserted with a refreshed expires_at (UPSERT pattern - see
-- lib/security/ip-deny-list.ts denyIp()).
--
-- The rate-limit pruning cron (NXT-F) will sweep expired rows; until
-- that lands, expired rows linger but isIpDenied() filters them out
-- via the expires_at check both in DB (gt filter) and in the local
-- cache (Date.now() check on cache hit).
--
-- Operator notes:
--   - This table is service-role only; no client code should touch it.
--   - The composite read (every middleware entry) is amortized by an
--     in-memory cache with 60s TTL inside ip-deny-list.ts, so DB load
--     is bounded by ~1 cache refresh / 60s / Edge instance.
--   - signature column is truncated to 500 chars at write time to
--     avoid pathological payloads from malformed signature strings.
--
CREATE TABLE IF NOT EXISTS ip_deny_list (
  ip text PRIMARY KEY,
  reason text NOT NULL,
  signature text NOT NULL,
  hit_count integer NOT NULL DEFAULT 1,
  first_denied_at timestamptz NOT NULL DEFAULT now(),
  last_hit_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ip_deny_list_expires_at
  ON ip_deny_list (expires_at);

COMMENT ON TABLE ip_deny_list IS
  'Auto-populated IP deny list. Middleware checks isIpDenied() at request entry; writes denyIp() on attacker-probe-path / injection-pattern verdicts from lib/security/bot-defense.ts. Rows expire 24h after first detection; the rate-limit pruning cron (NXT-F) cleans expired rows.';

-- RLS: deny all client access; service role only.
ALTER TABLE ip_deny_list ENABLE ROW LEVEL SECURITY;
-- (No policies = effective deny all under RLS; service-role bypasses.)
