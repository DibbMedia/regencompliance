# 2026-05-13 — Full encryption rollout + scanner & schema fixes

One-day session that took the user-level encryption project from zero callsites to fully deployed-and-cutover on production, then chased down every post-cutover regression. Long session, many moving parts; this is the durable record.

## What landed

End-of-session main tip: **`bd2da1a`**.

| Group | Commits |
|---|---|
| Encryption Phases 0-8 | `f1fc70c` crypto core, `631b8eb` Wave 1 repo scaffolding, vertical-slice merges `a5ee47d → 50fac8b`, integration `78b39e8`, Phase 7 hardening `b01b220`, Phase 8 E2E `51782d6` |
| Post-cutover repo fix | `a86b1f5` — scrubbed `clinic_name, treatments, email, original_text, rewritten_text, flags, source_url, domain, name, url, title, subject, message, body, action_url` from 8 repos' `SELECT_COLUMNS` |
| Post-cutover admin fix | `62ae773` — admin/stats + admin/users routes scrubbed (3 crash sites) |
| Scanner UI | `78f4e47` — response-shape bug (`data.summary?.pages_scanned` → `data.pages_scanned`) + added 3s SWR polling during scan |
| /for + /tools 500s | `ea79f4c` — extracted FAQ data arrays out of `"use client"` files into plain `.ts` modules so server pages stop importing across RSC boundary |
| Site-wide JSON-LD | `6e377b1` — new `lib/schema/` module + 30 pages patched, no fabricated data (no fake `aggregateRating`), coverage doc at `docs/seo/structured-data-coverage.md` |
| Author rewrite | filter-branch + force-push to set every session commit's author to `dibbmediallc@gmail.com` |
| Claude API audit | `c4fd937` / `bd2da1a` — full sweep of 11 Claude-API-touching files, fixed 6 more post-cutover crash sites (text/url/file scan cache lookups + sites/export + compliance-trends + dead branches in admin/stats) |

## Production state of the database

Migrations applied to prod (project `pdioqkvwmyboqpbilbfw`):
- **Prereqs:** 010 (waitlist), 011 (waitlist launch_email_sent_at), 023 (newsletter_subscribers). These were missing from prod despite being on the repo for weeks; flagged 2026-04-22 memory but never applied until today.
- **Additive (`*_enc` columns):** 033, 035, 037, 039, 041 — applied via `docs/ops/PREREQ-010-011-023-BUNDLE.sql` + `docs/ops/MIGRATIONS-033-041-BUNDLE.sql` paste-bundles in Supabase Studio SQL editor.
- **Backfill:** 858 rows encrypted across 11 populated columns. Largest: 394 audit_log rows + 277 scans + 143 site_pages + 48 notifications + 6 monitored_sites + 2 profiles. All `*_enc` envelopes verified valid via `scripts/verify-no-plaintext.ts`.
- **Cutover (drop plaintext):** 034, 036, 038, 040, 042. **No 24h soak**; cutover applied directly after backfill verified. This caused most of today's downstream pain.

`ENCRYPTION_KEY_V1` was rotated (the April version was inaccessible in Vercel — Sensitive vars can't be revealed, only rotated). New 64-char hex set in Vercel Production + local `.env.local`. Same key both places.

## Symptoms we hit and what fixed each

| Symptom | Root cause | Fix |
|---|---|---|
| `/dashboard` 500 with Server Component error digest after login | Repos selected dropped plaintext columns post-cutover; PostgREST returned PGRST204 and supabase-js threw | `a86b1f5` removed plaintext column refs from 8 repos' `SELECT_COLUMNS` |
| Admin panel 500s | Direct `supabase.from("scans").select("...flags")` in admin/stats + same pattern in admin/users with `clinic_name` | `62ae773` switched those reads to repo helpers (`listTicketsForAdmin`, `listWaitlistForAdmin`) or removed the dropped column from select |
| Scanner: "success: 0 pages scanned", no visible progress | UI extracted from wrong path (`data.summary?.pages_scanned` always undefined); SWR not polling during scan; the deeper cause was the scan never reaching Anthropic at all because `listPagesForSiteAsService` was throwing on dropped `url`/`title` cols | `78f4e47` fixed the UI; `a86b1f5` made the repo actually work |
| Anthropic dashboard showed key last used 2026-05-08 even after multiple scan attempts today | Scan loop never reached `anthropic.messages.create` because earlier supabase calls threw | Same fixes as above; verified the call chain |
| Text/URL/file scan cache lookups | Cache `SELECT` listed dropped `original_text, rewritten_text, flags, source_url` | `c4fd937` removed from selects |
| `/api/sites/[id]/export` crash | Selected `flags` (dropped) in scan-batch loop | `c4fd937` |
| `/api/compliance-trends` crash | Same `flags` issue for aggregation | `c4fd937` |
| `/for` + `/tools` 500s | Server pages imported non-component value arrays (`SPECIALTY_HUB_FAQS`, `HUB_FAQS`) from `"use client"` modules; Next 16 + Turbopack + React 19 rejects at runtime | `ea79f4c` moved data arrays into plain `.ts` modules both sides import |

## Lessons baked in (operator-memory-level)

1. **PostgREST does NOT silently ignore missing columns in `select("a, b, c")`** — returns PGRST204, supabase-js throws. Every cutover that drops a column requires scrubbing every `SELECT_COLUMNS` constant + every inline `.select("...")` referencing it. The Wave 2 agents' comment claiming the opposite was wrong. Saved at `~/.claude/.../memory/feedback_postgrest_drop_column_select.md`.
2. **Don't skip the dual-state soak.** Plan §Phase 8 specifies 24h dual-state monitoring after backfill, before cutover. We skipped it and ate the cost. Vercel logs during dual-state would have surfaced every PGRST204 with the plaintext column still present, before we made it irreversible.
3. **PostgREST blocks `information_schema` queries via REST.** `scripts/verify-no-plaintext.ts` had to be patched (`cedfe78`) to handle PGRST204 + probe with a 0-row SELECT instead of trusting the constraint-check path through the REST API.
4. **Vercel can't reveal Sensitive env vars after they're set.** Rotation is the only recovery if you lose track. Pre-rotation it's fine to write the key locally first and copy from `.env.local`.
5. **Importing non-component values from `"use client"` modules into server components** crosses the RSC boundary in Next 16 + Turbopack + React 19. The build accepts it; the runtime rejects it. Data arrays must live in plain `.ts` modules both sides import. (Caught 2 hub pages today.)
6. **The scanner has THREE entry points to Claude:** `app/api/sites/[id]/scan`, `app/api/sites/[id]/crawl`, `app/api/cron/site-monitor` — all delegate to `lib/scan/run-site-crawl.ts`. Plus standalone `app/api/scan{,url,file}` and `app/api/free-audit` paths. If Anthropic shows no usage but the app reports success, the call chain died before the Claude line.

## Schema overhaul (separate workstream)

`6e377b1` shipped a site-wide JSON-LD overhaul targeting Google Rich Results compliance.

Highlights:
- New `lib/schema/` module with shared builders: `Organization`, `WebSite`, `SoftwareApplication`, `BreadcrumbList`, `FAQPage`, `Article`/`BlogPosting`, `ItemList`, plus a `<JsonLd>` component.
- 30 pages patched: home, about, apply, blog hub + post + paged, compare/vs, contact, cookies, accessibility, privacy, terms, demo (via layout), faq, features, for hub + per-specialty, free-audit, glossary, how-it-works (HowTo), pricing, security, state hub + per-state, tools hub + per-tool, verify, waitlist.
- **Deliberately omitted** (per Google's anti-fabrication policy): `aggregateRating`, `review`, `sameAs[]` social URLs, `telephone`, `address`, `founder`, `foundingDate`, `numEmployees`, `potentialAction` (no site-search endpoint). Rationale baked into code comments.
- Worktree-style coverage matrix at `docs/seo/structured-data-coverage.md`.

Open follow-ups:
- Blog `Article` author currently maps to `Organization` ("RegenCompliance Editorial") — switch to `Person` with bio URL when author bio pages exist.
- HowTo step list on `/how-it-works` is mirrored from the client component into the page's schema constant; keep in sync if step copy changes.

## Open items / what to watch

1. Run a fresh scan as `isaac@dibbenterprizes.com`. Anthropic dashboard should show usage within ~30s. If it stays flat, next suspect is `extractPageContent()` (network/fetch issue on customer's site), not the encryption layer.
2. `lib/compliance-scraper.ts` (~750 lines) was spot-checked, not line-audited. It only touches `enforcement_actions` + `compliance_rules` (out of encryption scope), so it's safe by definition, but if the rule-scraper cron starts erroring this is the place to read carefully.
3. The verifier script's `information_schema` constraint check still fails (PostgREST limitation). Three "FAIL" lines for the dropped unique constraints — verified manually in SQL editor; not actually broken.
4. Schema validation: run any public URL through https://search.google.com/test/rich-results to confirm rich-result eligibility post-deploy.

## Files added to docs/ this session

- `docs/user-level-encryption-plan.md` — the canonical plan (locked decisions in §12).
- `docs/security/encryption-architecture.md` — SOC 2 audit doc.
- `docs/security/key-custody.md` — operational runbook + rotation procedure + DR warning.
- `docs/security/soak-runbook.md` — the 48h operator procedure we should have followed.
- `docs/seo/structured-data-coverage.md` — schema coverage matrix.
- `docs/ops/PREREQ-010-011-023-BUNDLE.sql` — paste-ready prereq SQL.
- `docs/ops/MIGRATIONS-033-041-BUNDLE.sql` — paste-ready additive cutover SQL.
- `docs/sessions/2026-05-13-encryption-rollout.md` — this file.

## Author identity

Per user direction mid-session, all commits authored on this session have been rewritten to `dibbmediallc@gmail.com` (legal entity Regen Portal LLC). Repo-local git config `user.email` now set to that value; future commits inherit automatically.
