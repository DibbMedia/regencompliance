-- Audit log for SOC2 compliance
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  status text DEFAULT 'success',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON audit_log FOR ALL USING (false);

CREATE INDEX idx_audit_log_user ON audit_log (user_id, created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log (action, created_at DESC);
CREATE INDEX idx_audit_log_date ON audit_log (created_at DESC);

-- Webhook event dedup table (for idempotency)
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz DEFAULT now()
);

CREATE INDEX idx_webhook_events_date ON webhook_events (processed_at DESC);

-- Add UNIQUE constraint on beta_purchases (skip if exists)
DO $$ BEGIN
  ALTER TABLE beta_purchases ADD CONSTRAINT unique_beta_stripe_customer UNIQUE (stripe_customer_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
