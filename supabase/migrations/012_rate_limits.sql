-- Persistent rate limiting table (replaces in-memory Maps for Vercel serverless)
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits (expires_at);

-- Cleanup old entries (run periodically via pg_cron or Supabase cron)
-- DELETE FROM rate_limits WHERE expires_at < NOW();
