-- ============================================================
-- PREREQUISITE migrations 010 + 011 + 023
-- ============================================================
--
-- Apply this BEFORE the encryption bundle (MIGRATIONS-033-041-BUNDLE.sql).
--
-- These two tables were missing from prod (diagnostic on 2026-05-13):
--   * waitlist               — pre-release waitlist (mig 010 + 011)
--   * newsletter_subscribers — blog email capture (mig 023; memory note
--                              from 2026-04-22 flagged it as pending)
--
-- Idempotent (every CREATE / ALTER uses IF NOT EXISTS, every CREATE POLICY
-- is paired with DROP POLICY IF EXISTS). Safe to rerun. Wrapped in a single
-- transaction so it's all-or-nothing.
--
-- After this commits, paste docs/ops/MIGRATIONS-033-041-BUNDLE.sql.

BEGIN;

-- ============================================================
-- Migration 010 — waitlist
-- ============================================================

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  source text DEFAULT 'website',
  ip_address text,
  user_agent text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only" ON waitlist;
CREATE POLICY "Service role only" ON waitlist FOR ALL USING (false);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist (email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist (created_at DESC);


-- ============================================================
-- Migration 011 — waitlist launch_email_sent_at
-- ============================================================

ALTER TABLE waitlist
  ADD COLUMN IF NOT EXISTS launch_email_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_waitlist_launch_email_pending
  ON waitlist (created_at)
  WHERE launch_email_sent_at IS NULL;


-- ============================================================
-- Migration 023 — newsletter_subscribers
-- ============================================================

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


COMMIT;
