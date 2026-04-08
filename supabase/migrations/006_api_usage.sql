-- API usage tracking for cost monitoring
CREATE TABLE IF NOT EXISTS api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  model text NOT NULL,
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  estimated_cost_cents integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON api_usage FOR ALL USING (false);

CREATE INDEX idx_api_usage_user ON api_usage (user_id, created_at DESC);
CREATE INDEX idx_api_usage_date ON api_usage (created_at DESC);

-- Scan result caching
ALTER TABLE scans ADD COLUMN IF NOT EXISTS content_hash text;
CREATE INDEX idx_scans_content_hash ON scans (profile_id, content_hash, created_at DESC);
