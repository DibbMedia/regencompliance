-- ============================================================
-- Migration 042: Pre-auth lead encryption cutover (Phase 6 end)
-- ============================================================
-- Cutover step for Phase 6 of docs/user-level-encryption-plan.md.
--
-- Mig 041 added the *_enc companion columns and dropped the
-- unique constraints. By the time this migration runs:
--   - scripts/backfill-leads.ts has populated every existing
--     plaintext row's *_enc counterpart
--   - every route + repo has switched to encrypted-only writes
--   - the reserve_beta_seat RPC stops writing to `email`
--
-- This migration:
--   (1) replaces reserve_beta_seat so it no longer references
--       beta_purchases.email (the column is about to vanish)
--   (2) drops every plaintext column listed in plan §4 + §12.7
--
-- Idempotent: all drops use IF EXISTS.

-- Reservation rows are placeholders before checkout completes - they have no
-- stripe_customer_id until the webhook attaches it. NOT NULL was a latent bug
-- in mig 028 (the RPC inserts without setting it); dropping the constraint
-- lines the schema up with the real flow.
ALTER TABLE beta_purchases ALTER COLUMN stripe_customer_id DROP NOT NULL;

-- ─── (1) reserve_beta_seat: drop the email-column reference ───
-- The pre-encryption version inserted email='pending-<token>' as a
-- sentinel. Post-encryption the placeholder is no longer needed -
-- callers identify the row by reservation_token (UNIQUE, plaintext).
-- email_enc stays NULL until the Stripe webhook attaches the real
-- customer email after checkout.session.completed.
CREATE OR REPLACE FUNCTION reserve_beta_seat(
  p_token uuid,
  p_limit integer DEFAULT 25,
  p_ttl_minutes integer DEFAULT 30
)
RETURNS TABLE(reserved boolean, taken_count integer, pending_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_taken integer;
  v_pending integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('beta_seat_reservation'));

  SELECT count(*) INTO v_taken
  FROM profiles
  WHERE is_beta_subscriber = true;

  SELECT count(*) INTO v_pending
  FROM beta_purchases
  WHERE claimed = false
    AND (reservation_expires_at IS NULL OR reservation_expires_at > now());

  IF v_taken + v_pending >= p_limit THEN
    RETURN QUERY SELECT false, v_taken, v_pending;
    RETURN;
  END IF;

  INSERT INTO beta_purchases (
    reservation_token,
    reserved_at,
    reservation_expires_at,
    claimed
  )
  VALUES (
    p_token,
    now(),
    now() + make_interval(mins => p_ttl_minutes),
    false
  );

  RETURN QUERY SELECT true, v_taken, v_pending + 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION reserve_beta_seat(uuid, integer, integer)
  FROM public, anon, authenticated;

-- ─── (2) Drop plaintext columns ───

-- waitlist
ALTER TABLE waitlist DROP COLUMN IF EXISTS email;
ALTER TABLE waitlist DROP COLUMN IF EXISTS name;
ALTER TABLE waitlist DROP COLUMN IF EXISTS ip_address;
ALTER TABLE waitlist DROP COLUMN IF EXISTS user_agent;

-- beta_applications
ALTER TABLE beta_applications DROP COLUMN IF EXISTS name;
ALTER TABLE beta_applications DROP COLUMN IF EXISTS email;
ALTER TABLE beta_applications DROP COLUMN IF EXISTS clinic_name;
ALTER TABLE beta_applications DROP COLUMN IF EXISTS specialty;
ALTER TABLE beta_applications DROP COLUMN IF EXISTS role;
ALTER TABLE beta_applications DROP COLUMN IF EXISTS website;
ALTER TABLE beta_applications DROP COLUMN IF EXISTS monthly_volume;
ALTER TABLE beta_applications DROP COLUMN IF EXISTS why_apply;
ALTER TABLE beta_applications DROP COLUMN IF EXISTS ip_address;
ALTER TABLE beta_applications DROP COLUMN IF EXISTS user_agent;

-- free_audit_leads
ALTER TABLE free_audit_leads DROP COLUMN IF EXISTS email;
ALTER TABLE free_audit_leads DROP COLUMN IF EXISTS website_url;
ALTER TABLE free_audit_leads DROP COLUMN IF EXISTS page_title;
ALTER TABLE free_audit_leads DROP COLUMN IF EXISTS ip_address;
ALTER TABLE free_audit_leads DROP COLUMN IF EXISTS user_agent;
ALTER TABLE free_audit_leads DROP COLUMN IF EXISTS flags;

-- newsletter_subscribers
ALTER TABLE newsletter_subscribers DROP COLUMN IF EXISTS email;
ALTER TABLE newsletter_subscribers DROP COLUMN IF EXISTS ip_address;
ALTER TABLE newsletter_subscribers DROP COLUMN IF EXISTS user_agent;

-- beta_purchases
ALTER TABLE beta_purchases DROP COLUMN IF EXISTS email;
