# Data Classification

**Last reviewed:** 2026-04-24.

Every piece of data in RegenCompliance is classified into one of four levels. The classification determines storage, access, logging, retention, and encryption requirements.

## Levels

### L1 — Public

Intended to be publicly readable. No access controls required beyond normal web availability.

| Data | Storage |
|---|---|
| Marketing pages, blog posts, compliance rule library | Git + Supabase public-SELECT tables |
| Badge verification (`/verify/<id>`) | Public page, `badge_id` is unguessable random |
| `compliance_rules`, `enforcement_actions` tables | RLS `USING (true)` for authenticated users |

### L2 — Internal

Not secret, but not advertised. Exposure would cause mild embarrassment or operational leak, not harm.

| Data | Storage |
|---|---|
| Internal admin URLs (`/admin/*`) | Gated by `verifyAdmin()` |
| Code comments, commit messages | Git (public repo configuration) |
| Source code | GitHub (private repo) |

### L3 — Confidential

Customer data. Exposure would harm customer trust, violate contract, potentially trigger regulatory notice.

| Data | Storage |
|---|---|
| `profiles`, `scans`, `scans.original_text`, `scans.rewritten_text` | Supabase with RLS — only owner + team |
| `support_tickets`, `ticket_messages` | Supabase with RLS — only owner |
| `monitored_sites`, `site_pages` | Supabase with RLS — only owner |
| `notifications` | Supabase with RLS — only owner |
| `team_members` (invite tokens) | Supabase with RLS; tokens are 32-byte random |
| `logos` storage bucket | Public read (by design for embed), owner-only write |
| Customer email addresses | In `auth.users` (Supabase-managed); audit_log nulls them on delete |

### L4 — Restricted

Platform secrets. Exposure enables account takeover, customer breach, or impersonation.

| Data | Storage |
|---|---|
| `STRIPE_RESTRICTED_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Vercel Sensitive env only |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel Sensitive env only |
| `ANTHROPIC_API_KEY` | Vercel Sensitive env only |
| `CRON_SECRET`, `ENCRYPTION_KEY_V1` | Vercel Sensitive env only |
| `RESEND_API_KEY` | Vercel Sensitive env only (when enabled) |
| `audit_log` rows | Supabase, RLS service-role-only |
| `impersonation_sessions` rows | Supabase, RLS service-role-only |
| `webhook_events` dedup table | Supabase, RLS service-role-only |
| `beta_purchases` | Supabase, RLS service-role-only |

## Controls by classification

| Level | Encryption at rest | Encryption in transit | Access control | Audit logging | Retention |
|---|---|---|---|---|---|
| L1 Public | Supabase disk default | TLS | None | No | Permanent |
| L2 Internal | Supabase disk default | TLS | Auth required | Implicit (Vercel logs) | Permanent |
| L3 Confidential | Supabase disk default; app-layer infrastructure ready (`lib/crypto.ts`) not wired yet | TLS | RLS per-row | `audit_log` on mutations | Lifetime of subscription + 30 days |
| L4 Restricted | Supabase disk + RLS service-role-only | TLS + Vercel Sensitive masking | Service-role or Vercel dashboard access | Every access logged | Rotated per `rotation-schedule.md` |

## Special cases

### PHI

**RegenCompliance does not handle PHI.** The scanner analyzes marketing content. Patient-identifying content is blocked upstream by `lib/phi-filter.ts` on all scan routes. Customer T&Cs prohibit PHI upload.

Classification would be L5 (Regulated — HIPAA) if it were accepted; we explicitly reject it to stay out of that regulatory scope.

### Payment card data

**RegenCompliance does not handle card data.** All card entry goes through Stripe Checkout / Billing Portal. We only receive Stripe identifiers (`stripe_customer_id`, `stripe_subscription_id`). Classification: L3 Confidential (the IDs themselves), but no PCI scope for us.

### Audit log contents

`audit_log.details` may contain user_email, ip_address, and action metadata. Classified L4 for access purposes (service-role-only) but contents are L3 when exported for regulatory response.

## Handling requirements

- **L1:** No special handling.
- **L2:** Keep out of public repos / public pages.
- **L3:** Access requires authentication + RLS/impersonation check. Every mutation audited.
- **L4:** Access requires platform-admin credentials + 2FA. Rotation per schedule. Leak = Sev-1 incident.

## Review cadence

Annual, or when a new data-producing feature ships.
