# GHL workflow specs (paste-ready)

Build these workflows in the GHL workspace to turn the 10 firing events into customer-visible actions. Code is wired; nothing here requires a redeploy.

**General settings for every workflow:**
- Trigger: `Contact Tag` -> `Tag Added`
- "Allow Re-Entry": ON for billing/lifecycle workflows that fire repeatedly (invoice_paid, subscription_active beta+standard); OFF for one-shot lifecycle (welcome, account_deleted) so customers don't get duplicate welcomes.
- "Stop on response": OFF unless noted.
- Sender: From `RegenCompliance <support@regencompliance.ai>` (set Reply-To = same).
- Brand color (buttons/links in email body): `#55E039`.

Custom-field merge tokens in email bodies use the GHL pattern `{{contact.<slug>}}`. Tag-membership branching uses workflow `If/Else` -> `Contact has tag`.

---

## 1. Welcome (signup)

**Trigger tag:** `regen-signup`

**Filter:** None.

**Action 1 - Send Email**
- Subject: `Welcome to RegenCompliance - your account is ready`
- Body:

```
Hi {{contact.first_name | default: "there"}},

Welcome aboard. Your RegenCompliance account is live and ready to scan.

Three things to do in the next 5 minutes:

  1. Run your first scan: paste any clinic page or marketing copy at
     https://regencompliance.ai/dashboard/scanner

  2. Add your monitored sites so the cron picks up future violations:
     https://regencompliance.ai/dashboard/sites

  3. Invite your team (up to 3 seats):
     https://regencompliance.ai/dashboard/account

Reply to this email if anything's unclear. We read every message.

- The RegenCompliance team
```

**Action 2 (optional) - Wait 3 days, then send "How's it going?" check-in email** if `regen-lifecycle:subscribed` is NOT present (i.e., they signed up free and haven't paid yet).

---

## 2. Beta application received (beta_apply)

**Trigger tag:** `regen-beta-applicant`

**Filter:** None.

**Action 1 - Send Email**
- Subject: `Your founder-beta application is in - we'll be in touch within 48 hours`
- Body:

```
Hi {{contact.first_name | default: "there"}},

Thanks for applying to the founder-beta. We review every application by hand
and respond within 48 business hours.

What you submitted:
  Specialty: {{contact.regen_specialty}}
  Role: {{contact.regen_role}}
  Website: {{contact.regen_website}}
  Monthly volume: {{contact.regen_monthly_volume}}

Why we vet: founder seats are $297/mo locked for life and capped at 25.
We're looking for clinics that will actually use the product weekly,
join the monthly Zoom, and submit feedback tickets - that's the deal.

If approved, you'll get a checkout link sized for your seat. If we're a
mismatch, we'll send you a free-audit code and the standard-tier waitlist.

- The RegenCompliance team
```

**Action 2 - Internal notification:** Send to your ops inbox/Slack with full payload (use Internal Notification step + all `{{contact.regen_*}}` fields).

---

## 3. Waitlist (waitlist)

**Trigger tag:** `regen-waitlist`

**Filter:** None.

**Action - Send Email**
- Subject: `You're on the RegenCompliance waitlist`
- Body:

```
Hi {{contact.first_name | default: "there"}},

You're on the list. We'll email you the moment standard-tier signups open
(target: rolling, as founder seats fill).

Two ways to skip the line:

  1. Apply for a founder seat ($297/mo locked for life, 25 total):
     https://regencompliance.ai/apply

  2. Run a free compliance audit on your site to see what we'd flag:
     https://regencompliance.ai/free-audit

- The RegenCompliance team
```

---

## 4. Free audit completed (free_audit)

**Trigger tag:** `regen-free-audit`

**Filter:** None.

**Action - Send Email**
- Subject: `Your free RegenCompliance audit for {{contact.regen_website_url}}`
- Body:

```
Hi {{contact.first_name | default: "there"}},

We scanned {{contact.regen_website_url}} against our FDA + FTC rule set.

Compliance score: {{contact.regen_compliance_score}}/100
Violations found: {{contact.regen_flag_count}}
  - High risk: {{contact.regen_high_risk_count}}
  - Medium risk: {{contact.regen_medium_risk_count}}
  - Low risk: {{contact.regen_low_risk_count}}

The first two violations are detailed on your free report. The rest are
locked behind a RegenCompliance subscription, along with AI rewrites,
scheduled crawl monitoring, and PDF audit trail exports.

Two ways to unlock the full report:

  1. Founder beta - $297/mo locked for life, 25 seats only:
     https://regencompliance.ai/apply

  2. Standard - $497/mo, joins waitlist for rolling launches:
     https://regencompliance.ai/waitlist

The faster path: apply for the founder beta. Free audits with high-risk
violations get priority review.

- The RegenCompliance team
```

**Action 2 (optional, 7 days later) - Send follow-up** if neither `regen-beta-applicant` nor `regen-subscriber` tag is added in the meantime.

---

## 5. Subscription active (subscription_active)

**Trigger tag:** `regen-subscriber`

**Filter:** None at the trigger; branch inside on tier.

**Action 1 - If `regen-tier:beta` tag is present:**
- Send Email
- Subject: `You're a founder. Welcome to RegenCompliance.`
- Body:

```
Hi {{contact.first_name | default: "there"}},

You're in. Founder seat #{{contact.regen_user_id | slice: 0, 8}} is yours,
locked at {{contact.regen_monthly_price_cents | divided_by: 100}}/month for life.

What you committed to (the deal we shook on):

  - Active weekly use of the scanner
  - Monthly Zoom call with the team (we'll send invites)
  - Submit at least one feedback ticket per month
  - Honest input on roadmap decisions

What you get:

  - Unlimited scans + AI rewrites
  - 300+ FDA + FTC compliance rules
  - Scheduled monitoring of your sites (cron-driven)
  - Audit trail with PDF + CSV exports
  - 3 seats for your team
  - Direct line to engineering on the monthly call

Get started: https://regencompliance.ai/dashboard

If your seat isn't used for 90 days you'll roll to standard pricing.
We'll warn you well before that ever happens.

- The RegenCompliance team
```

**Action 2 - Else (standard tier, `regen-tier:standard`):**
- Send Email
- Subject: `Welcome to RegenCompliance - your subscription is active`
- Body:

```
Hi {{contact.first_name | default: "there"}},

Your RegenCompliance subscription is active at
${{contact.regen_monthly_price_cents | divided_by: 100}}/month.

Three things in your first 5 minutes:

  1. Run your first scan: https://regencompliance.ai/dashboard/scanner
  2. Add your monitored sites: https://regencompliance.ai/dashboard/sites
  3. Invite your team (up to 3 seats): https://regencompliance.ai/dashboard/account

Manage billing anytime: https://regencompliance.ai/dashboard/account

- The RegenCompliance team
```

**Dedup note:** This event fires from two paths for beta tier (Stripe webhook + auth callback). Use the workflow's "Skip if customer received this email in the last 5 minutes" logic, or branch on whether `regen_stripe_customer_id` was set in the last 5 minutes.

---

## 6. Subscription cancelled (subscription_cancelled)

**Trigger tag:** `regen-cancelled`

**Filter:** None.

**Action 1 - Send Email**
- Subject: `Your RegenCompliance subscription has been cancelled`
- Body:

```
Hi {{contact.first_name | default: "there"}},

Your subscription was cancelled on {{contact.regen_cancelled_at}}.

You'll keep access until the end of your current billing period. After
that, your scans, audit history, and monitored sites are retained for 90
days (read-only) in case you reactivate, then permanently deleted.

If you'd like to come back: https://regencompliance.ai/pricing

If something we did pushed you out, hit reply and tell us. We read every
cancellation email and we change the product based on what we hear.

- The RegenCompliance team
```

**Action 2 (optional, 7 days later) - Send win-back email** with a 1-month discount or a free-audit refresher.

---

## 7. Payment failed (payment_failed)

**Trigger tag:** `regen-payment-failed`

**Filter:** None.

**Action 1 - Send Email immediately**
- Subject: `Payment failed for your RegenCompliance subscription`
- Body:

```
Hi {{contact.first_name | default: "there"}},

Your payment of ${{contact.regen_amount_due_cents | divided_by: 100}} failed.

Update your payment method here:
https://regencompliance.ai/dashboard/account

Stripe will retry automatically over the next 7 days. If all retries fail,
your subscription will be cancelled and access suspended. Updating your
card now is the fastest fix.

- The RegenCompliance team
```

**Action 2 - Wait 3 days, send reminder** if `regen_subscription_status` is still `past_due`.

**Action 3 - Wait 7 days from initial fire, send final notice** if still `past_due`.

---

## 8. Invoice paid / receipt (invoice_paid)

**Trigger tag:** `regen-invoice-paid`

**Filter:** `regen_invoice_amount_cents > 0` (skip $0 invoices like proration credits).

**Action - Send Email**
- Subject: `Receipt for RegenCompliance - {{contact.regen_invoice_number}}`
- Body:

```
Hi {{contact.first_name | default: "there"}},

Thanks for your payment. Your receipt is below.

  Invoice: {{contact.regen_invoice_number}}
  Amount: ${{contact.regen_invoice_amount_cents | divided_by: 100}} {{contact.regen_invoice_currency | upcase}}
  Period: {{contact.regen_invoice_period_start}} to {{contact.regen_invoice_period_end}}
  Paid on: {{contact.regen_invoice_paid_at}}

View invoice: {{contact.regen_invoice_url}}
Download PDF: {{contact.regen_invoice_pdf_url}}

For tax/accounting questions, reply to this email and we'll route to billing.

- The RegenCompliance team
```

**Note:** This workflow fires for both initial subscription invoices and recurring renewals. Same template works for both. If you want different copy for the first invoice, add a branch at the top: "If `regen-lifecycle:subscribed` was added in the last 5 minutes -> initial template, else -> renewal template."

---

## 9. Data exported (data_exported)

**Trigger tag:** `regen-data-exported`

**Filter:** None.

**Action - Send Email**
- Subject: `Your RegenCompliance data export is ready`
- Body:

```
Hi {{contact.first_name | default: "there"}},

Your data export was generated on {{contact.regen_event_at}}.

Download from your dashboard:
https://regencompliance.ai/dashboard/account

The download link expires in 7 days. After that, request a fresh export
from the same page - we don't store the generated archive long-term for
security reasons.

If you didn't request this export, reply immediately so we can investigate.

- The RegenCompliance team
```

---

## 10. Account deleted (account_deleted)

**Trigger tag:** `regen-deleted`

**Filter:** None.

**Action - Send Email** (this is the goodbye email)
- Subject: `Your RegenCompliance account has been deleted`
- Body:

```
Hi {{contact.first_name | default: "there"}},

Your RegenCompliance account was deleted on {{contact.regen_event_at}}.

What's gone, permanently:
  - Your account, scans, sites, and audit history
  - Team-member access for invitees you added
  - Active subscriptions (cancelled at deletion)

What we keep, briefly:
  - Anonymized aggregate metrics (no PII)
  - Stripe billing records (legal/tax retention - 7 years per IRS)
  - This contact record in GHL until you opt out

To opt out of all future contact, reply STOP and we'll suppress this email.

You can rejoin anytime at https://regencompliance.ai - it'll be a fresh start.

- The RegenCompliance team
```

**Note:** Set workflow "Allow Re-Entry" to OFF. Also recommend tagging contact with `regen-suppressed` after this fires so other lifecycle emails skip.

---

## Workflow ordering / build sequence

If you're tight on time, build in this order (highest revenue protection first):

1. **invoice_paid** (#8) - receipts on every charge, legally important
2. **payment_failed** (#7) - dunning, prevents churn
3. **subscription_active** (#5) - welcome the people who actually paid
4. **signup** (#1) - welcome free signups
5. **subscription_cancelled** (#6) - confirmation + win-back hook
6. **beta_apply** (#2) - confirmation + internal notification
7. **free_audit** (#4) - lead nurture
8. **waitlist** (#3) - lead nurture
9. **data_exported** (#9) - GDPR/transparency, low volume
10. **account_deleted** (#10) - GDPR/transparency, low volume

Workflows 1-5 are launch-blockers. Workflows 6-10 can ship within the first week post-launch without customer impact.

---

## After every workflow is built

Smoke test by triggering a real event from the live site:

  - signup: create a throwaway account at /signup
  - free_audit: scan a clinic URL at /free-audit
  - beta_apply: submit a test application at /apply
  - subscription_active + invoice_paid: do a real $1 test in Stripe test mode (or have a teammate run a real founder signup)
  - payment_failed: use Stripe test card `4000 0000 0000 0341`
  - subscription_cancelled: cancel via /dashboard/account portal
  - data_exported: hit the export button
  - account_deleted: delete a test account

Verify in GHL that (a) the contact was upserted with the right custom fields, (b) the right tags are on the contact, (c) the workflow fired and the email landed in your test inbox.
