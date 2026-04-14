-- Per-user read tracking for broadcast notifications (profile_id IS NULL).
-- Personal notifications still use the `read` column on the notifications table.
CREATE TABLE notification_reads (
  notification_id uuid REFERENCES notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamptz DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);

ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reads" ON notification_reads
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reads" ON notification_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_notification_reads_user ON notification_reads(user_id);
