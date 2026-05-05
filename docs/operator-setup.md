# Operator setup checklist (pre-beta launch)

This doc is the canonical "things only the user can do in dashboards" list.
All code-side wiring is done; flipping these switches activates each integration.

## 1. GoHighLevel (GHL) workflow webhooks

**Why:** Customer data flows into GHL for marketing sequences (welcome, nurture, recovery, churn). Code is wired but each event silently no-ops until the matching env var holds a webhook URL.

**Where each env var fires from:**

| Env var | Triggered by | Payload includes |
|---|---|---|
| `GHL_WEBHOOK_SIGNUP` | `POST /api/auth/signup` | email, user_id, confirmed_at |
| `GHL_WEBHOOK_BETA_APPLY` | `POST /api/beta-apply` | email, name, company (clinic), specialty, role, website, monthly_volume, why_apply |
| `GHL_WEBHOOK_WAITLIST` | `POST /api/waitlist` (first-time only - duplicates skipped) | email, name |
| `GHL_WEBHOOK_FREE_AUDIT` | Free-audit lead magnet (lander route, when shipped) | email, website_url, score, top_violations |
| `GHL_WEBHOOK_SUBSCRIPTION_ACTIVE` | Stripe `checkout.session.completed` (standard or beta tier) **and** `/auth/callback` claimBetaPurchase | email, company, tier ("beta" or "standard"), monthly_price_cents, stripe_customer_id, stripe_subscription_id |
| `GHL_WEBHOOK_SUBSCRIPTION_CANCELLED` | Stripe `customer.subscription.deleted` | email, company, stripe_customer_id |
| `GHL_WEBHOOK_PAYMENT_FAILED` | Stripe `invoice.payment_failed` | email, company, stripe_customer_id, amount_due_cents |
| `GHL_WEBHOOK_ACCOUNT_DELETED` | `POST /api/user/delete` | email, company |

**Setup steps (per workflow):**

1. In GHL, create a workflow for the event (e.g. "Founder Beta - New Application").
2. Set the **trigger** to `Inbound Webhook`. GHL gives you a webhook URL.
3. Copy the URL into Vercel env (Production + Preview, all environments).
4. Trigger the event once (e.g. submit a test waitlist signup) and verify GHL received it.
5. Build out the workflow steps: tag the contact, send an email, add to a pipeline, etc.

**Notes:**

- Per `CLAUDE.md` Email Policy: transactional + marketing email goes through GHL, not Resend. The code keeps Resend wired (env-gated, currently inert) for the legacy launch-announcement path; everything new should route through GHL.
- `subscription_active` fires for both tiers; the `tier` field on the payload distinguishes ("beta" or "standard"). For founder-beta the event can fire from two paths: the Stripe webhook (when the customer's profile already exists at checkout time) or the `/auth/callback` claim path (when the customer paid before creating their account). Dedup at the GHL workflow level via `stripe_customer_id` since both paths can fire for the same customer.
- All GHL calls are fire-and-forget with a 5-second timeout. They never block the user-facing flow.
- Custom field mapping: GHL workflows can read any field from the payload. Map `name`/`first_name`/`last_name`/`company`/`phone` to GHL contact properties; everything else goes into custom fields.

## 2. Stripe (triple-check)

**Status:** code is solid. Operator needs to verify dashboard state matches.

**Code audit — verified OK as of 2026-05-05:**

- Webhook signature verification: `app/api/stripe/webhook/route.ts:44` uses `stripe.webhooks.constructEvent` (constant-time internally).
- Replay window: 60min on `event.created`, rejects stale events (line 54-61).
- Idempotency: `webhook_events` table with UNIQUE on `event_id`, race-handled on 23505 (line 80-91). On handler error, the event row is deleted so Stripe will retry (line 456).
- Restricted-key support: `lib/stripe.ts` prefers `STRIPE_RESTRICTED_KEY` over `STRIPE_SECRET_KEY`. Env validator accepts either.
- Beta seat cap (25): enforced in `app/api/stripe/checkout-beta/route.ts:7,45,58` against profiles + pending purchases. (Race-condition fix recommended in code-quality audit; not a blocker.)
- Audit log entry per webhook event (`stripe.webhook` action with event_id + event_type).
- All checkout/portal/return URLs use `process.env.NEXT_PUBLIC_APP_URL` (env-driven; flips automatically on domain cutover).

**Operator checks (Stripe Dashboard):**

- [ ] **Restricted key**: confirm `STRIPE_RESTRICTED_KEY` is set in Vercel Production. Permissions per `docs/stripe-restricted-key-setup.md`: Checkout Sessions Write, Customers Write, Subscriptions Write, Billing Portal Sessions Write, Prices Read, Products Read; everything else None.
- [ ] **Old `STRIPE_SECRET_KEY` revoked**: 48h soak ended 2026-04-26. Revoke the legacy key in Stripe Dashboard - Developers - API keys.
- [ ] **Webhook endpoint** points to `https://compliance.regenportal.com/api/stripe/webhook` (or new domain post-cutover). Subscribed events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`, `customer.subscription.trial_will_end`. `STRIPE_WEBHOOK_SECRET` env var matches the endpoint's signing secret.
- [ ] **Price IDs match copy**: `STRIPE_PRICE_ID` -> $497/mo recurring; `STRIPE_BETA_PRICE_ID` -> $297/mo recurring. Pull each from Stripe Dashboard - Products and verify the dollar amount.
- [ ] **Customer Portal config** (Settings - Billing - Customer Portal): "Default return URL" = `${NEXT_PUBLIC_APP_URL}/dashboard/account`. Terms link = `${NEXT_PUBLIC_APP_URL}/terms`. Privacy link = `${NEXT_PUBLIC_APP_URL}/privacy`. Allow self-serve cancel: ON.
- [ ] **Public business website** (Settings - Public Details): set to the production domain. Shows on receipts.
- [ ] **Receipt emails**: enabled (Settings - Customer emails). This covers the receipt email path - we don't send our own.
- [ ] **Tax behavior**: confirm products are configured correctly (likely "exclusive" for B2B SaaS in the US).

**Domain-cutover Stripe steps** (when flipping to regencompliance.ai - see `docs/operator-setup.md` cross-ref to domain-migration runbook):

1. Create new webhook endpoint at the new domain (don't delete old yet).
2. Update `STRIPE_WEBHOOK_SECRET` to the new endpoint's secret.
3. Redeploy (NEXT_PUBLIC_* vars are inlined at build time).
4. Wait 24h, confirm new endpoint delivering, then disable (don't delete) old.
5. Update Customer Portal return/Terms/Privacy URLs.
6. Update Public Details URL.

## 3. Resend (transactional email)

**Status:** code is wired and env-gated. Currently inert per `CLAUDE.md` Email Policy (GHL is the preferred provider going forward).

**Code path:** `lib/email.ts` -> `sendEmail()` no-ops when `RESEND_API_KEY` unset (logs a warning). Templates live in `lib/email-templates.ts`. Active templates (called by webhook + delete + callback): `welcomeEmail`, `betaWelcomeEmail`, `paymentFailedEmail`, `subscriptionCancelledEmail`, `accountDeletedEmail`, `dataExportEmail`.

**To activate Resend:**

- [ ] Create Resend account, verify the sending domain (`regencompliance.ai` after cutover).
- [ ] Add DNS records to Cloudflare:
  - SPF: `regencompliance.ai. TXT "v=spf1 include:_spf.resend.com ~all"`
  - DKIM: 3-4 CNAMEs Resend issues for `resend._domainkey.regencompliance.ai`
  - DMARC: `_dmarc.regencompliance.ai. TXT "v=DMARC1; p=none; rua=mailto:dmarc@regencompliance.ai"` (start in monitor mode)
- [ ] Set in Vercel: `RESEND_API_KEY`, `FROM_EMAIL=RegenCompliance <noreply@regencompliance.ai>`. Default fallback if `FROM_EMAIL` unset is the regencompliance.ai address (set in `lib/email.ts:11`).
- [ ] Send a test email by triggering one of the events (e.g. submit a beta application that goes through the welcome path) - verify deliverability + content.

**Recommendation:** Decide whether Resend is the long-term home or just the bridge until GHL is wired. If GHL handles all the templates, the Resend integration code can be removed entirely (`lib/email.ts`, `lib/email-templates.ts`, package dep) - tracked but not blocking.

## 4. Other outstanding env vars

| Env var | Why | Status |
|---|---|---|
| `AI_SPEND_DAILY_CAP_CENTS` | Caps daily Anthropic spend per `lib/ai-spend-guard.ts`. Recommend $500/day = `50000` for paid beta. | Not set; kill-switch disabled until set. **Migration 026 fixed the bug** that made this non-functional even when set - now wired correctly via `trackApiUsage` -> service client. |
| `CRON_SECRET` | Gates all `/api/cron/*` routes. Required for Vercel Cron triggers + manual cron invocations. | Should be set already; if not, generate with `openssl rand -hex 32`. |
| `ENCRYPTION_KEY_V1` | At-rest encryption envelope for any future encrypted columns (`lib/crypto.ts`). | Optional. No production caller yet. |
| `NEXT_PUBLIC_APP_URL` | Drives every `SITE_URL` import + every Stripe return URL + Supabase signup redirect. | Currently `https://compliance.regenportal.com`. Flip to `https://regencompliance.ai` at domain cutover. |

## 5. Migrations to apply (in order)

| Migration | What it does | Status |
|---|---|---|
| `025_beta_applications.sql` | New `beta_applications` table for the founder-beta apply form. | Pending operator. |
| `026_security_hardening.sql` | Three fixes: revoke `increment_rate_limit` from anon (closes lockout-DoS); `beta_purchases.claimed_by ON DELETE SET NULL` (unblocks GDPR delete for beta subs); team-member RLS policies on monitored_sites / site_pages / support_tickets / ticket_messages / profiles (so invitees can read workspace data + can't impersonate admin replies). | Pending operator. |

Apply via Supabase Dashboard SQL editor or CLI in numerical order.
