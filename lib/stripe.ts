import Stripe from "stripe"

// Prefer the Restricted Key when set; fall back to the full Secret Key.
// During Stripe-key rotation, STRIPE_RESTRICTED_KEY is added first, verified on
// Preview + Production, then STRIPE_SECRET_KEY is revoked. See
// docs/stripe-restricted-key-setup.md for the full procedure.
const stripeKey =
  process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY
if (!stripeKey) {
  throw new Error(
    "Missing Stripe key: set STRIPE_RESTRICTED_KEY (preferred) or STRIPE_SECRET_KEY",
  )
}

export const stripe = new Stripe(stripeKey, {
  typescript: true,
})
