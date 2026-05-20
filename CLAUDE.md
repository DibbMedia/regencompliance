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

**What this is:** SaaS that scans regenerative-medicine clinic copy (websites, ads, social posts, email) for FDA + FTC compliance violations. Live at `compliance.regenportal.com` (cutover to `regencompliance.ai` queued). Currently in **founder-beta apply mode** - `/apply` is the primary CTA across marketing (Waitlist link dropped from nav 2026-05-07; standard tier shows "Coming Soon" + Join the Waitlist link only). Beta tier $297/mo capped at 25 founders, standard $497/mo.

**Stack:** Next.js (App Router) + TypeScript + Supabase (Postgres + Auth + Storage) + Vercel + Tailwind v4 + shadcn/ui + Resend (env-gated, NOT active yet — see Email Policy). Stripe restricted-key on prod env.

**Project state (as of 2026-05-08):**
- Tier 1-5 hardening complete (env validation, RLS, CSP, server-side login proxy, MFA recovery codes, prompt-injection guards, etc.).
- SOC 2 doc pack lives under `docs/security/` (OWASP matrix, threat model, risk register, BCDR, IR, access control, change mgmt, data classification, retention, rotation, vendor risk).
- Migrations 001-032 live on prod. 025=beta_applications, 026=security hardening, 027=free_audit_leads, 028=beta_seat_reservations, 029=profile_cancelled_at, 030=email_to_user_id_rpc, 031=logos bucket policy, 032=free-audit caps + dedup index.
- Stripe restricted key live in Vercel Production; old `STRIPE_SECRET_KEY` revoked.
- May 2026 7-agent pre-launch audit fully closed (44 audit items: 14 T1 + 16 T2 + 14 T3) plus CI cleanup. ESLint zero warnings, vitest 225/225, Vercel green.
- Domain cutover prep landed: code split into apex (marketing) + app subdomain, env trim + path fallback, www<->apex redirect loop killed. Operator-side DNS/Vercel/Stripe/Supabase cutover still pending.
- 2026-05-07 launch overhaul: dropped Waitlist from nav, founder/standard pricing cards parallelized, /apply/for/tools/compare/specialty pages reflowed, 6 specialty pages got commonMistakes data, /vs/claude + /vs/perplexity competitor pages, Privacy/Terms wiped to lawyer-pending placeholders, /cookies + /accessibility added, "Dibb Enterprises LLC" -> "Regen Portal LLC", security page vendor-disclosure scrubbed, /contact form + GHL plumbing.

### URL slugs are locked (load-bearing - read before renaming any route)

**Every URL path in this app is finalized and live in marketing materials (paid ads, emails, blog posts, partner placements) as of 2026-05-19.** Silently renaming any route breaks live external links and burns ad spend.

**Before any change that affects a URL path:**
1. Surface the proposed change to the user with the exact `before -> after` path. Wait for explicit approval. No silent renames during refactors, audits, "cleanup" passes, or sweeps.
2. If approved, add a 301/308 redirect from the old slug to the new one in the SAME commit. Static paths -> `next.config.ts` `redirects()`. Dynamic paths or host-aware -> `proxy.ts` middleware. Do NOT split the rename and the redirect across commits.
3. URL-affecting changes include: renaming a route folder under `app/`, restructuring a dynamic segment, deleting a route, changing a data-driven slug (blog post `slug`, specialty key, tool key, state slug, competitor slug in `lib/blog/posts/*`, `lib/tools/data/*`, `lib/tools/data/scanner.ts`, etc.), or changing `generateStaticParams` keys.
4. Sitemap + internal `<Link>` updates do NOT substitute for a redirect - external traffic doesn't follow them.

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

### Things that aren't done / known gaps (refreshed 2026-05-08)

**Operator-side, not code:**
- GHL workflows still TODO on the operator's side (welcome, beta-welcome, receipt, payment-failed, cancellation, account-deleted). Triggered on `regen-*` tags. Custom fields + PIT + LOCATION_ID are wired in Vercel.
- Domain cutover to `regencompliance.ai`: code is ready (apex/app split landed), DNS + Vercel Domains + Stripe webhook re-bind + Supabase Auth allowlist + Search Console Change of Address still pending.
- Privacy + Terms pages are placeholders pending the user's attorney; lawyer-supplied copy still TBD.
- Optional: set `DEMO_COOKIE_SECRET` in Vercel (currently falls back to `NEXTAUTH_SECRET` / `SUPABASE_SERVICE_ROLE_KEY`).
- Decision outstanding: `support@regencompliance.com` vs `.ai` (11+ legal/marketing strings). `oscar@regenportal.com` in `platform_admins` (mig 019 seed) - migrate or remove?

**Code backlog (none launch-blocking):**
- Source/UTM tracking on waitlist + free-audit + beta-apply (currently hardcoded `"website"`).
- Screenshot-based violation highlighting for URL scans - deferred post-beta. Current deep-link is text-fragment only.
- `Scan` type in `lib/types.ts` doesn't declare `source_url` (DB has it; consumers cast inline).
- Open dependabot PRs (#9 @types/node 20->24 green, #10 actions/checkout 4->6 needs rebase, #12 minor-and-patch group of 13 needs rebase).
- 3 stale dependabot PRs need rebase or close.
- `@sentry/nextjs` still generates a non-blocking "Module not found" warning - infra ready, package not installed.

**Closed in May 2026 audit + sessions (do NOT re-list):**
- Triple scan-loop dedup -> shared `lib/scan/run-site-crawl.ts` (3 callsites use `scanSitePages`).
- N+1 in `/api/admin/users` -> batched 1 + 50-parallel.
- N+1 in `/api/admin/scans` -> parallelized via `Promise.all` (commit `b99755b`, 2026-05-08).
- Beta seat oversell race -> `reserve_beta_seat` RPC (mig 028).
- Onboarding writes through validated `/api/profile`.
- Onboarding-checklist `.strict()` whitelist.
- Forgot-password HIBP + per-IP cap + per-email cap (mig 028 / 029 / 030).
- Profile schema bypass closed.
