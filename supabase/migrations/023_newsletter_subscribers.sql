-- ============================================================
-- Migration 023: Newsletter subscribers (blog email capture)
-- ============================================================
-- Separate from waitlist: waitlist gates pre-launch access,
-- newsletter is ongoing blog/content updates. Both coexist
-- so a user can be on one, the other, or both.
--
-- Service-role-only RLS. All writes go through
-- app/api/newsletter/route.ts with explicit rate limiting.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text DEFAULT 'blog',
  source_slug text,
  ip_address text,
  user_agent text,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only" ON newsletter_subscribers;
CREATE POLICY "Service role only"
  ON newsletter_subscribers FOR ALL
  USING (false);

CREATE INDEX IF NOT EXISTS idx_newsletter_email
  ON newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at
  ON newsletter_subscribers (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_active
  ON newsletter_subscribers (created_at DESC)
  WHERE unsubscribed_at IS NULL;
