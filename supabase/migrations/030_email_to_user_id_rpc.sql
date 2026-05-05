-- Scale email -> user_id lookup beyond auth.admin.listUsers' 5000-row cap.
--
-- The Stripe webhook's findAuthUserIdByEmail paginates listUsers up to 25
-- pages of 200 rows. Once the user count crosses 5000, beta-purchase
-- claim-by-email silently fails and the only signal is a console.warn.
-- This function queries auth.users directly via service role, indexed on
-- the email column, so the lookup is O(log n) regardless of user count.

CREATE OR REPLACE FUNCTION find_auth_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT id FROM auth.users
  WHERE lower(email) = lower(p_email)
  LIMIT 1;
$$;

-- Service role only. Anon/authenticated must not be able to enumerate
-- which emails have accounts.
REVOKE EXECUTE ON FUNCTION find_auth_user_id_by_email(text) FROM public, anon, authenticated;
