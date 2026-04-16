-- ============================================================
-- Migration 017: Atomic rate-limit increment RPC
-- ============================================================
-- Replaces the non-atomic read-then-update pattern in lib/rate-limit.ts
-- so concurrent requests cannot both observe count=N and both write N+1.

CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_key text,
  p_window_ms integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_now timestamptz := now();
  v_expires_at timestamptz := v_now + make_interval(secs => p_window_ms / 1000.0);
BEGIN
  INSERT INTO rate_limits (key, count, expires_at)
  VALUES (p_key, 1, v_expires_at)
  ON CONFLICT (key) DO UPDATE
  SET
    count = CASE
      WHEN rate_limits.expires_at < v_now THEN 1
      ELSE rate_limits.count + 1
    END,
    expires_at = CASE
      WHEN rate_limits.expires_at < v_now THEN v_expires_at
      ELSE rate_limits.expires_at
    END
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_rate_limit(text, integer) TO authenticated, anon, service_role;

CREATE INDEX IF NOT EXISTS rate_limits_key_idx ON rate_limits (key);
