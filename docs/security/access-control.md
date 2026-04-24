# Access Control Policy

**Last reviewed:** 2026-04-24.

## Principle

Least privilege. Every system grants only the access required for a role's job. Separation of duties where feasible.

## Roles

### Platform admin (Dibb Media only)

Two database-backed roles in `platform_admins` table:

- **developer** — full write + read across the platform. Can: impersonate any user, add/remove admins, edit compliance rules, view all scans, access all admin routes.
- **support** — read-only impersonation + ticket responses. Cannot: mutate impersonated user's data, grant admin, edit rules.

Current holders (as of 2026-04-24):
- `isaac@dibbenterprizes.com` — developer
- `oscar@regenportal.com` — support

### Customer account admin

One per paid clinic. Created on signup. Owns the `profiles` row. Can invite up to 2 additional team members (3 seats total including owner) via `/api/team/invite`.

### Customer team member

Invited via team invite flow. Shares access to the clinic's scans/library/history via `effectiveProfileId()` normalization. Cannot invite further members.

### Anonymous visitor

Can: browse marketing pages, submit waitlist, subscribe to newsletter, trigger demo scans (rate-limited).
Cannot: touch any customer data.

## Service accounts (automated)

- **Vercel Cron** — bearer-auth on 5 cron endpoints via `CRON_SECRET`
- **Stripe webhook** — signature-verified via `STRIPE_WEBHOOK_SECRET`
- **Supabase service role** — server-only, used by `createServiceClient()` for RLS-bypass operations

## Provisioning & deprovisioning

### Platform admin

Granting: manually insert into `platform_admins` table via Supabase SQL editor. Audit via `git log` (code changes) + DB row timestamp.

Revoking: `DELETE FROM platform_admins WHERE email = '…';` then revoke that admin's Supabase / Vercel / GitHub / Namecheap access in each dashboard. Rotate any secret they had access to (see rotation-schedule.md).

### Customer admin

Granting: self-service signup.
Revoking: customer deletes account via dashboard (`/api/user/delete`), or platform admin via impersonation + delete. Cascades via FK to team members, scans, etc.

### Team member

Granting: `/api/team/invite` produces a tokenized magic link that expires in 72 hours.
Revoking: owner removes via team UI; `DELETE FROM team_members WHERE id = …` is the underlying op. Supabase session cookie becomes orphaned but RLS revokes data access immediately.

## Multi-factor authentication

**Mandatory for every account that can reach prod data or infrastructure:**

| System | 2FA | Confirmed active (2026-04-24) |
|---|---|---|
| GitHub (org + personal) | ✅ | Yes |
| Vercel | ✅ | Yes |
| Supabase | ✅ | Yes |
| Namecheap (DNS registrar) | ✅ | Yes |
| Stripe | 2FA available; recommended | Owner to confirm |
| Anthropic Console | 2FA available; recommended | Owner to confirm |

**Customer-facing MFA:** Available via Supabase Auth (TOTP); not yet enforced. See roadmap.

## Access review cadence

**Quarterly:**

1. Review `platform_admins` table. Current row should match expected roster. Screenshot for audit evidence.
2. Review GitHub org member list. Remove any who've left.
3. Review Vercel team list.
4. Review Supabase team list.
5. Review Stripe team list.
6. Review Namecheap secondary contacts.
7. Document any removals or changes in `docs/access-reviews/YYYY-QN.md`.

**Triggered reviews:** On offboarding, incident, or known breach.

## Audit trail

Every administrative action writes to `audit_log`:
- Platform admin impersonation start/stop (via `impersonation_sessions` INSERT/DELETE)
- Every scan, rewrite, profile update (attributed to `user_id`)
- Stripe webhook events (idempotency + log)
- Auth login success/failure

`audit_log` is service-role-only (RLS `USING (false)`); platform admins read via the admin shell.

Retention: 1 year rolling (see `data-retention.md`).

## Privileged operation gating

Every `requireWriteMode()` check in `/api/*/route.ts` blocks mutations when the session is in read-only impersonation mode (enforced by `lib/impersonation.ts` + `proxy.ts`).

Sensitive profile fields (`subscription_status`, `stripe_*`, `is_beta_subscriber`, `beta_enrolled_at`, `badge_id`) are trigger-protected at the DB layer (migration 020) so even a service-role-looking call from non-postgres/service role cannot bypass.

## Customer MFA roadmap

Currently optional. Plan:

1. Enable TOTP enrollment UI on `/dashboard/account`
2. Add "Require MFA for team owners" toggle (account-scoped)
3. Add audit event on MFA enrollment / challenge / challenge failure
4. Encourage via in-dashboard banner post-onboarding

Timeline: post-beta.
