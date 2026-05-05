-- Pre-beta security hardening (May 2026 audit pass).
-- Three independent fixes bundled into one migration so they ship together:
--
--   (1) Revoke increment_rate_limit RPC from anon/authenticated. The RPC
--       was granted to anon in migration 017 to allow the demo flow to
--       self-throttle; in practice every caller already uses the service
--       role client, so the public grant only enabled key-poisoning attacks
--       (e.g. anon could call increment_rate_limit('login:victim@x.com', 900000)
--       five times to lock out arbitrary accounts).
--
--   (2) beta_purchases.claimed_by FK gets ON DELETE SET NULL. Previously the
--       default NO ACTION caused account-delete to FK-fail for any user who
--       had claimed a beta seat, breaking GDPR right-to-erasure.
--
--   (3) Extend RLS on monitored_sites, site_pages, support_tickets,
--       ticket_messages, and profiles SELECT/UPDATE to allow accepted team
--       members to read/write their owner's resources. Migration 024 added
--       similar policies for scans + notifications but missed every other
--       per-workspace table, so invited team members saw an empty UI.

-- (1) RPC permission revoke
REVOKE EXECUTE ON FUNCTION increment_rate_limit(text, integer) FROM anon, authenticated;

-- (2) beta_purchases FK fix
ALTER TABLE beta_purchases DROP CONSTRAINT IF EXISTS beta_purchases_claimed_by_fkey;
ALTER TABLE beta_purchases
  ADD CONSTRAINT beta_purchases_claimed_by_fkey
  FOREIGN KEY (claimed_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- (3) Team-member RLS extensions.
-- The pattern used everywhere: profile_id matches the acting user OR the
-- acting user has an accepted team_members row pointing at that profile.

-- profiles: owner reads + accepted team members read; updates stay owner-only.
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (
  auth.uid() = id
  OR id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() AND accepted = true LIMIT 1)
);

-- monitored_sites: owner + team
DROP POLICY IF EXISTS "Users can view own monitored sites" ON monitored_sites;
CREATE POLICY "Users can view own monitored sites" ON monitored_sites FOR SELECT USING (
  profile_id = auth.uid()
  OR profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() AND accepted = true LIMIT 1)
);

DROP POLICY IF EXISTS "Users can insert own monitored sites" ON monitored_sites;
CREATE POLICY "Users can insert own monitored sites" ON monitored_sites FOR INSERT WITH CHECK (
  profile_id = auth.uid()
  OR profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() AND accepted = true LIMIT 1)
);

DROP POLICY IF EXISTS "Users can update own monitored sites" ON monitored_sites;
CREATE POLICY "Users can update own monitored sites" ON monitored_sites FOR UPDATE USING (
  profile_id = auth.uid()
  OR profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() AND accepted = true LIMIT 1)
);

DROP POLICY IF EXISTS "Users can delete own monitored sites" ON monitored_sites;
CREATE POLICY "Users can delete own monitored sites" ON monitored_sites FOR DELETE USING (
  profile_id = auth.uid()
  OR profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() AND accepted = true LIMIT 1)
);

-- site_pages: owner + team (joined through monitored_sites.profile_id)
DROP POLICY IF EXISTS "Users can view own site pages" ON site_pages;
CREATE POLICY "Users can view own site pages" ON site_pages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM monitored_sites m
    WHERE m.id = site_pages.site_id
      AND (
        m.profile_id = auth.uid()
        OR m.profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() AND accepted = true LIMIT 1)
      )
  )
);

DROP POLICY IF EXISTS "Users can manage own site pages" ON site_pages;
CREATE POLICY "Users can manage own site pages" ON site_pages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM monitored_sites m
    WHERE m.id = site_pages.site_id
      AND (
        m.profile_id = auth.uid()
        OR m.profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() AND accepted = true LIMIT 1)
      )
  )
);

-- support_tickets: owner + team
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (
  profile_id = auth.uid()
  OR profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() AND accepted = true LIMIT 1)
);

DROP POLICY IF EXISTS "Users can create own tickets" ON support_tickets;
CREATE POLICY "Users can create own tickets" ON support_tickets FOR INSERT WITH CHECK (
  profile_id = auth.uid()
  OR profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() AND accepted = true LIMIT 1)
);

-- ticket_messages: owner + team (joined through support_tickets.profile_id)
-- NOTE: WITH CHECK pins is_admin = false to prevent users from impersonating
-- admin replies on their own tickets (medium-severity finding from May audit).
DROP POLICY IF EXISTS "Users can view own ticket messages" ON ticket_messages;
CREATE POLICY "Users can view own ticket messages" ON ticket_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM support_tickets t
    WHERE t.id = ticket_messages.ticket_id
      AND (
        t.profile_id = auth.uid()
        OR t.profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() AND accepted = true LIMIT 1)
      )
  )
);

DROP POLICY IF EXISTS "Users can add messages to own tickets" ON ticket_messages;
CREATE POLICY "Users can add messages to own tickets" ON ticket_messages FOR INSERT WITH CHECK (
  is_admin = false
  AND EXISTS (
    SELECT 1 FROM support_tickets t
    WHERE t.id = ticket_messages.ticket_id
      AND (
        t.profile_id = auth.uid()
        OR t.profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() AND accepted = true LIMIT 1)
      )
  )
);
