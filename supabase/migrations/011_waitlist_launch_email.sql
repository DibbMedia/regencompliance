-- Track when the launch announcement email was delivered to each waitlist entry
ALTER TABLE waitlist
  ADD COLUMN IF NOT EXISTS launch_email_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_waitlist_launch_email_pending
  ON waitlist (created_at)
  WHERE launch_email_sent_at IS NULL;
