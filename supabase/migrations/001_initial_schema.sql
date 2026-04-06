-- RegenCompliance Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  clinic_name text,
  logo_url text,
  treatments text[] DEFAULT '{}',
  subscription_status text DEFAULT 'inactive',
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  onboarding_complete boolean DEFAULT false,
  theme_preference text DEFAULT 'system',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: team_members
-- ============================================================
CREATE TABLE team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  role text DEFAULT 'member',
  invite_token text UNIQUE,
  accepted boolean DEFAULT false,
  accepted_at timestamptz,
  invited_at timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: compliance_rules
-- ============================================================
CREATE TABLE compliance_rules (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  banned_phrase text NOT NULL,
  banned_phrase_variants text[] DEFAULT '{}',
  compliant_alternative text NOT NULL,
  risk_level text NOT NULL DEFAULT 'medium',
  applies_to text[] DEFAULT '{}',
  category text DEFAULT 'health_claims',
  source_url text,
  source_name text,
  source_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER compliance_rules_updated_at
  BEFORE UPDATE ON compliance_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: scans
-- ============================================================
CREATE TABLE scans (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content_type text NOT NULL DEFAULT 'other',
  original_text text NOT NULL,
  flags jsonb DEFAULT '[]',
  rewritten_text text,
  compliance_score integer,
  flag_count integer DEFAULT 0,
  high_risk_count integer DEFAULT 0,
  medium_risk_count integer DEFAULT 0,
  low_risk_count integer DEFAULT 0,
  scan_duration_ms integer,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'system',
  action_url text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can manage team" ON team_members FOR ALL USING (
  profile_id = auth.uid() OR user_id = auth.uid()
);

ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read rules" ON compliance_rules FOR SELECT TO authenticated USING (true);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scans" ON scans FOR SELECT USING (
  profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)
  OR profile_id = auth.uid()
);
CREATE POLICY "Users can insert own scans" ON scans FOR INSERT WITH CHECK (
  profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)
  OR profile_id = auth.uid()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (
  profile_id IS NULL OR profile_id = auth.uid() OR
  profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)
);
CREATE POLICY "Users can mark notifications read" ON notifications FOR UPDATE USING (
  profile_id = auth.uid() OR
  profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_scans_profile_id ON scans(profile_id);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX idx_compliance_rules_active ON compliance_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_profile_id ON team_members(profile_id);
