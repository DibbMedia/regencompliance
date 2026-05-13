-- CUTOVER MIGRATION — apply only after backfill-profiles.ts has run and the
-- Wave 2A deploy is stable in prod.
--
-- Drops the plaintext companions added in migration 033 for the Phase 2
-- encryption rollout (docs/user-level-encryption-plan.md §4 + §12.7).
--
-- Pre-flight checklist before applying:
--   1. `npx tsx scripts/backfill-profiles.ts` has finished without errors.
--   2. Spot-check: SELECT COUNT(*) FROM profiles WHERE clinic_name IS NOT NULL
--      AND clinic_name_enc IS NULL; -- must be 0
--      SELECT COUNT(*) FROM team_members WHERE email IS NOT NULL
--      AND email_enc IS NULL; -- must be 0
--   3. Wave 2A code (this branch) deployed to prod and stable for 24+ hours.
--   4. Application code reads only the `_enc` columns (the read-time
--      plaintext fallback in lib/repos/profiles.ts + lib/repos/team-members.ts
--      becomes a no-op after this migration runs and is removed in a later
--      cleanup commit).
--
-- After applying:
--   - The legacy plaintext fallback paths in the repos become dead code; a
--     follow-up commit can remove them.
--   - profiles.treatments and team_members.email lookups via SQL die. Admin
--     search dies per plan §12.6 — pivot to auth.users.email or user_id.

ALTER TABLE profiles
  DROP COLUMN IF EXISTS clinic_name;

ALTER TABLE profiles
  DROP COLUMN IF EXISTS treatments;

ALTER TABLE team_members
  DROP COLUMN IF EXISTS email;
