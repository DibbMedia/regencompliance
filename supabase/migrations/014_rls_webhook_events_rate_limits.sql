-- Fix: enable RLS on webhook_events and rate_limits tables
-- These are internal tables accessed only by service role

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT/UPDATE policies needed — service role bypasses RLS

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT/UPDATE policies needed — service role bypasses RLS
