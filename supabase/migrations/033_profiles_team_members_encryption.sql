-- Phase 2 (Wave 2A) of the user-level encryption rollout.
--
-- Per docs/user-level-encryption-plan.md §4 + §12.7 + §12.8, this migration
-- adds the encrypted-companion columns alongside the existing plaintext
-- columns so the app can dual-state read during the cutover window. The
-- plaintext columns STAY in place; migration 034 drops them after the
-- backfill (scripts/backfill-profiles.ts) is verified and the Wave 2A
-- deploy is stable in prod.
--
-- Encrypted columns store the v1u. envelope from lib/crypto.encryptForUser,
-- bound to AAD `${table}:${column}:${row_id}`.
--
-- profiles:
--   clinic_name_enc TEXT - per-user DEK envelope of profiles.clinic_name
--   treatments_enc  TEXT - per-user DEK envelope of JSON-serialized treatments[]
--
-- team_members:
--   email_enc TEXT - per-user DEK envelope (tenant = profile_id) of
--                    team_members.email; AAD rowId is the team_members.id
--                    so swapping ciphertext between seats fails decrypt.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS clinic_name_enc TEXT;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS treatments_enc TEXT;

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS email_enc TEXT;
