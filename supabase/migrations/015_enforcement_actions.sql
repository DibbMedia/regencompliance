-- ============================================================
-- Migration 015: enforcement_actions (parent entity for compliance_rules)
-- ============================================================
-- Introduces one-row-per-enforcement-action (FDA warning letter, FDA 483,
-- FTC press release, FTC guidance, DOJ fraud announcement) as the parent
-- entity for compliance_rules. Each rule can optionally reference an action.
-- Phase 2 fields (slug, is_published, social_post_status) are included up
-- front so the blog/social content engine ships without another migration.

-- ============================================================
-- TABLE: enforcement_actions
-- ============================================================
CREATE TABLE enforcement_actions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  source_url text NOT NULL UNIQUE,
  source_type text NOT NULL,
  source_name text NOT NULL,
  source_date date,
  agency text,
  company_name text,
  product_or_treatment text,
  summary text,
  violation_categories text[] DEFAULT '{}',
  rule_count integer DEFAULT 0,
  slug text UNIQUE,
  is_published boolean DEFAULT true,
  social_post_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER enforcement_actions_updated_at
  BEFORE UPDATE ON enforcement_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX enforcement_actions_source_date_idx ON enforcement_actions (source_date DESC);
CREATE INDEX enforcement_actions_source_type_idx ON enforcement_actions (source_type);
CREATE INDEX enforcement_actions_company_idx ON enforcement_actions (company_name);
CREATE INDEX enforcement_actions_is_published_idx ON enforcement_actions (is_published) WHERE is_published = true;

-- ============================================================
-- FK on compliance_rules
-- ============================================================
ALTER TABLE compliance_rules
  ADD COLUMN enforcement_action_id uuid REFERENCES enforcement_actions(id) ON DELETE SET NULL;

CREATE INDEX compliance_rules_enforcement_action_id_idx
  ON compliance_rules (enforcement_action_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE enforcement_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read enforcement actions"
  ON enforcement_actions
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- BACKFILL: group existing compliance_rules by source_url
-- ============================================================
-- MAX(source_date) chosen so each action reflects the most recent rule date
-- associated with its source URL (freshness signal for SEO + cleanliness).

WITH grouped AS (
  SELECT
    source_url,
    MAX(source_name) AS source_name,
    MAX(source_date) AS source_date,
    ARRAY(SELECT DISTINCT unnest(array_agg(category))) AS violation_categories,
    COUNT(*)::int AS rule_count
  FROM compliance_rules
  WHERE source_url IS NOT NULL
  GROUP BY source_url
)
INSERT INTO enforcement_actions (
  source_url,
  source_type,
  source_name,
  source_date,
  agency,
  violation_categories,
  rule_count
)
SELECT
  source_url,
  CASE
    WHEN source_name ILIKE '%FDA Warning%' THEN 'fda_warning'
    WHEN source_name ILIKE '%FDA CBER%'    THEN 'fda_cber'
    WHEN source_name ILIKE '%FDA 483%'     THEN 'fda_483'
    WHEN source_name ILIKE '%FTC Press%'   THEN 'ftc_press'
    WHEN source_name ILIKE '%FTC%'         THEN 'ftc_guidance'
    WHEN source_name ILIKE '%DOJ%'         THEN 'doj_fraud'
    ELSE 'manual'
  END AS source_type,
  source_name,
  source_date,
  CASE
    WHEN source_name ILIKE '%FDA%' THEN 'FDA'
    WHEN source_name ILIKE '%FTC%' THEN 'FTC'
    WHEN source_name ILIKE '%DOJ%' THEN 'DOJ'
    ELSE NULL
  END AS agency,
  violation_categories,
  rule_count
FROM grouped;

UPDATE compliance_rules cr
SET enforcement_action_id = ea.id
FROM enforcement_actions ea
WHERE cr.source_url = ea.source_url;
