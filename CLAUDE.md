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

Transactional + marketing email will go through **GoHighLevel (GHL)** when the user wires up the workflows. **Do NOT propose Resend, nodemailer/SMTP, AWS SES, or any new email provider as a launch dependency** — Resend is in `package.json` and `lib/email.ts` because the launch-announcement code uses it, but the user has explicitly chosen to wait on activating Resend in favor of GHL.

When a feature needs an email-shaped notification before GHL is wired (e.g. "alert me when a new waitlist signup lands"), default to **in-app mechanisms**: sidebar badges, dashboard counters, unread tracking via `localStorage` `last_seen` patterns. The pattern is already in place for the Waitlist nav item in `app/admin/admin-shell.tsx` (key: `admin:waitlist:lastSeen`, paired with `?waitlistSince=<iso>` on `/api/admin/stats`).

Only add an outbound email pathway when the user explicitly names a GHL workflow ID and adds the corresponding env var (e.g. `GHL_WORKFLOW_TRIAL_ENDING` on RoofKnockers). When you write code that POSTs to a GHL webhook, env-gate it so missing config logs a warning and no-ops rather than throwing.

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

### Things that aren't done / known gaps

- Confirmation email to waitlist signers — deferred to GHL.
- Admin email/Slack notification when a new signup lands — deferred (in-app badge above is the current substitute).
- Source/UTM tracking on waitlist signups (currently hardcoded `"website"` in `/api/waitlist`).
- Some marketing pages still say "Start Free Trial" near a `/waitlist` button — copy scrub pending. Search for `Start Free Trial` and consider whether each instance should say "Join the Waitlist" instead.
