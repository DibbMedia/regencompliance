# User-Level Encryption — Implementation Plan

**Status:** Plan (awaiting sign-off) - 2026-05-13
**Owner:** Dibb Media
**Scope:** Encrypt all sensitive user data at rest using per-user derived keys. Server retains ability to decrypt for app logic, scans, AI rewrites, and admin support. Admin search on encrypted columns is sacrificed in exchange for opacity.

---

## 1. Decisions locked

| Fork | Decision |
|---|---|
| Trust model | **Server-side per-user DEK.** Master key `ENCRYPTION_KEY_V1` in env. Per-user DEK = HKDF-SHA256(master, salt=user_id_bytes, info=`"regen:user-dek:v1"`). |
| Scope | **Everything sensitive** - PII, scan inputs, scan results/reports, AI rewrites, violation details, ticket bodies, notifications, audit-log details, pre-auth lead capture. |
| Searchability | **Full opacity.** No blind indexes, no deterministic HMAC side channels. Admin lookups are by `user_id` only. Email/phone search on encrypted columns dies. |

## 2. Threat model

**Defends against:**
- Stolen Supabase database backup
- SQL injection that exfiltrates data
- Leaked `SUPABASE_SERVICE_ROLE_KEY` without simultaneous env access
- Compromised DB-only admin (RLS bypass that doesn't get env)
- Malicious or compelled DB operator (Supabase staff)
- GDPR right-to-be-forgotten via crypto-shredding the user's DEK

**Does NOT defend against:**
- Compromised Vercel runtime (env + DB both accessible)
- Compromised master key
- Application bugs that leak plaintext via API responses
- Compromised user account (still sees their own decrypted data)

## 3. Crypto design

### 3.1 Key hierarchy

```
ENCRYPTION_KEY_V1  (32B, env, currently set)
   |
   | HKDF-SHA256(ikm=master, salt=user_id_uuid_bytes, info="regen:user-dek:v1", length=32)
   v
Per-user DEK (32B, derived on demand, cached in request scope)
   |
   | AES-256-GCM(key=DEK, iv=random12B, aad=context, plaintext)
   v
Envelope: "v1u." || base64url(iv || ciphertext || tag)
```

### 3.2 Pre-auth rows (no user_id)

For `waitlist`, `beta_applications`, `free_audit_leads`, `newsletter_subscribers`, `beta_purchases`, the row itself is the tenant. Use **per-row DEK** keyed off `row.id`:

```
HKDF(master, salt=row_id_uuid_bytes, info="regen:row-dek:v1", length=32)
```

Envelope prefix: `"v1r."` so the decryption path can tell them apart from per-user envelopes.

When a pre-auth lead converts to a real user (signup), the migration is: decrypt with row DEK, re-encrypt with user DEK, drop the original row or update its `user_id` and re-key its columns. Optional follow-up; not in scope for v1.

### 3.3 AAD (additional authenticated data)

AAD prevents an attacker with DB write access from moving ciphertext from row A column X into row B column Y. Format:

```
AAD = "{table}:{column}:{row_id}"
```

Example: `"profiles:clinic_name:fc9a..."` Decryption with the wrong AAD throws.

### 3.4 Versioning + future rotation

Envelope prefixes (`v1u.` / `v1r.` / legacy `v1.`) let us roll forward to `v2u.` etc. when master key rotation happens. Rotation procedure (NOT v1 scope):
1. Generate `ENCRYPTION_KEY_V2`, set in env alongside V1
2. Background job re-encrypts row-by-row, prefixing new envelopes with `v2u.`
3. Decrypt path tries V2 then V1 based on prefix
4. Once 100% migrated, remove V1 from env and code

### 3.5 What is NOT encrypted

- All UUIDs (`id`, `user_id`, `profile_id`, foreign keys)
- Timestamps, booleans, status enums, numeric scores/counts
- Stripe IDs (`stripe_customer_id`, `stripe_subscription_id`, `stripe_session_id`) - webhook lookups require equality
- `subscription_status`, `role`, `is_active` enums
- `compliance_rules`, `enforcement_actions`, `platform_admins` - platform-owned, not user data
- `webhook_events`, `rate_limits`, `api_usage`, `beta_seat_reservations` - infra, no user content
- `invite_token`, `password_reset_token` - already random tokens, no plaintext info
- `logo_url` - points at public Supabase storage URL; the file itself is in a public bucket, encryption here would be theatre

## 4. Per-table inventory

| Table | Tenant key | Plaintext columns to encrypt | Notes |
|---|---|---|---|
| `profiles` | `id` (=auth.uid) | `clinic_name`, `treatments[]`, billing-address columns (mig 029 — TBD), `phone` (TBD) | Stripe IDs stay plain. |
| `team_members` | `profile_id` | `email` | Invite flow uses `invite_token` for lookup, not email. Admin "who is on this team" dies on the search side - operator uses user_id only. |
| `scans` | `profile_id` | `original_text`, `rewritten_text`, `flags` (JSONB encrypted as a string blob) | `compliance_score`, counts stay plain (used in aggregates). Site-monitoring cron runs as service role - decrypts in-memory to feed Claude, encrypts result back. |
| `monitored_sites` | `profile_id` | `domain`, `name` | Cron lookups by `next_crawl_at`, not domain. Decrypt domain in-memory when actually crawling. |
| `site_pages` | `monitored_sites.profile_id` (denormalize to `site_pages.profile_id` for crypto AAD) | `url`, `title` | Denormalize profile_id onto site_pages to avoid a JOIN every read. Migration adds the column + FK + RLS. |
| `support_tickets` | `profile_id` | `subject` | Status/priority stay plain. |
| `ticket_messages` | `support_tickets.profile_id` (denormalize) | `message` | Same denormalization pattern. |
| `notifications` | `profile_id` (NULL = broadcast) | `title`, `body`, `action_url` | NULL profile_id = system broadcast - encrypt with master key, prefix `v1s.` (system). Or document that broadcasts are intentionally plain. Decision in §6. |
| `audit_log` | `user_id` (NULL = system) | `user_email`, `details` (JSONB blob), `ip_address`, `user_agent` | NULL user_id rows encrypted with master key (`v1s.`). |
| `impersonation_sessions` | split | `admin_email` (under admin's DEK), `target_email` (under target's DEK) | Two-key row. The row's owner identity is admin, but target_email is the impersonated user's PII so it gets encrypted under the target's DEK. |
| `waitlist` | `id` (per-row DEK) | `email`, `name`, `company`, `source`, any UTM | All pre-auth. |
| `beta_applications` | `id` | `email`, `first_name`, `last_name`, `clinic_name`, `phone`, `website_url`, `treatments`, `monthly_volume`, `why_apply`, `referral_source` | Full beta-apply payload is PII-heavy. |
| `free_audit_leads` | `id` | `email`, `name`, `company`, `website_url`, `severity_*` JSONB | Severity counts are aggregates - can stay plain or be in the encrypted blob. Encrypt the URL. |
| `newsletter_subscribers` | `id` | `email`, `name` | |
| `beta_purchases` | `id` (or convert to user_id at claim time) | `email`, billing address | At claim time, re-key under the new user's DEK. |
| `compliance_rules` | n/a | NONE | Platform-owned content. Public. |
| `enforcement_actions` | n/a | NONE | Public regulatory data about OTHER companies. Not user PII. |
| `platform_admins` | n/a | `email` could be encrypted with master key, but admins are internal staff and operate the system - probably not in v1 scope. Decision in §6. |

## 5. Phased implementation

### Phase 0 — Crypto core (2-3 hours)

Extend `lib/crypto.ts`:

- `deriveUserKey(userId: string): Buffer` - HKDF wrapper, validates UUID format
- `deriveRowKey(rowId: string): Buffer` - same but with `"regen:row-dek:v1"` info
- `encryptForUser(userId, plaintext, table, column, rowId): string` → `v1u.…`
- `decryptForUser(userId, envelope, table, column, rowId): string`
- `encryptForRow(rowId, plaintext, table, column): string` → `v1r.…`
- `decryptForRow(rowId, envelope, table, column): string`
- `encryptForSystem(plaintext, table, column, rowId): string` → `v1s.…` (master-keyed, for system rows)
- `decryptForSystem(envelope, table, column, rowId): string`
- `encryptJSON(payload, ...)` / `decryptJSON(envelope, ...)` - serialize/deserialize JSON in/out of an encrypted envelope (for `flags`, `details`)
- Request-scoped key cache via `AsyncLocalStorage<Map<userId, Buffer>>` so a single request doing 50 decrypts pays HKDF once

Tests (`tests/lib/crypto.test.ts`):
- Roundtrip: encrypt/decrypt for user, row, and system variants
- AAD binding: ciphertext encrypted with AAD `"profiles:clinic_name:A"` fails to decrypt with AAD `"profiles:clinic_name:B"`
- Cross-user binding: ciphertext encrypted under user A's DEK fails to decrypt under user B's DEK
- Tamper detection: flipping one bit of ciphertext throws on decrypt
- Wrong envelope version throws cleanly
- Legacy `v1.` envelopes still decrypt via global master key (no callsites today, but future-proof)
- Key cache: same userId → same buffer object within an `AsyncLocalStorage.run`, different run → fresh derive
- HKDF determinism: same userId always derives same DEK

No app changes, no migrations. Commit name: `feat(crypto): per-user/per-row DEK derivation + AAD-bound envelopes`.

### Phase 1 — Repository layer (1-2 days)

Build a thin repository module per table that encapsulates encrypt-on-write and decrypt-on-read. Pattern:

```ts
// lib/repos/profiles.ts
export async function getProfile(supabase, userId): Promise<Profile> { ... }
export async function updateProfile(supabase, userId, patch: Partial<ProfileWrite>): Promise<Profile> { ... }
```

Why repos and not Supabase-client interceptors:
- Encrypt/decrypt needs `userId` + column metadata - hard to thread through an interceptor cleanly
- Repos surface the encrypted columns as a typed contract, so callsites can't accidentally read raw columns
- Easy to add a `withDecryption()` wrapper for admin surfaces that need to see plaintext

Modules to create: `lib/repos/profiles.ts`, `team-members.ts`, `scans.ts`, `monitored-sites.ts`, `site-pages.ts`, `support-tickets.ts`, `ticket-messages.ts`, `notifications.ts`, `audit-log.ts`, `impersonation-sessions.ts`, `waitlist.ts`, `beta-applications.ts`, `free-audit-leads.ts`, `newsletter-subscribers.ts`, `beta-purchases.ts`. (~15 modules.)

Migrate callsites incrementally during Phases 2-7.

### Phase 2 — Authenticated PII (profiles, team_members) (~half day)

- Migration `033_encrypt_profiles_team_members.sql`:
  - Add `clinic_name_enc text`, `treatments_enc text` to profiles
  - Add `email_enc text` to team_members
  - Keep old plaintext columns - dual-write transition
- Backfill script: encrypt existing rows, populate `*_enc`
- Update all callsites to read/write via `lib/repos/profiles.ts` and `team-members.ts`
- Update admin surfaces:
  - `/admin/users` table - clinic_name column shows `[encrypted]` placeholder unless admin opens the row (decrypt path goes through admin-impersonation flow)
  - `/admin/users/[id]` detail page - decrypts via service-role + user_id
- Cutover migration `034_drop_plaintext_pii.sql`: drops old columns once dual-write is verified

### Phase 3 — Scan content (scans, monitored_sites, site_pages) (~1-2 days)

Highest-risk phase because scan flows are the hot path and they involve Claude.

- Denormalize `profile_id` onto `site_pages` (migration `035`)
- Add `*_enc` columns for `original_text`, `rewritten_text`, `flags` on scans; `domain`, `name` on monitored_sites; `url`, `title` on site_pages
- Backfill
- Update:
  - `POST /api/scans` - encrypt input on write, encrypt result on write
  - `GET /api/scans` + scan detail - decrypt on read for the row owner
  - `lib/scan/run-site-crawl.ts` - service-role context, must pass profile_id to decrypt domain + url
  - `lib/anthropic.ts` callsites - the Claude prompt sees plaintext (decrypt just-in-time), Claude's response is encrypted before storing
  - Site monitor cron (`/api/cron/site-monitor`) - same pattern
- Cutover migration drops plaintext columns

### Phase 4 — Support + notifications (~half day)

- Denormalize `profile_id` onto `ticket_messages` (migration `036`)
- Encrypt `support_tickets.subject`, `ticket_messages.message`, `notifications.title/body/action_url`
- Broadcast notifications (profile_id NULL): encrypted with system key (`v1s.`). Verify the "send launch" admin flow can produce broadcast rows
- Admin ticket queue: shows ticket subjects opaquely (admin must click into the row to read content); document this UX change
- Cutover

### Phase 5 — Audit log + impersonation (~half day)

- Encrypt `audit_log.user_email`, `details` (JSONB), `ip_address`, `user_agent`
- NULL user_id rows use system key
- Impersonation: split-key row (admin_email under admin DEK, target_email under target DEK)
- Admin audit-log UI: decrypts row by row server-side, renders for display only (do not stream plaintext back to admin client; render on server, send formatted HTML/JSON)
- Cutover

### Phase 6 — Pre-auth leads (~half day)

- Encrypt `waitlist`, `beta_applications`, `free_audit_leads`, `newsletter_subscribers`, `beta_purchases` using per-row DEK
- Migration adds `*_enc` columns; backfill; cutover
- Admin lead-list views: decrypt server-side, render
- The `reserve_beta_seat` RPC and free-audit dedup logic operate on row IDs, not email content - they keep working unchanged
- `/api/admin/waitlist/send-launch` (Resend, inert): must decrypt each row's email before sending. Document this as a known plaintext-in-transit point at email-send time

### Phase 7 — Hardening + ops (~half day)

- `lib/crypto.ts`: in production, refuse to derive a user DEK if `ENCRYPTION_KEY_V1` looks like a fallback (e.g., matches `SUPABASE_SERVICE_ROLE_KEY` or `NEXTAUTH_SECRET`). Hard error at boot.
- New env validation in `lib/env.ts`: require `ENCRYPTION_KEY_V1` be set in production (already required; tighten the error)
- Add a `docs/security/key-custody.md`: who has access to the master key, rotation procedure, DR runbook ("if master key is lost, ALL encrypted user data is unrecoverable")
- Add a `docs/security/encryption-architecture.md`: this file as user-facing summary for the SOC 2 audit
- Add a CI script (`scripts/check-plaintext-leaks.ts`) that greps API route handlers for `select("*")` patterns that would return raw `*_enc` columns to clients - those should always go through a repo
- Add a `scripts/key-rotation.ts` skeleton for the eventual V2 rotation (TODO body, just the harness)

### Phase 8 — Integration tests + soak (~1 day)

- E2E tests:
  - Signup → onboarding → scan → see scan results → all decrypted correctly for owner
  - Same scan attempted as a different user → RLS denies row access (encryption is defense-in-depth, RLS is still the primary gate)
  - Drop ENCRYPTION_KEY_V1 from env in test → all reads fail with a specific error
  - Tamper with one byte of a `*_enc` column directly in DB → reads fail with auth-tag error
- Production preview deploy + 48hr soak with the founder-beta apply flow
- Snapshot a Supabase backup, open it, verify no plaintext PII

## 6. Open questions / decisions to revisit before Phase 4

1. **Broadcast notifications.** Three options:
   - (a) Encrypt with `v1s.` (system master key) - works but means a Supabase backup containing only broadcast rows reveals the master-key-encrypted content. Still fine; master key is in env, not DB.
   - (b) Leave broadcast notifications plain. Admin-controlled content, no per-user PII. Simplest.
   - (c) Encrypt with each recipient's user DEK - means writing N notification rows for N recipients. Already the current pattern? Check.
   - **Recommendation: (b)** unless broadcast content is itself sensitive.

2. **`platform_admins.email`.** These are internal staff (Dibb Media). Encrypting with master key buys little. Recommend leaving plain in v1.

3. **`audit_log.ip_address` + `user_agent`.** PII under GDPR. Encrypt with row's user DEK if user_id present; system key if not. Audit-log queries by IP for security investigations die unless we keep a separate non-PII fingerprint. Out of scope for v1; document as known regression.

4. **`profiles.logo_url`.** Storage URL points at public bucket. Encrypting the URL is theatre because the file is publicly accessible. Don't encrypt. Document.

5. **Stripe webhooks.** Webhook → match customer by `stripe_customer_id` → load encrypted profile fields → decrypt for in-app side effects. Confirm webhook flow has user_id context before decrypting (it does via `stripe_customer_id` → `profiles.id` lookup).

6. **GHL upserts.** GHL gets plaintext PII over HTTPS at write time. This is intentional (GHL is the CRM of record) but means GHL is now a plaintext copy of data we're encrypting at rest in Supabase. Document this as a known plaintext leak to a trusted vendor.

## 7. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Master key loss = all user data unrecoverable | Document in `docs/security/key-custody.md`. Store master key in a password manager + offline backup. Confirm Vercel keeps env on cold backup. |
| Backfill fails mid-table on a row with malformed plaintext | Backfill script wraps each row in try/catch; logs failures; resumable via `updated_at` cursor. |
| Performance regression on hot paths (every scan does HKDF + AES + tag verify per column) | Request-scoped key cache (one HKDF per user per request). AES-GCM on Node is ~1 GB/s; scan payloads are KB-sized. Net latency add: <2ms per row. |
| Admin support flows die because emails are opaque | Admin user lookup pivots to `user_id` and the `find_auth_user_id_by_email` RPC (mig 030, uses `auth.users` table which is NOT encrypted - Supabase Auth owns it). Email IS searchable via auth.users; only the `team_members.email` and pre-auth lead emails are opaque. Document this. |
| `auth.users.email` is plaintext in Supabase | Out of our control. Supabase Auth owns it. Acceptable - they're SOC 2 II compliant. Document the boundary. |
| Migration introduces a `select("*")` that exposes `*_enc` to clients | Phase 7 CI grep + repo pattern eliminates this. |
| GHL holds plaintext copies | Documented. GHL is the CRM-of-record; this is intentional. |
| Key rotation = N rows × decrypt + encrypt | Designed-for via envelope prefix. v2 work is a separate project. |

## 8. Done criteria for v1

- All in-scope columns have an `_enc` companion, the plaintext column is dropped after cutover
- No application code reads or writes the plaintext column directly - all access via `lib/repos/`
- A direct SQL `SELECT * FROM scans LIMIT 1` over a service-role connection returns ciphertext only, no plaintext PII
- A Supabase backup ZIP contains no plaintext user PII (spot check on 10 random rows from each table)
- `ENCRYPTION_KEY_V1` is the only piece of state required to decrypt - removing it from env causes all user-data reads to fail cleanly with a specific error
- All existing tests still pass; new tests cover the encrypted paths
- `docs/security/encryption-architecture.md` ships for the SOC 2 audit
- Founder-beta launch unblocked: encrypted data flow is verified end-to-end with a real user

## 9. Estimated effort

| Phase | Effort |
|---|---|
| 0 — Crypto core | 2-3h |
| 1 — Repo layer scaffolding | 1-2d |
| 2 — profiles + team_members | 0.5d |
| 3 — scans + sites | 1-2d |
| 4 — tickets + notifications | 0.5d |
| 5 — audit + impersonation | 0.5d |
| 6 — pre-auth leads | 0.5d |
| 7 — hardening + docs | 0.5d |
| 8 — E2E tests + soak | 1d |
| **Total** | **~7-10 days of focused work** |

Realistic calendar time given solo + other commitments: **2-3 weeks** with the founder-beta launch held until Phase 8 passes.

## 10. Out of scope for v1 (defer)

- Key rotation (V2 master key swap)
- Client-side encryption (true zero-knowledge)
- Encryption of `compliance_rules` enforcement-action snippets quoted in customer scan reports (those are platform-owned originally; if a scan result quotes one, the quote is encrypted as part of `scans.flags`)
- Encryption of `enforcement_actions` table (public regulatory data)
- Encryption of Supabase Storage objects (logos, attachments) - separate project
- Anonymization of `ip_address` / `user_agent` beyond encryption (k-anonymity for security analytics)
- Migration of historical pre-auth leads to a user's per-user DEK after they sign up
- Hardware-backed master key (HSM, KMS) - master key stays in Vercel env in v1

## 11. Cross-references

- Current crypto module: `lib/crypto.ts` (AES-256-GCM, single global key, zero callsites today)
- Env config: `lib/env.ts` (`ENCRYPTION_KEY_V1` already required + validated as 64-char hex)
- SOC 2 docs: `docs/security/` - this plan becomes `encryption-architecture.md` after Phase 7
- Migrations directory: `supabase/migrations/` - next migration number is 033

## 12. Locked Phase 1+ design (2026-05-13)

Resolves the open questions in §6. Driver: zero beta users in prod DB yet means we can redesign flows that previously required email lookup, instead of carrying HMAC blind indexes.

### 12.1 Lead-table idempotency — B1 chosen (full opacity preserved)

Drop unique constraints on:
- `waitlist.email`
- `beta_applications.email`
- `newsletter_subscribers.email`
- `free_audit_leads (lower(email), lower(website_url), date_trunc('day', created_at))` compound index

Defense becomes rate-limit-only:
- waitlist: 5/IP/10min + 200 global/hr (unchanged)
- beta_applications: 3/IP/10min + 200 global/hr (unchanged)
- free_audit_leads: 3/IP/hr + 5/host/6hr + 50 global/hr + 500 global/day (unchanged); REMOVE the 5/email/day cap (relied on email equality)
- newsletter: 5/IP/10min + 500 global/hr (unchanged)

Worst-case spam: ~5 dup rows per email per 10 min per attacker IP. Admin dedup is manual if it happens. Acceptable for a low-volume founder beta.

The `idempotent 23505` success-path branches in `/api/waitlist`, `/api/beta-apply`, `/api/free-audit`, `/api/newsletter` come out — the 23505 path can never fire without the unique constraint. The user-facing response on duplicate becomes "thanks, we got it" the same way as a first-time submission. UX unchanged.

### 12.2 Beta-purchase claim — reservation_token flow

`beta_purchases.reservation_token` already exists as UNIQUE (migration 028). Stripe webhook already uses it (route.ts:138, 200). Only the claim-at-signup path still reads by email.

Redesign:
1. `/api/stripe/checkout-beta`: success_url becomes `${APP_URL}/auth/signup?claim={reservation_token}`
2. `/auth/signup/page.tsx` and `/auth/signup/[token]` (or query-param variant): capture `?claim=<token>`, stash in a short-lived cookie (httpOnly, secure, SameSite=Lax, 30min TTL) before sending the email confirmation
3. `/auth/callback/route.ts`: read the claim cookie. Replace `.eq("email", userEmail).eq("claimed", false)` with `.eq("reservation_token", token).eq("claimed", false)`. Drop email-based lookup at lines 95-100 and 127-130
4. `/api/beta/claim/route.ts`: switch to token-based endpoint
5. `beta_purchases.email` column stays on the row (encrypted under per-row DEK) for records — never read for lookup

Cookie name: `rc_beta_claim`. Cleared on successful claim or expiration.

### 12.3 Audit-log anonymization on user delete

`/api/user/delete/route.ts:96`: change `.eq("user_email", email)` to `.eq("user_id", userId)`. user_id stays plaintext (it's a UUID, not PII on its own). Fold into Phase 5.

### 12.4 Notifications system-key path — narrow

Per inventory: notifications are fan-out (one row per user via `lib/notifications.ts:8-33`), NOT broadcast-NULL-row. So per-user encryption works for every notifications write today.

System-key (`v1s.`) path is only needed for the rows whose tenant doesn't exist:
- `app/api/csp-report/route.ts:108-115` (unauthenticated CSP violations)
- `app/api/stripe/webhook/route.ts:87` (initial event-received audit log, before profile resolution)
- `app/api/cron/purge-cancelled/route.ts:45-51` (audit row for deleted user; user_id may be NULL by this point)

All three are audit_log writes, not notifications writes. Confirmed: notifications table is 100% per-user encryption.

### 12.5 profiles.logo_url — NOT encrypted

Points at a public Supabase storage bucket URL. Encrypting the URL while the underlying file is publicly fetchable is theatre. Skip.

### 12.6 Admin search

`team_members.email` and lead-table emails become unsearchable in admin UI. Admin pivots to:
- `auth.users.email` — Supabase Auth owns this table, plaintext, not in our encryption scope. The existing `find_auth_user_id_by_email` RPC (migration 030) still works.
- Lookup by `user_id` / row UUID elsewhere

Document this UX shift in the admin onboarding doc.

### 12.7 Migration numbering reserved

| Phase | Migration | Purpose |
|---|---|---|
| 2 | 033 | Add `*_enc` to profiles + team_members |
| 2 | 034 | Drop plaintext on profiles + team_members |
| 3 | 035 | Add `*_enc` to scans + monitored_sites; denormalize profile_id onto site_pages; add `*_enc` to site_pages |
| 3 | 036 | Drop plaintext on scans + sites + pages |
| 4 | 037 | Add `*_enc` to support_tickets + ticket_messages + notifications; denormalize profile_id onto ticket_messages |
| 4 | 038 | Drop plaintext on tickets + notifications |
| 5 | 039 | Add `*_enc` to audit_log + impersonation_sessions |
| 5 | 040 | Drop plaintext on audit + impersonation |
| 6 | 041 | Drop unique constraints + add `*_enc` to lead tables (waitlist, beta_applications, free_audit_leads, newsletter_subscribers, beta_purchases) |
| 6 | 042 | Drop plaintext on lead tables; remove the per-email rate-limit cap on free_audit_leads |

### 12.8 Pattern per phase

Each vertical slice (one phase, one or more tables):
1. Migration N: add `*_enc TEXT` columns alongside plaintext (dual-write transition)
2. Repo module(s) in `lib/repos/<table>.ts` — typed getter/setter that encrypts on write, decrypts on read
3. Callsite migration: every read/write through the repo
4. Backfill: encrypt existing plaintext into `*_enc` (idempotent script)
5. Cutover migration N+1: drop plaintext columns
6. Tests: vitest crypto-roundtrip + tamper-fail + RLS still enforced

### 12.9 Known shared-file conflict hotspots

Files touched by 2+ phases — must be merged carefully at the end of each wave:
- `app/api/stripe/webhook/route.ts` — profiles (4 reads), notifications (4 inserts), audit_log (1 insert), beta_purchases (3 updates)
- `app/auth/callback/route.ts` — profiles (1 read), beta_purchases (2 updates), team_members (2 reads)
- `app/api/admin/stats/route.ts` — profiles + waitlist reads
- `lib/notifications.ts` — broadcast fan-out + per-user creation helpers

Strategy: vertical-slice agents skip these files; main session does the integration pass at the end of each wave.

---

**Status:** Phase 0 shipped at `f1fc70c`. Phase 1 (repo scaffolding) dispatched 2026-05-13 as 5 parallel worktree agents.
