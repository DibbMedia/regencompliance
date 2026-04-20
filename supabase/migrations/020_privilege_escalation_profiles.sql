-- ============================================================
-- Migration 020: Privilege-escalation guard on profiles
-- ============================================================
-- Blocks users from updating sensitive fields on their own profile
-- (subscription_status, stripe_*, is_beta_subscriber, badge_id).
-- Only service_role (Stripe webhook, server routes) or a platform_admin
-- may mutate these fields. Prevents a user from self-granting an
-- "active" subscription and bypassing the paywall.

CREATE OR REPLACE FUNCTION enforce_profile_field_guard()
RETURNS TRIGGER AS $$
DECLARE
  caller_role text;
  is_admin boolean;
BEGIN
  caller_role := current_setting('role', true);

  IF caller_role = 'service_role' OR caller_role = 'postgres' THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM platform_admins pa
    WHERE lower(pa.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ) INTO is_admin;

  IF is_admin THEN
    RETURN NEW;
  END IF;

  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
     OR NEW.is_beta_subscriber IS DISTINCT FROM OLD.is_beta_subscriber
     OR NEW.beta_enrolled_at IS DISTINCT FROM OLD.beta_enrolled_at
     OR NEW.badge_id IS DISTINCT FROM OLD.badge_id THEN
    RAISE EXCEPTION
      'Protected profile field cannot be updated directly (subscription_status, stripe_*, is_beta_subscriber, beta_enrolled_at, badge_id). Contact support.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS profiles_field_guard ON profiles;
CREATE TRIGGER profiles_field_guard
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_profile_field_guard();
