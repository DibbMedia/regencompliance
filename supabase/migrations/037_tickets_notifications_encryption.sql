-- Wave 2C / Phase 4 — add *_enc columns to support_tickets, ticket_messages,
-- and notifications. Dual-write transition: plaintext columns stay until 038.
--
-- All columns are nullable + IF NOT EXISTS so the migration is safe to re-run
-- and so the deploy can roll out before the repo backfill finishes.

-- support_tickets.subject -> subject_enc
ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS subject_enc TEXT;

-- Relax the NOT NULL on the legacy plaintext column so repo inserts that only
-- write subject_enc don't fail before 038 drops it.
ALTER TABLE support_tickets
  ALTER COLUMN subject DROP NOT NULL;

-- ticket_messages: denormalize profile_id (so the row carries its tenant key
-- without an extra join) + add message_enc.
ALTER TABLE ticket_messages
  ADD COLUMN IF NOT EXISTS profile_id UUID;

ALTER TABLE ticket_messages
  ADD COLUMN IF NOT EXISTS message_enc TEXT;

-- Relax NOT NULL on the legacy plaintext column.
ALTER TABLE ticket_messages
  ALTER COLUMN message DROP NOT NULL;

-- Backfill profile_id from the parent ticket. Idempotent: only fills NULLs.
UPDATE ticket_messages
SET profile_id = (
  SELECT profile_id
  FROM support_tickets
  WHERE support_tickets.id = ticket_messages.ticket_id
)
WHERE profile_id IS NULL;

-- Index on the new tenant key so per-tenant queries stay cheap once we add
-- WHERE profile_id = ... filters in the repos.
CREATE INDEX IF NOT EXISTS idx_ticket_messages_profile_id
  ON ticket_messages(profile_id);

-- notifications: add envelope columns for title, body, action_url.
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS title_enc TEXT;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS body_enc TEXT;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS action_url_enc TEXT;

-- Relax NOT NULL on the legacy plaintext columns (action_url was already
-- nullable; title and body were NOT NULL).
ALTER TABLE notifications
  ALTER COLUMN title DROP NOT NULL;

ALTER TABLE notifications
  ALTER COLUMN body DROP NOT NULL;
