ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_checklist jsonb DEFAULT '{}';
