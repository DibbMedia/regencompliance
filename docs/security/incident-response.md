# Incident Response Plan

**Scope:** RegenCompliance (compliance.regenportal.com) production.
**Owner:** Dibb Media (isaac@dibbenterprizes.com).
**Last reviewed:** 2026-04-24.

## Severity tiers

| Tier | Definition | Target response |
|---|---|---|
| **Sev-1** | Customer data exposed, unauthorized write to DB, or site fully down >5 min | Start within 15 min, ship mitigation within 1 hr |
| **Sev-2** | Auth broken, payment flow broken, scanner unavailable, or suspicious admin action | Start within 1 hr, fix within 4 hr |
| **Sev-3** | Partial outage, degraded UX, single-user issue | Same day |

## First 10 minutes (any sev)

1. Capture the signal — screenshot the alert / error / log line.
2. Open a scratch notes file with time, symptom, what you clicked last.
3. Assess severity using the table above.
4. If Sev-1: proceed to **Containment** before diagnosing further.

## Containment playbook

### Suspected credential leak (Stripe / Supabase / Anthropic / Cron)

1. Rotate the affected key immediately at the provider (Stripe / Supabase / Anthropic dashboard).
2. Update the Vercel env var to the new value, redeploy.
3. If `SUPABASE_SERVICE_ROLE_KEY` leaked: also rotate the Supabase JWT secret and invalidate all sessions (Supabase Auth → Settings → "Log out all users").
4. Audit `audit_log` for unexpected actions since suspected leak time.
5. Start full forensic timeline (see below).

### Suspected account compromise (customer)

1. Reset their password: Supabase Auth → Users → find user → Send password reset.
2. Revoke other sessions: trigger `signOut({ scope: "others" })` (already wired on password reset, but can also run manually via SQL).
3. Lock the account: set `profiles.subscription_status = 'cancelled'` via Supabase SQL editor to block dashboard access while investigating.
4. Check `audit_log` for the user's recent actions.
5. Check `scans` for recently-created scans with unexpected content.
6. Contact the user via the email on file.

### Site down (5xx on homepage)

1. Vercel Dashboard → Deployments → revert to the last known-good deployment (one-click rollback).
2. Investigate after rollback. Don't debug in prod.
3. If DB is the problem: Supabase Dashboard → check status, connection pool, recent migrations.

### Suspected XSS / CSP violation spike

1. Query `audit_log` for `action = 'csp.violation'` in the last hour — look at `details.blocked_url` and `details.violated_directive`.
2. If legitimate browser noise (extensions, AV): note and ignore.
3. If pattern suggests injected script: identify the source page, roll back recent content changes, re-audit user inputs in scans/profiles.
4. Tighten CSP if a new third-party script was added without nonce review.

### AI spend runaway

1. Check Vercel env: confirm `AI_SPEND_DAILY_CAP_CENTS` is set (default 5000 = $50/day).
2. Query today's `api_usage` grouped by `user_id` — identify the user driving spend.
3. If one user: rate-limit them manually (insert into `rate_limits` with low cap).
4. If distributed abuse: lower `AI_SPEND_DAILY_CAP_CENTS` via Vercel env + redeploy.

## Diagnostic tools

- **Audit log:** `SELECT * FROM audit_log WHERE created_at > now() - interval '1 hour' ORDER BY created_at DESC;`
- **Webhook events:** `SELECT * FROM webhook_events WHERE processed_at > now() - interval '1 day';`
- **Rate-limit state:** `SELECT * FROM rate_limits WHERE expires_at > now();`
- **CSP reports:** `SELECT details FROM audit_log WHERE action = 'csp.violation' AND created_at > now() - interval '6 hours';`
- **Stripe API logs:** Dashboard → Developers → API logs. Filter by key, status, endpoint.
- **Vercel logs:** Dashboard → Deployments → (pick deployment) → Logs.
- **GitHub Actions:** For CI/CD history, check Actions tab.

## Forensic timeline template

After containment, document:

- **Detection:** How, when, by whom.
- **Impact:** What data / users / systems affected.
- **Root cause:** Code path, config, human action.
- **Timeline:** Each step with timestamps.
- **Fix:** Commit / config / rotation that closed the incident.
- **Prevention:** What changes (code, process, monitoring) keep it from recurring.

Save in `docs/incidents/<yyyy-mm-dd>-<slug>.md`.

## Customer communication

- **Sev-1 affecting customer data:** Email all affected customers within 72 hours (GDPR Article 33). Template: what happened, what data, what you're doing, what they should do.
- **Sev-2:** Status update if public-facing. In-dashboard banner acceptable.
- **Sev-3:** Fix and move on. Mention in release notes if externally observable.

## Escalation contacts

| Service | Contact |
|---|---|
| Stripe | Dashboard → Support, or support@stripe.com |
| Supabase | Dashboard → Support |
| Vercel | Dashboard → Support |
| Anthropic | support@anthropic.com |
| Namecheap (DNS/registrar) | 2FA account, support chat |

## Post-incident review

Required for every Sev-1 or Sev-2. Include:

1. Five-whys root cause.
2. What we did well.
3. What we should do differently.
4. Concrete action items with owners and due dates.

File under `docs/incidents/` alongside the timeline.
