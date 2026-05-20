# 2026-05-19/20 - scanner unfreeze + KB framework + deep-research bible expansion

Multi-day session covering three concentric problems: (1) the scanner appeared dead, (2) the production build had been silently frozen for six days, (3) once those were fixed the knowledge base it consults turned out to be too shallow to give defensible verdicts. This is the durable record so the work, the citations behind it, and the rules learned do not need to be rediscovered.

End-of-session main tip: **`814a1b6`**. 23 commits across 6 waves.

## Why it failed silently

`tsconfig.json` type-checks `**/*.ts` with no `ignoreBuildErrors`. Commit `fc5935e` moved a set of backfill scripts into `scripts/archived/` without rewriting their `../lib/` relative imports. Every Vercel deploy after `fc5935e` errored at type-check; Vercel kept serving the last green build (~6 days stale). The Vercel Deployments tab was the only place this surfaced - the app itself looked fine because it was running stale code.

Lesson saved to local memory `feedback_nextjs_tsconfig_typecheck_scope.md`: **before debugging app behavior, check Vercel Deployments.**

## Wave 1 - unfreeze + CSP (commits `3be56ab..a4064a8`)

- `61395eb` Excluded `scripts/archived` from `tsconfig.json`. Build green locally and on Vercel.
- `a4064a8` Two CSP bugs: (1) the `next-themes` pre-hydration inline `<script>` was unnonced and blocked under `script-src 'strict-dynamic'`, fixed with `<ThemeProvider nonce={nonce}>` in `app/layout.tsx`. (2) `connect-src` was `'self'`-only, blocking cross-origin hops between apex and `app.` subdomain - added `siteConnectOrigins()` in `proxy.ts` mirroring `lib/security/origin.ts`.

## Wave 2 - scanner failure-mode opacity (commits `2022214..e2aa74f`)

User: "savemyfat.com scan: 20 pages failed, 30 queued, 59 should have scanned." With the build live again the scanner's silent-null failure mode was now visible.

| Commit | Finding | Fix |
|---|---|---|
| `2022214` | F-01 silent nulls | Every `safeFetchHtml` / `fetchPage` / `extractPageContent` / `run-site-crawl` return path that drops to null now logs URL + reason |
| `eb53f02` | F-02 audit-log spam | Sampled warn (counter + every 100th) replaces `console.error` flood from Supabase ECONNRESET |
| `162cddd` | F-03 data | Migration **043** adds `site_pages.last_error`; crawler writes it with graceful fallback for migration lag |
| `f28823c` | F-06 part 1 | `discoverPages` now tries sitemap.xml first (incl. sitemap-index, up to 5 child sitemaps), falls back to BFS. `safeFetchHtml` widened to accept `application/xml` |
| `f1d179c` | F-03 UI + F-04 | Dashboard renders per-page `last_error`; "Process queue now" button re-triggers `/api/sites/[id]/scan`; per-trigger cap raised 20 -> 25 |
| `e2aa74f` | F-06 part 2 | HTTP status threads back via `*WithStatus` siblings; 404 pages get `status='retired'` so future crawls skip them |

## Wave 3 - proactive cleanup (commits `e2aa74f..521f3b1`)

User pushback: "what else is broken in the code? you should have caught that in the first place." Triggered a sweep.

- `d6da00e` F-08: corrected misleading "60s for non-cron paths" comment in scan/route.ts (route uses `maxDuration = 300`).
- `4977992` F-07: **the real cause of [Audit] fetch-failed / ECONNRESET noise.** Cached the audit-log service client at module level. Each prior `createServiceClient()` spawned a fresh `@supabase/ssr` instance + undici pool, so multi-page scans burst fresh TLS handshakes that Supabase/Vercel egress was resetting. Singleton lets undici keep-alive sockets stick.
- `0f55c0b` F-09: sampled the migration-043-pending warn (1st + every 100th).
- `521f3b1` F-10: capped sitemap parsing at 2000 entries.

Migration 043 applied to prod the same session: `npx supabase db query "ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS last_error text;" --linked`. Verified via `information_schema.columns`. F-09 warns now dormant.

## Locked rule - URL slugs

Added to `CLAUDE.md` in commit `07bef80` as a load-bearing section above email policy. Every URL slug across blogs, tools, specialty pages, state slugs, competitor slugs, and route folders is in marketing materials. Renaming any of them requires:
1. Explicit user approval with `before -> after` shown.
2. A 301/308 redirect from old to new in the **same commit**. Static -> `next.config.ts` `redirects()`. Dynamic or host-aware -> `proxy.ts`.

Same rule mirrored to local memory `feedback_regencompliance_slugs_locked.md`.

## Wave 4 - KB auto-update framework (commits `722d905..d34b58d`)

User: "audit and update (preferably automatically) on a weekly basis all of the compliance guidance, knowledge base, etc... 1am CST Sunday morning... scrape FDA, FTC, state-specific guidance (FL, UT, CA, etc.). Powerful and accurate. 50 states. Encrypted."

- `722d905` 50-state registry (`lib/compliance/state-sources.ts`). 9 implemented across 8 states (FL/CA/TX/NY/UT/AZ/CO/IL/MA/OH). 55 scaffolded entries + 17 supplementary naturopath-board entries. Generic state scraper (`lib/compliance/state-scraper.ts`) reuses `safeFetchHtml`.
- `bd20418` Tightened dedup (normalize + stem + near-dup substring within category). Freshness bump on exact-match (source_date moves forward).
- `c2ad8e4` Weekly cron `/api/cron/weekly-refresh` at `0 6 * * 0` (Sun 1am CDT / midnight CST under DST drift, intentional). State pipeline (`lib/compliance/state-pipeline.ts`) scrapes implemented states, fetches up to 3 details/state (`MAX_DETAILS_PER_STATE = 3` for budget shaping inside Vercel's 300s `maxDuration`), runs Claude rule extractor, dedup-inserts. Source-date fix: `extractRulesFromText` now also parses `documentDate` from FDA/FTC/DOJ text so rule rows get the real issuance date.
- `d34b58d` Integration fix: two parallel agents made incompatible API changes (`extractRulesFromText` return-shape widened by one, consumed against the old shape by the other). Build broke and was pushed before caught; Vercel rejected the build so prod stayed at `07bef80` (no live impact). Reconciled by keeping original action -> extract -> insert order + updating 4 stale test mocks + adding `.claude/**` to vitest exclude (so future agent-worktree leftovers cannot pollute test discovery).

Recorded lesson: **use `set -o pipefail` in verify chains.** `tail -3` after `tsc` was masking exit codes.

Encryption decision recorded: `compliance_rules` + `enforcement_actions` rows are **public regulatory data**; Supabase at-rest encryption (default AES-256) is the right layer, not app-side per-user DEK.

## Wave 5 - deep-research bible v1 (commits `2ab7af7..f7293d0`)

Audit said the bible at `lib/compliance-bible.ts` was shallow: missing GLP-1 compounded, ketamine, NAD+, ozone, BPC-157, TRT; missing a `website` channelRule (the surface scanned); zero citations of 21 CFR Part 1271.

Discipline: **every claim must have a citation (CFR / FDA letter URL / state statute number) or an inline `// TODO(citation)` marker.** No fabrication.

- `2ab7af7` Added six modalities to `COMPLIANCE_BIBLE.modalityRules`:
  - `glp_1_compounded` (FDA removal Oct 2025, 21 USC 353a/353b)
  - `ketamine` (FDA Oct 2023 alert, Spravato REMS only)
  - `nad_iv` (no FDA-approved IV indication, 21 CFR Part 1271 silent)
  - `ozone_therapy` (FDA "no proven medical use" position)
  - `bpc_157` (503A vs 503B bulks list - Sept 2023 PCAC decision specific date had to be left as inline TODO; FDA pages 404'd on WebFetch)
  - `trt_men` (DEA Schedule III, 21 CFR 1308.13)
  
  Added new `website` channelRule (10 restrictions, citing 16 CFR Part 255 endorsement guides). Added 21 CFR Part 1271 citation chain across HCT/P entries. Added FL/UT/NV statute numbers for state-specific peptide claims.
- `214c583` New route `/coverage` (now LOCKED per slug rule). Server Component reads `COMPLIANCE_BIBLE.modalityRules` directly. `/features` + `/how-it-works` updated to surface new modalities.
- `37f7d76` Six blog posts under `lib/blog/posts/` (all slugs LOCKED):
  - `glp-1-compounded-marketing-compliance-2026`
  - `ketamine-clinic-marketing-compliance-guide`
  - `nad-iv-therapy-marketing-fda-position`
  - `ozone-therapy-marketing-compliance-rules`
  - `bpc-157-peptide-marketing-503a-pharmacy`
  - `trt-marketing-compliance-mens-health`
  
  Cross-link chain to avoid cannibalization: GLP-1 -> TRT, ketamine -> NAD+, NAD+ -> ozone, ozone -> BPC-157, BPC-157 -> GLP-1, TRT -> ketamine.
- `f7293d0` Hotfix: parallel frontend-coverage + bible-expansion agents both added a `website` channelRule entry; `-X ours` cherry-pick auto-merge kept both -> TS1117 duplicate-property error. Kept the cited 10-restriction version, dropped the 4-restriction stub at line 499.

## Wave 6 - deep-research bible v2 (commit `814a1b6`, 2026-05-20)

User: "do we have other peptide, ketamine, etc compliance guidance in there? there's many clinics offering it... the trending ones - wolverine stack, ghk-cu, trizepatide, retatutride, etc. All currently limited or illegal but doctors/clinics/med spas still use them. Also different kinds of prp (cord blood, placenta, adipose, exosomes, etc). Also botox/hyaluronic acid world."

`814a1b6` added 15 modality entries + 5 red-light entries + extended the existing `prp` entry to flag cord-blood/placenta variants as misbranding. `lib/compliance-bible.ts` +323 / -1.

| Group | Modalities added |
|---|---|
| Peptides | `sermorelin`, `ipamorelin`, `cjc_1295`, `tesamorelin`, `tb_500`, `ghk_cu`, `pt_141` |
| GLP-class | `tirzepatide`, `retatrutide`, `hcg_weight_loss` |
| Birth-tissue PRP variants | `whartons_jelly`, `bmac`, `prp_birth_tissue` |
| ED | `shockwave_ed` |
| Aesthetics | `botulinum_toxin`, `hyaluronic_acid_filler` |

Cite-or-TODO discipline preserved. Open `TODO(citation)` markers (mostly because FDA enforcement pages 404 from `WebFetch` mid-session):

- BPC-157 Sept 2023 PCAC bulks-list specific decision date
- sermorelin Geref withdrawal specifics
- tesamorelin off-label compounder warning letter list
- tb_500 April 2026 PCAC review status
- ghk_cu post-April-2026 503A status
- retatrutide specific warning letter list
- BMAC primary warning letter
- shockwave_ED primary warning letter

Wave 6 verify chain used `set -o pipefail` per the lesson from Wave 4. tsc/vitest/`next build` all green. Push `f7293d0..814a1b6`.

## Locked artifacts (defend in future renames)

- All 6 blog slugs above.
- `/coverage` route.
- The modality `key`s in `COMPLIANCE_BIBLE.modalityRules` - rules in the bible reference them by name; scanner output JSON keys off them; the `/coverage` page generates section anchors from them. Renaming any of these requires explicit user approval + a same-commit redirect or rename-with-alias.

## State of the world at session close

- Main tip `814a1b6` pushed.
- Prod `next build` green; 3944/3944 vitest.
- Migrations 001-043 all applied to prod. No pending operator actions.
- CSP fully nonced; `connect-src` covers apex + `app.` subdomain.
- Scanner failure modes are now observable: page-level errors persist to `site_pages.last_error`, dashboard renders them, "Process queue now" button is available.
- Compliance bible covers 24+ modalities with citations; 8 open `TODO(citation)` markers for items where FDA pages were unreachable during the session.
- Weekly auto-refresh wired (`/api/cron/weekly-refresh`, Sun 1am CDT) but **dormant until the operator deploys the cron in Vercel** - the `vercel.json` entry is in place; Vercel detects new cron entries on next deploy of `main`.
