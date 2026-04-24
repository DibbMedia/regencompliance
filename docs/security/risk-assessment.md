# Risk Assessment

**Scope:** RegenCompliance SaaS (compliance.regenportal.com).
**Method:** Qualitative likelihood × impact, scored 1-4 each, risk = L × I.
**Last reviewed:** 2026-04-24.

## Scoring scale

- **Likelihood:** 1 = improbable (annual), 2 = possible (quarterly), 3 = likely (monthly), 4 = near-certain (weekly or continuous)
- **Impact:** 1 = minor (one user disrupted), 2 = moderate (feature down), 3 = major (site down OR small data leak), 4 = severe (customer data breach OR regulatory breach)
- **Risk = L × I.** 1-4 low, 5-8 medium, 9-12 high, 13-16 critical.

## Risk register

| # | Risk | L | I | R | Mitigation (in place) | Residual owner |
|---|---|---|---|---|---|---|
| R1 | Stripe API key leak | 1 | 4 | 4 | Restricted key (6 perms), Vercel Sensitive, no code checkin, 48h rotation plan | Dibb Media |
| R2 | Supabase service-role key leak | 1 | 4 | 4 | Vercel Sensitive, never in client bundle, 2FA on Supabase | Dibb Media |
| R3 | Anthropic key abused (cost) | 2 | 3 | 6 | `AI_SPEND_DAILY_CAP_CENTS` kill-switch, per-user rate limits | Dibb Media |
| R4 | Compromised customer account | 2 | 3 | 6 | 12-char password policy, 5-attempt lockout, password-reset revokes sessions | Customer + Dibb Media |
| R5 | Paywall bypass / self-granted subscription | 2 | 4 | 8 | Migration 020 trigger blocks user writes to subscription fields; RLS on profiles | Dibb Media |
| R6 | Stripe webhook forged / replayed | 2 | 3 | 6 | Signature verify + 60-min replay window + event dedup table | Dibb Media |
| R7 | Cross-tenant data access (IDOR / RLS gap) | 1 | 4 | 4 | Full RLS audit 2026-04-24, all 18 tables + logos bucket locked; adversarial probes in `docs/adversarial-probes.md` | Dibb Media |
| R8 | XSS from user-injected content | 2 | 3 | 6 | React auto-escape, CSP nonce+strict-dynamic, zod validation, CSP reporting to audit_log | Dibb Media |
| R9 | SSRF from URL-scan or scraper | 2 | 3 | 6 | `lib/ssrf.ts` private-IP block, https-only, size/timeout/redirect caps | Dibb Media |
| R10 | Prompt injection into scanner | 3 | 2 | 6 | System-prompt preamble instructs Claude to ignore instructions in content; output is constrained JSON | Dibb Media |
| R11 | PHI leakage into Claude or logs | 2 | 4 | 8 | `lib/phi-filter.ts` rejects on all scan routes; Sentry would scrub sensitive paths; we block PHI upstream | Dibb Media + customer |
| R12 | DDoS / public endpoint flooding | 3 | 2 | 6 | Vercel DDoS protection; per-IP + global rate caps on waitlist/newsletter/csp-report | Vercel + Dibb Media |
| R13 | Dependency vulnerability (known CVE) | 3 | 3 | 9 | Dependabot weekly + CodeQL on every push + `npm audit --audit-level=critical` in CI. High/moderate tracked via Dependabot group, not CI-blocking. | Dibb Media |
| R14 | Supply-chain attack via GitHub Action | 1 | 4 | 4 | All actions pinned to commit SHA, Dependabot bumps | Dibb Media |
| R15 | Vercel or Supabase outage | 2 | 3 | 6 | Vendor redundancy; no active failover. Recovery depends on vendor SLA | Vendor |
| R16 | Data loss (accidental delete, migration bug) | 2 | 4 | 8 | Supabase daily backups + PITR (once enabled in dashboard) | Dibb Media + Supabase |
| R17 | Admin credential compromise | 1 | 4 | 4 | 2FA on GitHub/Vercel/Supabase/Namecheap; 2 admins in `platform_admins`; impersonation audit trail | Dibb Media |
| R18 | CI/CD pipeline compromise | 1 | 4 | 4 | GitHub 2FA + SHA-pinned actions + secretlint + CodeQL + branch protection (pending) | Dibb Media |
| R19 | Regulatory non-compliance (GDPR / CCPA) | 2 | 3 | 6 | Privacy Policy + ToS + cookie consent live; data-export + delete endpoints shipped; no PHI handled | Dibb Media |
| R20 | Client-side lockout bypass | 2 | 2 | 4 | Server proxy shipped at `/api/auth/login` (commit `6613a94`, 2026-04-24) with mandatory lockout. Login page migration to call it is a pending UI-only change. | Dibb Media |

## High-risk items needing attention

- **R13 (score 9)** — Dependabot + npm audit mitigate; keep resolution SLA <7 days for high/critical CVEs.
- **R5 (score 8)** — Trigger is live on production (migration 020 run); adversarial probes verify.
- **R11 (score 8)** — PHI filter is coarse; false-negatives possible. Customer education + terms prohibit PHI.
- **R16 (score 8)** — PITR pending in Supabase dashboard; enable.

Everything else is medium or low.

## Risk acceptance

Risks rated 4 or lower are accepted without additional action. Risks rated 5-8 are tracked in this document and reviewed quarterly. Risks rated 9+ require a specific remediation plan before next quarterly review.

## Review cadence

Quarterly. Updates triggered by: new feature rollout, vendor change, post-incident review, regulatory change.
