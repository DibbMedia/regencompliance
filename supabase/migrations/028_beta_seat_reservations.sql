-- Atomic beta-seat reservation.
--
-- Closes the count-then-create race in /api/stripe/checkout-beta where two
-- parallel requests could both pass the `< BETA_SEAT_LIMIT` check before
-- either's beta_purchases row landed. With 25 founder seats and a marketing
-- push driving traffic, oversell is real - results in awkward refunds and
-- pricing-promise breakage.
--
-- Approach: an RPC wrapped in a transaction-scoped advisory lock.
-- `reserve_beta_seat(token)` atomically counts current beta + active
-- reservations and either inserts a placeholder beta_purchases row (held for
-- 30 min by default) or refuses. The Stripe checkout route then proceeds
-- only on success; the webhook later claims the placeholder by token.

-- 1. Reservation columns on beta_purchases.
ALTER TABLE beta_purchases
  ADD COLUMN IF NOT EXISTS reservation_token uuid UNIQUE,
  ADD COLUMN IF NOT EXISTS reserved_at timestamptz,
  ADD COLUMN IF NOT EXISTS reservation_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_beta_purchases_reservation_expires
  ON beta_purchases(reservation_expires_at)
  WHERE claimed = false;

-- 2. Atomic reservation function.
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
  -- Transaction-scoped advisory lock serializes concurrent reservations.
  -- hashtext is deterministic so every caller hits the same lock key.
  PERFORM pg_advisory_xact_lock(hashtext('beta_seat_reservation'));

  SELECT count(*) INTO v_taken
  FROM profiles
  WHERE is_beta_subscriber = true;

  -- Active reservations: rows that aren't claimed yet and either have no
  -- expiry (legacy webhook-inserted rows) or expire in the future.
  SELECT count(*) INTO v_pending
  FROM beta_purchases
  WHERE claimed = false
    AND (reservation_expires_at IS NULL OR reservation_expires_at > now());

  IF v_taken + v_pending >= p_limit THEN
    RETURN QUERY SELECT false, v_taken, v_pending;
    RETURN;
  END IF;

  INSERT INTO beta_purchases (
    email,
    reservation_token,
    reserved_at,
    reservation_expires_at,
    claimed
  )
  VALUES (
    'pending-' || p_token::text,
    p_token,
    now(),
    now() + make_interval(mins => p_ttl_minutes),
    false
  );

  RETURN QUERY SELECT true, v_taken, v_pending + 1;
END;
$$;

-- 3. Lock the function down. Only the service role should call it; user
--    sessions never need direct access.
REVOKE EXECUTE ON FUNCTION reserve_beta_seat(uuid, integer, integer)
  FROM public, anon, authenticated;
