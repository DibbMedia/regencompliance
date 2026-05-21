# 2026-05-20 session handoff — security hardening + bot defense + Phase 1

End-of-session main tip: **`96d8a1d`** (pushed to origin/main).

## TL;DR for the next session

**Read first:** `~/.claude/projects/C--Users-dibbm/memory/plan_regencompliance_security_next_2026_05_20.md` — that file owns the queue.

**State:** Phase 1 done. **Phase 2 queued and ready to dispatch** (6 items: NXT-G through NXT-L).

**To resume:** `git pull origin main`, read the plan file's Phase 2 table, dispatch 6 parallel agents (the plan has the spec for each).

## What landed today (everything across the session arc)

### Wave 1: scanner + KB session audit-fix (16 commits)

Closed every Critical + Warning finding from the `/gsd-code-review` of the 2026-05-19/20 scanner-unfreeze + KB framework + bible expansion session. 3 Critical + 9 Warning + 3 Info fixed across 13 commits. Skipped IN-01 (new blog post — content work) + IN-05/IN-06 (design/no-op). Plus dependabot #17 merged, #15 closed (undici 8 incompatible with vitest webidl), Sentry references stripped (clean up the "Module not found" build warning since the package was never installed), UTM tracking foundation shipped via 6 parallel agents (lib/utm.ts + UtmTracker client + /api/utm/track + cookie integration into 3 form routes + lib/ghl.ts custom field docs + operator setup doc).

### Wave 2: government-level security hardening (8 SEC commits + 10 fix commits)

8-agent parallel SEC-A..SEC-K dispatch:
- SEC-A: hash-chained tamper-evident audit log (migration 044, applied to prod)
- SEC-B: DLP redaction on AI outputs across 5 scan paths
- SEC-C+D: admin justification + step-up auth on destructive operations (new /api/admin/step-up endpoint, HMAC-signed cookie, 5-min TTL)
- SEC-F: env-gated IP allowlist for /admin /superadmin /api/admin
- SEC-G: honeypot fields on lead forms + free-audit DLP
- SEC-H: lockfile policy clarified + CycloneDX SBOM artifact in CI on main
- SEC-J: cookie hardening sweep (audit doc + 3 fixes locked in regression test)
- SEC-K: CSP regression test (locks no-unsafe-inline, no-unsafe-eval, scanned every .tsx for unnonced inline scripts + dangerouslySetInnerHTML allowlist)

Then 10-agent audit-fix wave closed the 2 Critical + 9 Warning findings from the `/gsd-code-review` of the SEC wave (CR-01 admin/admins DELETE gates, CR-02 step-up IP hardening + per-account rate limit, WR-01 step-up cookie userId binding, WR-02 users PATCH gates, WR-03 ADMIN_ALLOWED_IPS boot validation, WR-05 demo cookie HMAC fallback hardening, WR-06 label-less PHI redaction, WR-07 honeypot length cap, WR-08 site-crawl input PHI gate, WR-09 audit-chain verifier fork-vs-tamper distinction).

### Wave 3: bot defense (5 commits BOT-A..BOT-E)

5-agent parallel dispatch built the public-surface bot defense:
- BOT-A: `lib/security/bot-defense.ts` classifier — 18 allowed AI crawlers (GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, Perplexity-User, ClaudeBot, Claude-Web, anthropic-ai, Googlebot, Bingbot, DuckDuckBot, Applebot, Amazonbot, facebookexternalhit, Twitterbot, LinkedInBot, Slackbot, Discordbot) + 21 vuln scanners + 18 bad scrapers + 25 attacker probe paths + 11 injection patterns. 178 unit tests.
- BOT-B: proxy.ts STAGE 0 wiring (classifier runs FIRST, before host routing/CSP/admin gate). 403 + tarpit for probe paths.
- BOT-C: app/robots.ts mirrors the allow/deny lists.
- BOT-D: 513-line operator guide for Vercel's network-layer Firewall (ASN block + geo + rate limit + Stripe carve-out + cron carve-out).
- BOT-E: 33-case integration tests lock the wiring + adversarial-input robustness.

### Wave 4: Phase 1 hardening (6 commits NXT-A..NXT-F + docs commit)

- NXT-A `319a7fc`: closes WR-04 — `lib/security/client-ip.ts.getSecurityClientIp` consolidates the inlined helpers from SEC-F + CR-02. lib/ip.ts stays as-is for audit attribution.
- NXT-B `fde17dd`: PATCH /api/admin/admins/[id] gets step-up + justification gates (mirrors DELETE).
- NXT-C `44bf8ab`: `scripts/backfill-audit-chain.ts` — chains the 858+ pre-mig-044 audit_log rows. Idempotent + resumable + dry-run. `npm run backfill:audit-chain`.
- NXT-D `d0ed6f2`: ip_deny_list table (migration 045 **applied to prod**) + lib/security/ip-deny-list.ts. proxy.ts STAGE -1 (runs BEFORE bot-defense classifier) checks deny list; auto-bans on attacker-probe-path + injection-pattern hits for 24h.
- NXT-E `82b4ee2`: Permissions-Policy header on every response. 33 features locked.
- NXT-F `34d6b97`: /api/cron/prune-rate-limits daily 03:00 UTC. Eliminates the operator-pg_cron dependency.
- `96d8a1d`: preserved 2 REVIEW.md artifacts in docs/sessions/.

## Verification at handoff

- **1020/1020 vitest** passing
- tsc clean
- eslint 0 errors (14 unused-disable warnings, all pre-existing or trivial)
- Migrations 001-045 all applied to prod (044 + 045 applied this session via `supabase db query --linked`)
- Vercel auto-deploys next push of main to prod; cron schedules pick up automatically

## Phase 2 queue (Next Session — fully spec'd, ready to dispatch)

| # | Code | What | Effort |
|---|---|---|---|
| 7 | NXT-G | Cross-route burst detector. One IP hitting 100+ distinct paths in 60s = scraper. Sliding window in rate_limits table. Auto-promotes to ip_deny_list (which NXT-D shipped). Catches scrapers that pass UA + path + injection filters. | ~3h |
| 8 | NXT-H | Stripe webhook idempotency audit. Verify `webhook_events` table dedups Stripe deliveries correctly + webhook route returns 200 on duplicate to prevent retry storms. Add regression test. Probably already correct from Phase 5; just lock it. | ~1h |
| 9 | NXT-I | GDPR /api/user/export self-service. Decrypted user data dump as downloadable JSON. SOC 2 + enterprise-customer signal. CHECK FIRST whether endpoint already exists. | ~3h if missing |
| 10 | NXT-J | JSON response-shape audit. Static-analysis script that scans every `NextResponse.json(...)` for inadvertent encrypted-column or sensitive-field leaks to clients. New CI gate alongside `scripts/check-plaintext-leaks.ts`. | ~3h |
| 11 | NXT-K | CSP violation viewer at /admin/security/csp-reports. The existing /api/csp-report endpoint logs CSP violations; add admin dashboard to read + aggregate them. Spot prompt-injection attempts via embedded scripts in scraped content. | ~3h |
| 12 | NXT-L | Audit-log retention auto-purge cron. Enforces docs/security/retention.md policy automatically. Likely 7-year audit_log retention + 90-day anonymization for ip_address. Vercel cron route, daily. | ~2h |

## Operator follow-ups (NOT code; carried forward)

- **GHL workflows** still TODO on the operator side (welcome, beta-welcome, receipt, payment-failed, cancellation, account-deleted, plus 8 new UTM custom fields)
- **Domain cutover to regencompliance.ai**: code-ready since 2026-05-08, DNS + Vercel + Stripe webhook re-bind + Supabase Auth allowlist + GSC change-of-address still pending
- **Privacy + Terms attorney copy** still placeholder
- **ADMIN_ALLOWED_IPS** env in Vercel to activate the SEC-F gate
- **ADMIN_STEP_UP_SECRET** env in Vercel (fresh 32-byte hex) — falls back to ENCRYPTION_KEY_V1 slice without it
- **DEMO_COOKIE_SECRET** env (or rely on NEXTAUTH_SECRET)
- **Vercel Firewall rules** from `docs/security/vercel-firewall-rules.md` (operator opts in via dashboard; recommended 3-phase rollout in the doc)
- **`npm run backfill:audit-chain`** when ready to chain the 858+ historical audit_log rows (script + runbook at `docs/ops/audit-chain-backfill-2026-05-20.md`)

## Resume prompt

To get back into context next session, hand this to me:

> "Resume RegenCompliance security work. Read `docs/sessions/2026-05-20-FINAL-SESSION-HANDOFF.md` and the memory plan file. Phase 1 is done at `96d8a1d`; Phase 2 (NXT-G through NXT-L, 6 items) is queued. Dispatch the full team in parallel and start Phase 2."

Or shorter: "Pick up RegenCompliance Phase 2 — full team."
