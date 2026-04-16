-- ============================================================
-- Migration 019: Platform admin roles + impersonation sessions
-- ============================================================
-- Replaces the hardcoded ADMIN_EMAILS list in lib/admin.ts with a
-- DB-backed role table so allowlist can be managed from the admin UI.
-- Two roles:
--   developer — full write impersonation, can add/remove admins
--   support   — read-only impersonation, investigative access
-- impersonation_sessions stores active "view as" sessions keyed to a
-- server-side UUID (cookie only carries the session id, not a signed
-- claim — tight revocation, no JWT reuse).

CREATE TABLE platform_admins (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('developer', 'support')),
  added_by text,
  added_at timestamptz DEFAULT now()
);

CREATE INDEX platform_admins_email_idx ON platform_admins (lower(email));

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_admins service only" ON platform_admins
  FOR ALL
  USING (false);

INSERT INTO platform_admins (email, role, added_by) VALUES
  ('isaac@dibbenterprizes.com', 'developer', 'system'),
  ('oscar@regenportal.com', 'support', 'system');

CREATE TABLE impersonation_sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  admin_email text NOT NULL,
  target_user_id uuid NOT NULL,
  target_email text,
  mode text NOT NULL CHECK (mode IN ('read', 'write')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX impersonation_sessions_admin_idx ON impersonation_sessions (admin_user_id);
CREATE INDEX impersonation_sessions_expires_idx ON impersonation_sessions (expires_at);

ALTER TABLE impersonation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impersonation_sessions service only" ON impersonation_sessions
  FOR ALL
  USING (false);
