-- Lead-magnet free-audit leads table.
-- Prospects enter a website URL + email; we run a one-page compliance scan,
-- store the result + their email, and surface a teaser report. The full report
-- (rewrites + all violations) is gated behind beta apply / waitlist.

CREATE TABLE IF NOT EXISTS free_audit_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  website_url text NOT NULL,
  page_title text,
  compliance_score integer,
  flag_count integer,
  high_risk_count integer,
  medium_risk_count integer,
  low_risk_count integer,
  -- Full Claude flag JSON. Lets us re-render the teaser on later visits, and
  -- gives sales context when reaching out to the lead.
  flags jsonb,
  -- Lifecycle of the lead in the sales pipeline.
  status text NOT NULL DEFAULT 'new',
  ip_address text,
  user_agent text,
  source text DEFAULT 'website',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE free_audit_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON free_audit_leads FOR ALL USING (false);

CREATE INDEX IF NOT EXISTS idx_free_audit_leads_email ON free_audit_leads (email);
CREATE INDEX IF NOT EXISTS idx_free_audit_leads_created_at ON free_audit_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_free_audit_leads_status ON free_audit_leads (status);
