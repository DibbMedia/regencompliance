-- CUTOVER -- apply after backfill + stable Wave 2C deploy.
--
-- Drops the plaintext columns that were superseded by *_enc envelopes in
-- migration 037. Do NOT run this until:
--   1. scripts/backfill-tickets-notifications.ts has finished on prod
--   2. The Wave 2C deploy has been stable for at least one rotation window
--   3. No read path still falls back to the plaintext columns

ALTER TABLE support_tickets
  DROP COLUMN IF EXISTS subject;

ALTER TABLE ticket_messages
  DROP COLUMN IF EXISTS message;

ALTER TABLE notifications
  DROP COLUMN IF EXISTS title;

ALTER TABLE notifications
  DROP COLUMN IF EXISTS body;

ALTER TABLE notifications
  DROP COLUMN IF EXISTS action_url;
