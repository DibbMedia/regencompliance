# Vendor Risk Assessment

**Scope:** Third-party services RegenCompliance depends on.
**Last reviewed:** 2026-04-24.

Each vendor is assessed for: data access, compliance attestations, dependency criticality, and exit plan.

## Vendor list

### Supabase (Critical)

- **Role:** Primary database, auth, file storage
- **Data handled:** All customer data — auth users, profiles, scans, tickets, audit log
- **Compliance:** SOC 2 Type 2, HIPAA (on Pro tier, not active here), ISO 27001
- **Report:** https://supabase.com/security
- **Criticality:** 4/4 — loss would halt the product entirely
- **Controls in place:**
  - Row-level security on every table (verified 2026-04-24 audit)
  - 2FA enforced on our Supabase account
  - Only 2 platform admins (developer + support roles)
  - Service-role key marked Sensitive in Vercel, never in code
- **Exit plan:** Export via pg_dump; schema is standard Postgres + supabase auth tables. Migration to self-hosted Postgres + another auth provider would take weeks but is feasible.

### Vercel (Critical)

- **Role:** Hosting, CDN, serverless functions, cron, env-var management, Analytics, Image Optimization
- **Data handled:** Every request transits Vercel. Env vars (marked Sensitive) live here.
- **Compliance:** SOC 2 Type 2, ISO 27001, PCI DSS
- **Report:** https://vercel.com/security
- **Criticality:** 4/4
- **Controls in place:**
  - 2FA enforced on account
  - All secrets marked Sensitive; no secrets in build logs
  - Deployment Protection on Preview/Dev (pending confirmation in action list)
- **Exit plan:** Next.js app runs anywhere that supports Node.js. Move to Cloudflare Pages, AWS, or self-hosted. Cron jobs would need re-implementation outside Vercel.

### Stripe (Critical)

- **Role:** Payments, subscriptions, customer portal
- **Data handled:** Payment cards (Stripe-scoped, never touches our systems), customer emails, subscription status
- **Compliance:** PCI DSS Level 1, SOC 2 Type 2
- **Report:** https://stripe.com/docs/security
- **Criticality:** 4/4 — loss stops billing
- **Controls in place:**
  - Restricted API key (6 permissions only)
  - Webhook signature verification + 60-min replay window
  - Event dedup via `webhook_events` table
  - Webhook events trimmed to 4 handled types
- **Exit plan:** Migrate to Paddle, Lemon Squeezy, or Chargebee. Billing logic is in one place (`app/api/stripe/`); 1-2 week rewrite.

### Anthropic (Critical)

- **Role:** Claude API for compliance scanning (Haiku) and rewriting (Sonnet)
- **Data handled:** User-submitted marketing text passes through. No PHI (`lib/phi-filter.ts` blocks).
- **Compliance:** SOC 2 Type 2
- **Report:** https://trust.anthropic.com
- **Criticality:** 4/4 — scanner is the product
- **Controls in place:**
  - API key Sensitive in Vercel
  - Daily spend kill-switch (`AI_SPEND_DAILY_CAP_CENTS`)
  - All calls wrapped in monkey-patched `messages.create` (`lib/anthropic.ts`)
- **Exit plan:** OpenAI GPT-4 or self-hosted Llama are functional substitutes. `lib/anthropic.ts` is the only abstraction; swap takes days. Rules library + scoring prompt are model-agnostic.

### Namecheap (Important)

- **Role:** Domain registrar for `regenportal.com`
- **Data handled:** DNS records. No customer data.
- **Compliance:** Standard registrar controls
- **Criticality:** 3/4 — DNS loss or hijack would take the site down
- **Controls in place:**
  - 2FA TOTP
  - Registrar Lock enabled
  - Auto-renew enabled
  - DNSSEC enabled
  - Recovery email outside the regenportal.com domain
- **Exit plan:** Transfer to Cloudflare Registrar or AWS Route 53. 1-2 days propagation.

### Resend (Optional, not yet active)

- **Role:** Transactional email (when enabled)
- **Data handled:** Customer emails, email body content
- **Compliance:** SOC 2 Type 2
- **Report:** https://resend.com/security
- **Criticality:** 2/4 — emails can queue or drop; app still functions
- **Controls in place:**
  - API key Sensitive, optional env var
  - `sendEmail()` no-ops when unset
- **Exit plan:** Postmark, SES, SendGrid. Replace `lib/email.ts` only.

### Sentry (Optional, infrastructure ready)

- **Role:** Error monitoring + Session Replay (when installed)
- **Data handled:** Error stack traces, request URLs (sensitive paths scrubbed in `sentry.server.config.ts`)
- **Compliance:** SOC 2 Type 2, ISO 27001
- **Report:** https://sentry.io/trust/
- **Criticality:** 1/4 — observability, not critical path
- **Controls in place (when installed):**
  - PII scrubbing in `beforeSend` hook (emails, IP, cookies, body on sensitive paths)
  - `maskAllText: true, blockAllMedia: true` on Session Replay
- **Exit plan:** Remove 4 config files + dep. No product dependency.

### GitHub (Important)

- **Role:** Source control, CI/CD actions, issue tracking
- **Data handled:** Our source code (contains no secrets; see `.gitignore` + `.secretlintrc`)
- **Compliance:** SOC 2 Type 2, ISO 27001
- **Report:** https://github.com/security
- **Criticality:** 3/4 — loss of repo = rebuild from local clone; loss of Actions = CI disabled
- **Controls in place:**
  - 2FA enforced on account + org
  - Push protection on (blocks secret commits at server side)
  - GitHub Actions pinned to commit SHA (supply chain)
  - Secretlint + CodeQL + tests + tsc + npm-audit in CI
- **Exit plan:** `git push` to GitLab or Bitbucket; rewrite Actions workflows for the new platform. 1-2 days.

## Review cadence

Annual for low/medium vendors, biannual for critical (4/4) vendors, or on any material change (new data category, compliance change, pricing shift).

## Criteria for new vendor onboarding

Before adding a new vendor that will process customer data:

1. Published SOC 2 report or equivalent
2. Signed DPA (Data Processing Agreement) if EU data may flow
3. API key scope reviewed — least privilege
4. Secret stored in Vercel Sensitive env
5. Code abstraction behind a single lib file so future replacement is contained
6. Entry added here
