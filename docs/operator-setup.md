# Operator setup checklist (pre-beta launch)

This doc is the canonical "things only the user can do in dashboards" list.
All code-side wiring is done; flipping these switches activates each integration.

## 1. GoHighLevel (GHL) Private Integration

**Why:** Customer data flows into GHL via the Contacts API. Every event upserts the contact by email, applies tags so workflows trigger on tag-add, and writes data to custom fields so workflows can branch on values. Code is wired; everything no-ops until you set two env vars.

### A. Create the Private Integration Token

1. In GHL: **Settings -> Private Integrations -> Create new integration**.
2. **Required scopes** (paste these exact slugs):
   - `contacts.write` — upsert contacts
   - `contacts.readonly` — defensive, some upsert flows need it
   - `locations/customFields.readonly` — let our code resolve custom-field names to IDs (no manual UUID mapping)
3. **Recommended for future expansion** (skip for now if you want the minimum):
   - `opportunities.write` — push subscribers/leads into a pipeline as opportunities
4. Copy the generated token.

### B. Vercel env vars (Production + Preview)

| Env var | Value |
|---|---|
| `GHL_API_TOKEN` | The PIT token from step A4 |
| `GHL_LOCATION_ID` | Your GHL sub-account / location UUID (Settings -> Business Profile -> Location ID) |

That's it. Everything no-ops with a logged warning until both are set; the moment you set them and redeploy, all 8 event types start firing.

### C. Custom fields to create in GHL (Settings -> Custom Fields)

The code populates these fields on the contact record. Skip any you don't care about - the upsert succeeds either way and tags still fire.

**Standard (every event):**

| Field name | Type | Purpose |
|---|---|---|
| `regen_event` | Single Line | Latest event name (e.g. `signup`, `beta_apply`) |
| `regen_source` | Single Line | Acquisition source (`website` by default) |
| `regen_event_at` | Date / Single Line | ISO timestamp of the latest event |

**Beta application (`beta_apply`):**

| Field name | Type |
|---|---|
| `regen_specialty` | Single Line |
| `regen_role` | Single Line |
| `regen_website` | Single Line |
| `regen_monthly_volume` | Single Line |
| `regen_why_apply` | Multi Line |

**Free audit (`free_audit`):**

| Field name | Type |
|---|---|
| `regen_website_url` | Single Line |
| `regen_compliance_score` | Number |
| `regen_flag_count` | Number |
| `regen_high_risk_count` | Number |
| `regen_medium_risk_count` | Number |
| `regen_low_risk_count` | Number |

**Subscription / billing:**

| Field name | Type | Used by |
|---|---|---|
| `regen_tier` | Single Line | `subscription_active` (`beta` or `standard`) |
| `regen_monthly_price_cents` | Number | `subscription_active` |
| `regen_stripe_customer_id` | Single Line | `subscription_active` / cancelled / payment_failed |
| `regen_stripe_subscription_id` | Single Line | `subscription_active` |
| `regen_amount_due_cents` | Number | `payment_failed` |

**Signup:**

| Field name | Type |
|---|---|
| `regen_user_id` | Single Line |
| `regen_confirmed_at` | Single Line |

The code matches by either the slugified field name (`regen_event`) or GHL's full key (`contact.regen_event`), so you can name the field anything as long as the slug ends up matching. Field names are cached in-process for 10 minutes so newly-created fields propagate without a redeploy.

### D. Tags fired per event

Workflows trigger off "Contact Tag - Tag Added". Branch on custom field values inside the workflow.

| Event | Tags applied |
|---|---|
| `signup` | `regen-signup`, `regen-lifecycle:signup` |
| `beta_apply` | `regen-beta-applicant`, `regen-lifecycle:beta-applied` |
| `waitlist` | `regen-waitlist`, `regen-lifecycle:waitlist` |
| `free_audit` | `regen-free-audit`, `regen-lifecycle:audit-completed` |
| `subscription_active` | `regen-subscriber`, `regen-lifecycle:subscribed`, **plus** `regen-tier:beta` or `regen-tier:standard` |
| `subscription_cancelled` | `regen-cancelled`, `regen-lifecycle:cancelled` |
| `payment_failed` | `regen-payment-failed` |
| `account_deleted` | `regen-deleted`, `regen-lifecycle:deleted` |

### E. Where each event fires from in code

| Event | Triggered by |
|---|---|
| `signup` | `POST /api/auth/signup` |
| `beta_apply` | `POST /api/beta-apply` |
| `waitlist` | `POST /api/waitlist` (first-time only - duplicates skipped) |
| `free_audit` | `POST /api/free-audit` |
| `subscription_active` | Stripe `checkout.session.completed` (both tiers) **and** `/auth/callback` claimBetaPurchase |
| `subscription_cancelled` | Stripe `customer.subscription.deleted` |
| `payment_failed` | Stripe `invoice.payment_failed` |
| `account_deleted` | `POST /api/user/delete` |

### F. Notes

- Per `CLAUDE.md` Email Policy: transactional + marketing email goes through GHL, not Resend. The code keeps Resend wired (env-gated, currently inert) for the legacy launch-announcement path; everything new should route through GHL.
- `subscription_active` fires from two paths for beta tier (Stripe webhook + callback claim). Dedup at the GHL workflow level via `regen_stripe_customer_id` so the same customer doesn't trigger the welcome sequence twice.
- All GHL calls are fire-and-forget with a 5-second timeout. They never block the user-facing flow. Failures are logged and don't propagate.
- The contact upsert API tolerates missing custom fields - if you haven't created `regen_specialty` yet, the beta-apply event still upserts the contact and applies tags; you just don't get that field populated. Add it later in GHL and the next event picks it up.

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
