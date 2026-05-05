@AGENTS.md

## Token Conservation

- **Compact at 60%:** Compact the conversation when context reaches 60% capacity. Do not wait until the limit.
- **95% Confidence Rule:** Do not make changes unless you have 95% confidence in what needs to be done. If below 95%, ask clarifying questions until you reach it. Do not guess.
- **Minimal Responses:** Keep responses as short as possible. For routine operations like commits, a single line like "Commit completed successfully" is sufficient. No summaries, no restating what was done, no filler. Every token costs money — treat them accordingly.

## General Preferences

Primary stack: TypeScript (main), Python (scraping/scripts), WordPress/PHP (plugins), CSS/HTML. When generating code, default to TypeScript unless the project context is clearly Python or PHP.

## WordPress / Elementor

- When packaging WordPress plugins as zip files, always use forward slashes for paths (even on Windows) and never reinstall a plugin in a way that wipes user settings or API keys. Confirm with the user before making changes beyond the original request scope.
- When deploying to Hostinger specifically: basic auth headers are stripped by their WAF. Use Application Passwords for WordPress REST API, or prefer XML-RPC. Also be aware their WAF may block AJAX requests from plugins.

## Debugging & Problem Solving

- Do not over-engineer solutions or assume root causes without evidence. When debugging, start with the simplest targeted fix and confirm the hypothesis before building complex solutions (e.g., chunk-per-tick rewrites, abstraction layers).

## UI / Design Standards

- Always ensure text contrast meets visibility standards (no dark-on-dark, no ultra-low opacity text). Test color combinations mentally before applying. When the user rejects UI quality, take it seriously and make substantive changes, not incremental tweaks.
- Do NOT use em dashes (—) in user-facing copy or any code that produces user-visible strings. They're an AI-writing tell. Use hyphens (-) instead. Watch out for `&mdash;` in JSX/HTML and `—` in TS strings.
- Watch for `</strong>` vs `</Strong>` mismatches in MDX/blog posts — case-mismatched tags are a silent Vercel build-breaker.
- Avoid `.bg-X .Y` descendant selectors in `globals.css` — Turbopack/Tailwind v4 expands them into invalid `::file-selector-button .text-white` combos. Use compound `.bg-X.Y` (no space) instead.

## Project Context: RegenCompliance

**What this is:** SaaS that scans regenerative-medicine clinic copy (websites, ads, social posts, email) for FDA + FTC compliance violations. Live at `compliance.regenportal.com`. Currently in **pre-launch waitlist mode** — `/waitlist` is the primary CTA across marketing, paid signup is deferred until invite. Beta tier $297/mo, standard $497/mo.

**Stack:** Next.js (App Router) + TypeScript + Supabase (Postgres + Auth + Storage) + Vercel + Tailwind v4 + shadcn/ui + Resend (env-gated, NOT active yet — see Email Policy). Stripe restricted-key on prod env.

**Project state (as of 2026-04-28):**
- Tier 1-5 hardening complete (env validation, RLS, CSP, server-side login proxy, MFA recovery codes, prompt-injection guards, etc.).
- SOC 2 doc pack lives under `docs/security/` (OWASP matrix, threat model, risk register, BCDR, IR, access control, change mgmt, data classification, retention, rotation, vendor risk).
- Migrations 001-024 live on prod. Migration 023 = newsletter subscribers, 024 = RLS completeness.
- Stripe restricted key landed + 48h soak completed 2026-04-26.

### Email policy (load-bearing — read before proposing email anywhere)

**GHL is the canonical email + CRM path.** All transactional email (welcome, beta-welcome, payment-failed, cancellation, account-deleted, data-export confirmation, receipts) runs as a GHL workflow triggered by the matching `regen-*` tag. The integration is a Private Integration Token + Contacts API upsert (see `lib/ghl.ts` + `docs/operator-setup.md`); **do NOT propose Resend, nodemailer/SMTP, AWS SES, or any new email provider** for new email work.

The Resend dependency is retained only for `app/api/admin/waitlist/send-launch/route.ts` (the one-time launch-announcement broadcast) and `lib/emails/launch-announcement.ts`. `lib/email.ts` and `lib/email-templates.ts` are kept as reference but no longer wired into any webhook/route. If you find yourself importing them in a new path, redirect that path through `sendToGhl(event, payload)` instead.

When a feature needs an email-shaped notification before the operator finishes wiring the GHL workflows, default to **in-app mechanisms**: sidebar badges, dashboard counters, unread tracking via `localStorage` `last_seen` patterns. The pattern is already in place for the Waitlist nav item in `app/admin/admin-shell.tsx` (key: `admin:waitlist:lastSeen`, paired with `?waitlistSince=<iso>` on `/api/admin/stats`).

Adding a new event type: extend `GhlEvent` in `lib/ghl.ts` + `EVENT_TAGS`, fire `void sendToGhl("your_event", { email, ...customFields })` from the route, and document the new tag + custom fields in `docs/operator-setup.md`. The operator creates the matching custom fields and workflow in GHL Settings.

### Verification & build flow

- The Vercel preview/prod build is the canonical gate for UI changes. Don't claim a UI/feature change is verified unless you've actually loaded the deployed page.
- `npx tsc --noEmit` works locally — run it before pushing. Pre-existing `swr` / `vitest` "Cannot find module" errors on the local machine are a node_modules resolution glitch and don't show up in CI (commit `4089fa7` added the `tsc --noEmit` CI job, which is green on remote). Grep tsc output for the files you changed before declaring "I broke types."
- `npm run build` and `npm run test` (vitest) also work locally. Tests live under `tests/` (api + lib).
- Pushing directly to `main` is the normal workflow on this repo (no PR review required for the owner). Vercel auto-deploys main to prod; preview deploys come from feature branches.

### Waitlist surfaces (current)

- **Public form:** `app/waitlist/page.tsx` → `POST /api/waitlist` → `waitlist` table (RLS service-role-only, see migration `010_waitlist.sql`). Rate limits: 200/hour global, 5/10min per IP.
- **Admin list:** `app/admin/waitlist/page.tsx` (search, paginate, delete, CSV export, send-launch — last one is Resend-gated and currently inert).
- **Command Center surface:** `app/admin/page.tsx` Key Metrics row has a Waitlist tile linking to `/admin/waitlist`; "Recent Waitlist Signups" table sits above the Recent Signups table. Stats served by `app/api/admin/stats/route.ts`.
- **Sidebar unread badge:** green count badge on the "Waitlist" nav item in `app/admin/admin-shell.tsx`. Counts entries with `created_at > localStorage[admin:waitlist:lastSeen]`. Clears on navigation to `/admin/waitlist`.

### Lead-magnet free-audit lander (added 2026-05-05)

- **Public form:** `app/free-audit/page.tsx` → `POST /api/free-audit` → `free_audit_leads` table (migration 027, RLS service-role-only). Anonymous prospects enter URL + email and get a teaser report: full violation count + severity breakdown + first 2 violations expanded, the rest are returned with `locked: true`. Rate limits: 50/hour global, 3/hour per IP, 5/day per host.
- **GHL event:** `GHL_WEBHOOK_FREE_AUDIT` fires with `email, name, company, website_url, score, severity counts`.

### Founder-beta application (added 2026-05-05)

- **Public form:** `app/apply/page.tsx` → `POST /api/beta-apply` → `beta_applications` table (migration 025). Eight fields + a required terms checkbox spelling out the founder commitment: active use, monthly Zoom, feedback tickets, in exchange for $297/mo locked for life with seat-loss for inactivity.
- **Marketing CTAs:** `MarketingHeader` shows "Apply for Beta" as primary green button + "Waitlist" secondary text link when `IS_LAUNCHED=false`. Landing hero + pricing page mirror the dual-CTA pattern. Free-audit lander pushes the audit-failed prospect into the same Apply flow.
- **GHL event:** `GHL_WEBHOOK_BETA_APPLY` fires with full application payload.

### GHL customer-data plumbing (added 2026-05-05)

`lib/ghl.ts` exposes `sendToGhl(event, contact)` — fire-and-forget, env-gated, 5s timeout. Each event maps to its own webhook env var so the operator can wire workflows piecemeal. Wired callsites: signup, beta-apply, waitlist, free-audit, stripe checkout-completed (standard tier), stripe subscription-deleted, stripe payment-failed, account-deleted. Beta-tier subscription activation goes through `claimBetaPurchase` in `app/auth/callback/route.ts` and does NOT currently fire a GHL event - add `GHL_WEBHOOK_BETA_ACTIVATED` there if needed. See `docs/operator-setup.md` for the full env var inventory.

### Things that aren't done / known gaps

- Source/UTM tracking on waitlist + free-audit + beta-apply (currently hardcoded `"website"`).
- Resend / GHL transactional email is still operator-action: `lib/email.ts` no-ops without `RESEND_API_KEY`. Beta launch can ship inert; activate when GHL workflows are configured.
- Domain cutover to `regencompliance.ai` is queued. Load-bearing files (sitemap, robots, llms.txt, layout metadataBase, badge route, email templates, PDF templates, opengraph images) all read from `lib/site-url.ts` which reads `NEXT_PUBLIC_APP_URL`. Per-page canonical URLs in `app/(marketing)/**/page.tsx` are still literal `compliance.regenportal.com` strings - bulk-flip at cutover (the domain-migration agent's runbook covers it).
- Several HIGH-priority code-quality items remain in backlog: N+1 in `/api/admin/users`, beta seat oversell race in `/api/stripe/checkout-beta`, onboarding writes bypassing `profileSchema`, onboarding-checklist accepts arbitrary fields, forgot-password lacks HIBP + per-IP rate-limit, triple-duplicated scan loop across `sites/[id]/scan` + `sites/[id]/crawl` + cron `site-monitor`. None are launch-blocking; tracked in the May 2026 audit synthesis.
