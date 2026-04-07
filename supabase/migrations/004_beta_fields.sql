-- Add beta subscriber fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_beta_subscriber boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beta_enrolled_at timestamptz;

-- Track beta purchases (for linking guest purchases to accounts after signup)
CREATE TABLE IF NOT EXISTS beta_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  stripe_customer_id text NOT NULL,
  stripe_payment_intent_id text,
  claimed boolean DEFAULT false,
  claimed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Only service role can access beta_purchases
ALTER TABLE beta_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON beta_purchases FOR ALL USING (false);
