# Stripe Restricted API Key — setup + rotation

Replace the full-scope **Secret Key** currently in Vercel with a **Restricted Key** scoped to only what RegenCompliance actually uses. Biggest single blast-radius reduction left on the security checklist.

## Why this matters

The Secret Key (`sk_live_...`) gives full control of your Stripe account — create/modify/delete customers, refund any charge, read all PII, cancel any subscription, issue new Connect accounts, access Connect balances, etc. A compromised Secret Key is an account-takeover.

A Restricted Key (`rk_live_...`) is scoped to specific resources and permissions. If compromised, the blast radius is bounded to what the key can do. The app still works; the key just can't do anything the app doesn't need.

## Exact Stripe operations the app performs

Inventoried across all 5 `app/api/stripe/*/route.ts` files + `app/api/user/delete/route.ts`:

| Operation | File | Permission needed |
| --- | --- | --- |
| `stripe.webhooks.constructEvent` | `app/api/stripe/webhook/route.ts:44` | **None** — uses `STRIPE_WEBHOOK_SECRET`, not API key |
| `stripe.checkout.sessions.create` (3 call sites) | `checkout/route.ts:39`, `checkout-guest/route.ts:30`, `checkout-beta/route.ts:65` | **Checkout Sessions: Write** |
| `stripe.checkout.sessions.retrieve` | `webhook/route.ts:119` | **Checkout Sessions: Read** (included with Write) |
| `stripe.customers.create` | `checkout/route.ts:27` | **Customers: Write** |
| `stripe.customers.retrieve` (5 call sites) | `webhook/route.ts:229, 282, 385, 438` | **Customers: Read** (included with Write) |
| `stripe.subscriptions.cancel` | `app/api/user/delete/route.ts:50` | **Subscriptions: Write** |
| `stripe.billingPortal.sessions.create` | `portal/route.ts:41` | **Billing Portal Sessions: Write** |
| Checkout `line_items: [{ price }]` validation | `checkout/*`, `checkout-beta/*` | **Prices: Read** |
| Stripe server-side product linkage | implicit | **Products: Read** |

## Minimal permissions set

Check exactly these in the Stripe Restricted Key creation form. Leave everything else as `None`.

### Core resources

| Resource (current Stripe UI label) | Permission |
| --- | --- |
| **Checkout Sessions** | Write |
| **Customers** | Write |
| **Subscriptions** | Write |
| **Customer portal** (API name: `billingPortal.sessions`) | Write |
| **Prices** | Read |
| **Products** | Read |

Note: Stripe renamed "Billing Portal Sessions" to "Customer portal" in
the restricted-key UI at some point. The API call in `lib/stripe.ts`
(`stripe.billingPortal.sessions.create`) is unchanged.

### Everything else — `None`

Explicit `None` for: Balance, Balance Transactions, Cash Balances, Charges, Credit Notes, Disputes, Files, Invoice Items, Invoices, Mandates, Payment Intents, Payment Links, Payment Methods, Payouts, Plans, Promotion Codes, Quotes, Refunds, Setup Attempts, Setup Intents, Shipping Rates, Sigma, Sources, Subscription Items, Subscription Schedules, Tax Codes, Tax IDs, Tax Rates, Test Clocks, Tokens, Topups, Transfers, Webhook Endpoints, Billing Alerts, Billing Meter Event Summaries, Billing Meter Events, Billing Meters, any Climate, Financial Connections, Identity, Issuing, Treasury, Terminal, Connect, Apps, Entitlements, Forwarding, Tax (any).

If the app later adds a feature needing one of these, add it at that point — not preemptively.

## Create the key (Stripe dashboard steps)

1. Stripe dashboard → **Developers → API keys → Restricted keys → Create restricted key**.
2. **Name:** `RegenCompliance production` (or similar; this name appears in API-call logs).
3. Uncheck **Allow this key to perform any action** if it's on.
4. For each resource listed above, set the permission to the value above. Use Stripe's filter to find them fast.
5. Click **Create key**.
6. Copy the `rk_live_...` value. This is only shown once.

## Rotate into Vercel

Two-stage rotation so you never have zero working keys.

### Stage 1 — add restricted key as new var (non-breaking)

1. Vercel → **regencompliance** → **Settings → Environment Variables**.
2. Add a new variable:
   - **Name:** `STRIPE_RESTRICTED_KEY` (temporary)
   - **Value:** the `rk_live_...` from step 6 above
   - **Environment:** Preview only
   - **Type:** Sensitive
3. Edit `lib/stripe.ts`:

```ts
import Stripe from "stripe"

// Prefer the restricted key when set; fall back to the full Secret Key.
// After the swap-in period, remove STRIPE_SECRET_KEY and this fallback.
export const stripe = new Stripe(
  process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY!,
  { apiVersion: "2025-09-30.clover" },  // or whatever apiVersion lib/stripe.ts uses
)
```

4. Push; verify Preview deploy. Run an end-to-end check on the Preview URL:
   - Guest checkout from `/pricing` → hits `stripe.checkout.sessions.create`
   - Log in → manage billing → `stripe.billingPortal.sessions.create`
   - Trigger a test webhook from Stripe dashboard → `stripe.checkout.sessions.retrieve` + `stripe.customers.retrieve`
   - Delete-account flow → `stripe.subscriptions.cancel`

If any call 403s, you're missing a permission. Find the missing one in the API-call log in Stripe dashboard → **Developers → API logs**, look for `403 Forbidden`, the error message names the missing permission. Add it to the restricted key, retest.

### Stage 2 — promote to Production

Once Preview is green:

1. Vercel → Settings → Environment Variables.
2. Edit `STRIPE_RESTRICTED_KEY` → check **Production** checkbox too. Save.
3. Redeploy Production (or wait for next push).
4. Hit the same end-to-end paths on production. Check Stripe API logs to confirm calls are now using `rk_live_...` (visible in the log's "API key" column).

### Stage 3 — revoke the full Secret Key

Only do this after 48 hours of clean production logs on the restricted key.

1. Stripe dashboard → **Developers → API keys**.
2. Next to the existing live Secret Key, click **Roll key** → **Reveal** → confirm.
3. The old key is now invalid. In Vercel, remove the `STRIPE_SECRET_KEY` env var (or leave it unset).
4. Simplify `lib/stripe.ts` back to just the restricted key:

```ts
export const stripe = new Stripe(process.env.STRIPE_RESTRICTED_KEY!, {
  apiVersion: "2025-09-30.clover",
})
```

## Rollback procedure if things break

At any stage, if a checkout or billing flow fails:

1. In Vercel, unset `STRIPE_RESTRICTED_KEY` (or flip it to non-Production environments).
2. The fallback `process.env.STRIPE_SECRET_KEY!` in `lib/stripe.ts` takes over.
3. Rebuild Production.
4. Check Stripe API logs for the exact 403 message; add the missing permission to the restricted key.
5. Re-enable `STRIPE_RESTRICTED_KEY` on Production, redeploy.

Never leave both env vars permanently set after Stage 3 — the fallback path is transitional.

## Post-rotation checklist

- [ ] Restricted key created with exactly the 6 resource permissions above.
- [ ] End-to-end checkout flow tested on Preview with restricted key.
- [ ] End-to-end billing portal flow tested.
- [ ] Webhook handler tested (Stripe dashboard → test-send a `checkout.session.completed` and a `customer.subscription.deleted`).
- [ ] Delete-account flow tested (cancels subscription via restricted key).
- [ ] 48 hours of clean production logs on restricted key.
- [ ] Old Secret Key rolled / revoked.
- [ ] `STRIPE_SECRET_KEY` env var removed from Vercel.
- [ ] `lib/stripe.ts` simplified to restricted-key-only.
- [ ] This doc moved to a "done" folder OR the Stripe dashboard Restricted Key note updated with the date.

## Webhook signing secret — unrelated, already in place

Don't confuse the restricted API key with the webhook signing secret (`whsec_...`). The signing secret is a separate value used by `stripe.webhooks.constructEvent` to verify that incoming webhook events actually came from Stripe. It's in `STRIPE_WEBHOOK_SECRET` and is already correctly configured and verified in `app/api/stripe/webhook/route.ts:44-48`. Do not touch it when rotating the API key.
