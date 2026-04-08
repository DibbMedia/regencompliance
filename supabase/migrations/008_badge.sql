-- Badge system: add badge_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badge_id text UNIQUE;
