-- ============================================================
-- Migration 018: Indexes for compliance library scale
-- ============================================================
-- The library / scan routes filter on applies_to, category, risk_level,
-- and source_type. These were unindexed so filtered queries did full
-- table scans. Safe at current row counts; this future-proofs them.

CREATE INDEX IF NOT EXISTS compliance_rules_applies_to_idx
  ON compliance_rules USING gin (applies_to);

CREATE INDEX IF NOT EXISTS compliance_rules_category_idx
  ON compliance_rules (category);

CREATE INDEX IF NOT EXISTS compliance_rules_risk_level_idx
  ON compliance_rules (risk_level);

CREATE INDEX IF NOT EXISTS compliance_rules_created_at_idx
  ON compliance_rules (created_at DESC);
