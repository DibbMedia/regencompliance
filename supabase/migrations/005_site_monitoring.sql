-- Add source_url to scans table for URL scanning
ALTER TABLE scans ADD COLUMN IF NOT EXISTS source_url text;

-- Monitored sites
CREATE TABLE IF NOT EXISTS monitored_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain text NOT NULL,
  name text,
  is_active boolean DEFAULT true,
  crawl_frequency text DEFAULT 'weekly',
  last_crawl_at timestamptz,
  next_crawl_at timestamptz,
  total_pages integer DEFAULT 0,
  avg_compliance_score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE monitored_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sites" ON monitored_sites
  FOR ALL USING (profile_id = auth.uid());

-- Site pages (individual URLs within a site)
CREATE TABLE IF NOT EXISTS site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES monitored_sites(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  compliance_score integer,
  flag_count integer DEFAULT 0,
  high_risk_count integer DEFAULT 0,
  medium_risk_count integer DEFAULT 0,
  low_risk_count integer DEFAULT 0,
  last_scan_id uuid REFERENCES scans(id),
  last_scanned_at timestamptz,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own site pages" ON site_pages
  FOR ALL USING (site_id IN (SELECT id FROM monitored_sites WHERE profile_id = auth.uid()));

-- Index for weekly cron lookups
CREATE INDEX idx_monitored_sites_next_crawl ON monitored_sites (next_crawl_at) WHERE is_active = true;
