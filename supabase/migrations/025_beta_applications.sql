-- Beta-tester applications: a more selective intake than the public waitlist.
-- Asks for clinic context so we can pick the first 25 founders deliberately
-- instead of going first-come-first-served like /waitlist.
CREATE TABLE IF NOT EXISTS beta_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  clinic_name text NOT NULL,
  specialty text NOT NULL,
  role text NOT NULL,
  website text,
  monthly_volume text NOT NULL,
  why_apply text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  -- Founder-beta participation contract: applicant must agree to active use,
  -- monthly Zoom check-ins, and feedback via support tickets in exchange for
  -- $297/mo locked for life. Failure to participate forfeits founder pricing.
  accepted_terms_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  source text DEFAULT 'website',
  notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE beta_applications ENABLE ROW LEVEL SECURITY;

-- Service-role only. Mirrors the waitlist policy: no anon/authenticated access.
CREATE POLICY "Service role only" ON beta_applications FOR ALL USING (false);

CREATE INDEX IF NOT EXISTS idx_beta_applications_email ON beta_applications (email);
CREATE INDEX IF NOT EXISTS idx_beta_applications_created_at ON beta_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_applications_status ON beta_applications (status);
