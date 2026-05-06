# Pre-Launch Audit Synthesis (2026-05-06)

Four parallel audits run against `main` (tip `bd60c20`):
- Red team / pentest
- QA / functional
- UX / UI / copy / a11y
- Responsive (mobile/tablet/desktop)

Headline counts (deduplicated): **17 ship-blockers, 50 high, 63 medium, 36 low.**

Big picture: Tier 1-5 hardening cleared the worst security holes — **no Critical exploits open**. Launch risk is now (in priority order):
1. Load-bearing UX/UI inconsistencies that erode trust on day 1 (pricing contradicting itself, stray em-dash, contrast fails).
2. Mobile admin shell unusable + global Button/Input below 44px tap target.
3. Onboarding + post-checkout flow can silently lose data or strand a paying customer at a 403 wall.
4. A handful of security-adjacent items: DNS rebinding TOCTOU, free-audit lead-table flooding, logos bucket lacking storage policy, Stripe webhook silent ceiling at 5000 users.

## Tier 1 - Fix this week (beta-launch blockers)

### Trust / conversion killers (60 min total work)

1. **Pricing inconsistency**
   - `app/faq/page.tsx:105` says "$497/mo flat" — contradicts every other surface
   - `app/dashboard/account/page.tsx:285,311` beta-active user sees both $297 AND $497 cards (branches not mutually exclusive)
   - `app/pricing/page.tsx:430-470` ROI math uses $497 not $297
   - `app/page.tsx:583-590` "$497/mo" landing card is `text-white/40` (~3.5:1 contrast, fails AA)
   - Fix: anchor everything on $297 founder + "$497 after beta" footnote. Beta-active branch should NOT fall through to standard-active card.

2. **Em-dash slip in admin** (CLAUDE.md violation)
   - `app/admin/page.tsx:783` literal `—` placeholder
   - Replace with `"-"` or `"None"`

### Paid customer at risk

3. **Post-checkout 403 race**
   - `app/auth/callback/route.ts:62` runs `claimBetaPurchase` fire-and-forget then redirects
   - On GHL/Supabase blip, user lands at `/dashboard/scanner` which throws 403 from `app/api/scan/route.ts:47`
   - Fix: `await` the claim or show "Activating subscription..." with polling

4. **Onboarding state loss on back/refresh**
   - `app/onboarding/clinic/page.tsx:9-90` client-side React state only; refresh wipes clinic name + uploaded logo
   - Server already saved via PATCH; client doesn't rehydrate
   - Fix: hydrate from `/api/profile` on mount

5. **Sites POST blocks 30s synchronously**
   - `app/api/sites/route.ts:139-164` runs `discoverPages` inside request handler
   - Toast claims "Scanning..." but blocks; discovery error swallowed at line 161, returns `total_pages: 0`
   - Fix: kick off discovery as background job, return 202 immediately

### Mobile / tap targets (operator + customer)

6. **Admin shell unusable on phone**
   - `app/admin/admin-shell.tsx:90-174` hardcoded `<aside class="w-64 sticky">`, no mobile drawer
   - On 375px iPhone, sidebar steals 68% of viewport before content renders
   - Fix: mirror `app/dashboard/layout.tsx` `SidebarProvider`/`Sheet` pattern

7. **Global Button below 44px tap target**
   - `components/ui/button.tsx:23-28`: default=h-8 (32px), sm=h-7, lg=h-9, xs=h-6
   - Affects every primary CTA in admin/dialogs/scanner mode tabs/cookie consent
   - Fix: default `h-9 sm:h-8`, or add `size="touch"` `h-11`

8. **Global Input below 44px tap target**
   - `components/ui/input.tsx:12` h-8 (32px)
   - Fix: `h-10 sm:h-8`

9. **Cost comparison table no mobile card-stack**
   - `app/page.tsx:293` `min-w-[640px] overflow-x-auto` — highest-traffic responsive failure
   - Fix: render as cards below sm:

### Security-adjacent

10. **DNS rebinding TOCTOU on every URL fetch**
    - `lib/ssrf.ts:46-86` resolves + validates DNS, then `lib/compliance-scraper.ts:110-170` `fetch(url)` re-resolves
    - Repro: anonymous `POST /api/free-audit` with attacker-controlled DNS (low TTL, IPs swap to 169.254.169.254 between check and fetch)
    - Fix: resolve once, fetch by IP literal with original `Host:` header (or pin via custom undici dispatcher)

11. **Logos bucket has no MIME/size policy**
    - `supabase/migrations/022_storage_logos_rls.sql:24-31`
    - Client enforces `image/*` + 2MB; SDK call from authed user bypasses entirely
    - Bucket is publicly readable → free public file host on `compliance.regenportal.com/...`
    - Fix: Postgres trigger checking magic bytes + size, or proxy uploads through server route

12. **Free-audit lead-table flooding**
    - `app/api/free-audit/route.ts:204-262` has 3/IP/hr + 5/host/day + 50/hr global, but no per-email cap, no daily global, no (email, url, day) dedup
    - Sustained: ~12 MB/day attacker text into DB
    - Fix: per-email daily cap + unique constraint on (email, website_url, date_trunc('day', created_at))

13. **Stripe webhook + admin search silent ceiling**
    - `app/api/stripe/webhook/route.ts:14-34` paginates `auth.admin.listUsers` 200×25=5000 ceiling, silent fail past that
    - `app/api/admin/users/route.ts:115` only checks first 100
    - Migration 030 added indexed RPC `find_auth_user_id_by_email` but no callsite uses it
    - Fix: replace pagination with the RPC

### Contrast pass (WCAG AA)

14. **`text-white/20`-`/30` surfaces failing AA**
    - `app/page.tsx:507,566,597,654`
    - `app/dashboard/page.tsx:179,184,654,712,723` (chart axes — unusable for low-vision)
    - Pricing standard-tier feature list `text-white/30`
    - Fix: grep `text-white/(2[0-9]|3[0-9])`, bulk-replace to `text-white/55` minimum on labels/captions/stats

## Tier 2 - Fix this month (visible polish + defense-in-depth)

### UX / copy
15. Signup "Could not create account" strips the substring `app/login/page.tsx:126` was looking for ("already registered") — legitimate users with existing accounts see generic error
16. Forgot-password silently throttles (3/hr per email) with no UX hint after limit
17. Beta-apply re-submit returns `alreadyApplied: true` flag that `app/apply/page.tsx:95` ignores — re-applicants think updated answers were accepted
18. `?subscribed=true` toast re-fires on back-button — `app/dashboard/scanner/page.tsx:128` should `router.replace`
19. Reset-password 2-second hardcoded timeout flickers "Invalid link" on slow connections — `app/auth/reset-password/page.tsx:62`. Use `onAuthStateChange("PASSWORD_RECOVERY")`
20. Stripe checkout/portal failures show no error code — `app/dashboard/account/page.tsx:97-119`. Add request id
21. Beta reservation rows never expire (abandoned checkout permanently consumes seat counter) — `app/api/stripe/checkout-beta/route.ts:78`. Need TTL sweeper
22. Onboarding "Finish Setup" disabled at zero treatments but "Skip for now" bypasses — single CTA, allow zero
23. Domain normalization doesn't strip path — `app/dashboard/sites/page.tsx:101` then server rejects "Invalid format"
24. Hero H1 dead style — `app/page.tsx:100` has `text-5xl lg:text-[4.25rem]` (the `lg:text-5xl` is clobbered)
25. Skip-link broken — `<main id="main-content">` only in `app/not-found.tsx`. Add to all page layouts
26. Scope drift copy: "regenerative medicine" on `app/dashboard/library/page.tsx:109` tooltip + `app/waitlist/page.tsx:182` trust strip; rest of site is broader

### Responsive
27. All 8 admin tables need mobile card-stack alternative (template: `app/dashboard/library/page.tsx:226`)
28. Marketing header md→lg breakpoint (cramped iPad portrait)
29. Admin Command Center add `md:grid-cols-3` (currently jumps 2→5)
30. Help button `bottom-[calc(1.5rem+env(safe-area-inset-bottom))]` (iOS home indicator overlap)
31. Onboarding/dashboard layouts `min-h-screen` → `min-h-[100dvh]`
32. Audit-log filters `md:grid-cols-4` for iPad single-row
33. Footer `md:grid-cols-3 lg:grid-cols-5`
34. Add Site dialog full-screen sheet on phone (currently centered modal)

### Security defense-in-depth
35. Login enumeration via differential `lockedUntil`/`remainingAttempts` in 401 — `app/api/auth/login/route.ts:79`. Suppress fields on first failures
36. Email enumeration via `alreadySubscribed`/`alreadyApplied`/`alreadyOnList` boolean flags — drop them, return uniform success
37. `send-launch` should be `verifyDeveloperAdmin` not `verifyAdmin` (compromised support admin can spam waitlist)
38. Admin rule writes should be `verifyDeveloperAdmin`
39. Ticket message admin reply has no `.max()` cap — `app/api/admin/tickets/[id]/messages/route.ts:48`
40. Per-site crawl rate-limit key tenant-prefix: `crawl:${profileId}:${id}` (currently bare `crawl:${id}`)
41. Per-(IP, email) login lockout — currently per-email only, attacker rotating IPs can permanently lock victim
42. PHI guard `phi_patterns` echoed in `/api/free-audit` response — re-leaks PII to client logs
43. CSP report dual rate-limit still allows 24K rows/day in `audit_log`. Move to dedicated table or down-sample

### Backlog HIGH from CLAUDE.md
44. N+1 in `/api/admin/users` (still flagged)
45. N+1 in `/api/admin/scans`
46. Triple-duplicated scan loop across `/sites/[id]/scan` + `/sites/[id]/crawl` + `cron/site-monitor`

## Tier 3 - Backlog (lower-impact)

- Compliance rules SELECT'd on every scan (add in-process cache)
- Stripe webhook 60-min TTL hard-rejects on Stripe queue backups (widen or queue-and-retry)
- 10K-char silent truncation in scanner — `app/dashboard/scanner/page.tsx:583`. Toast
- "Learn more" CTAs everywhere (CLAUDE.md flag) — replace with action-specific labels
- Demo cookie unsigned JSON (HMAC sign)
- Cookie banner copy meaningless — be specific about what cookies are for
- "$215,000 - $890,000" red contrast on pricing
- Member view shows member's profile clinic name, not workspace owner's
- 404 page suggestion list pushes to `/blog` index with no breadcrumb
- Tutorial modal sample text could match scanner three-mode (paste/url/file) instead of paste-only emphasis
- Hero text-shadow `&ndash;` vs `-` inconsistency (en-dash drift)
- Marketing footer "SOC-aligned" vague — match `/security` precise language
- "Welcome back" dashboard heading no clinic-name fallback
- "System Online" admin shell hardcoded green dot

## What's verified clean

Worth knowing for trust:
- **RLS completeness:** all 21 tables RLS-enabled (migration 024 holds up)
- **Stripe idempotency + signature:** holds via `webhook_events` unique constraint + `constructEvent`
- **Beta seat oversell race:** closed by migration 028 advisory lock + atomic RPC
- **Cron auth:** constant-time via `timingSafeEqual` in `lib/cron-auth.ts`
- **Origin enforcement:** `lib/security/origin.ts` enforces same-origin on mutating routes
- **Reset-password:** HIBP + revoke-other-sessions both wired
- **GHL token:** never logged, 5s timeout via AbortSignal
- **Onboarding-checklist arbitrary keys:** `.strict()` Zod closes the gap (CLAUDE.md flag is stale)
- **Profile schema bypass:** routes through `/api/profile` PATCH with `profileSchema.safeParse` (CLAUDE.md flag is stale)
- **CSP nonce:** 16-byte per-request, applied to both request + response headers
- **Account delete:** cascades through scans/tickets/messages/notifications/team/profile/auth user
- **Marketing header mobile menu:** proper hamburger with full route list, `py-2.5` tap targets
- **Dashboard sidebar mobile drawer:** `SidebarProvider` + `Sheet` pattern via `useIsMobile`
- **Em-dash hygiene:** scrub holds (1 user-visible slip in `app/admin/page.tsx:783`, 8 in code comments only)
- **AI-tell copy:** zero occurrences of "delve" / "leverage" / "harness" / "robust" / "elevate" / "seamless" / "we're thrilled" / etc. in user-facing surfaces
