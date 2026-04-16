-- ============================================================
-- Migration 016: Fix team_members RLS — close account-takeover hole
-- ============================================================
-- The original policy "Owner can manage team" was FOR ALL with USING
-- (profile_id = auth.uid() OR user_id = auth.uid()). Because WITH CHECK
-- defaults to USING, any authenticated user could INSERT a row with
-- their own user_id and an arbitrary profile_id, then be resolved as a
-- member of the victim's org via effectiveProfileId(). This migration
-- splits the policy: team members can SELECT their own membership,
-- but only the profile owner can INSERT/UPDATE/DELETE. Accepting an
-- invite is done server-side via the service client (bypasses RLS).

DROP POLICY IF EXISTS "Owner can manage team" ON team_members;

CREATE POLICY "Team members can read own membership" ON team_members
  FOR SELECT
  USING (profile_id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Owner can insert team rows" ON team_members
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Owner can update team rows" ON team_members
  FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Owner can delete team rows" ON team_members
  FOR DELETE
  USING (profile_id = auth.uid());
