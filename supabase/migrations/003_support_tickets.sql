CREATE TABLE support_tickets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  status text DEFAULT 'open',
  priority text DEFAULT 'normal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE ticket_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_admin boolean DEFAULT false,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (profile_id = auth.uid());

ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages on own tickets" ON ticket_messages FOR SELECT USING (
  ticket_id IN (SELECT id FROM support_tickets WHERE profile_id = auth.uid())
);
CREATE POLICY "Users can add messages to own tickets" ON ticket_messages FOR INSERT WITH CHECK (
  ticket_id IN (SELECT id FROM support_tickets WHERE profile_id = auth.uid())
);

CREATE INDEX idx_tickets_profile_id ON support_tickets(profile_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
