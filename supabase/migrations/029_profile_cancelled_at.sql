-- Track explicit cancellation timestamp for the purge-cancelled cron.
--
-- Pre-2026-05-05 the cron deleted users where subscription_status='cancelled'
-- AND profiles.updated_at < cutoff. updated_at is bumped on any profile edit
-- (theme change, clinic name update, admin metadata edit), so:
--   1. Active users who edit anything reset the 30-day deletion clock - safe
--      from accidental delete, but clock effectively never fires for engaged
--      users.
--   2. If subscription_status='cancelled' is ever set incorrectly (Stripe
--      webhook bug, manual admin tweak), 30 days later the cron silently
--      deletes the user with no recovery and no audit trail.
--
-- Fix: explicit `cancelled_at` set by the Stripe cancellation handler;
-- cleared when the subscription reactivates. The cron uses this column for
-- the cutoff and ignores updated_at entirely.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_cancelled_at
  ON profiles(cancelled_at)
  WHERE cancelled_at IS NOT NULL;

-- Backfill: any row already in 'cancelled' status gets cancelled_at = updated_at
-- as a best-effort starting point. Future cancellations stamp this column at
-- webhook time.
UPDATE profiles
SET cancelled_at = updated_at
WHERE subscription_status = 'cancelled' AND cancelled_at IS NULL;
