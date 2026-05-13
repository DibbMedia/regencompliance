# Encryption cutover - 48h production soak runbook

This document is the operator-facing procedure for rolling the user-level
encryption work (see `docs/user-level-encryption-plan.md`) into production,
soaking it in dual-state, then cutting over to encrypted-only.

Total wall-clock: ~50h. Most of that is observation, not active work.

## Prereqs

- ENCRYPTION_KEY_V1 set in Vercel Production env, 64 lowercase hex chars
  (`openssl rand -hex 32`). Sensitive flag on. NEVER paste an existing
  service-role key or webhook secret here - the loader refuses fallback
  collisions in prod (see `lib/crypto.ts`'s `FALLBACK_COLLISION_ENVS`).
- Latest `main` deployed to Vercel Production.
- All additive migrations are in the repo (`033`, `035`, `037`, `039`, `041`).
  They add `*_enc` columns alongside the existing plaintext, no drops yet.
- `npx tsx` works locally with service-role env loaded (you will run scripts).
- A current Supabase backup taken before T+0 in case Step 5 cutover needs a
  full restore.

## Step 1 - T+0: apply additive migrations

```bash
supabase db query --linked --file supabase/migrations/033_*.sql
supabase db query --linked --file supabase/migrations/035_*.sql
supabase db query --linked --file supabase/migrations/037_*.sql
supabase db query --linked --file supabase/migrations/039_*.sql
supabase db query --linked --file supabase/migrations/041_*.sql
```

Verify:

```sql
\d profiles
\d scans
\d audit_log
\d waitlist
```

You should see `*_enc text` columns alongside the legacy plaintext columns.

## Step 2 - T+1h: run backfills (idempotent, resumable)

Run in this order. Each is idempotent and resumable - if any script is
interrupted, just rerun it.

```bash
npx tsx scripts/backfill-profiles.ts
npx tsx scripts/backfill-scans-sites.ts
npx tsx scripts/backfill-tickets-notifications.ts
npx tsx scripts/backfill-audit-impersonation.ts
npx tsx scripts/backfill-leads.ts
```

At founder-beta scale (<50 users, <500 scans, <5k audit rows) the total
runtime is well under 10 minutes. Each script logs `scanned / encrypted /
failures` per table. Investigate any non-zero `failures` count before
proceeding.

## Step 3 - T+2h: verify backfill state

```bash
npx tsx scripts/verify-no-plaintext.ts
```

Expected output at this checkpoint:

- All `*_enc` envelope checks PASS (rows backfilled, valid prefixes).
- All plaintext column checks PASS only if "zero non-null rows" - which
  happens only for empty columns. Otherwise they FAIL with "N non-null
  plaintext rows. Cutover migration not yet applied." - this is expected
  before cutover. The script flags it as FAIL to make Step 6 unambiguous.
- The constraint checks may still report some present (waitlist email unique,
  etc.) because the cutover migrations also drop those.

The PASS gate at this step is: every `*_enc` envelope check is PASS. The
plaintext FAILs here mean "Step 5 still has work to do," not "stop the
rollout."

## Step 4 - T+2h to T+26h: soak in dual-state for 24h

The app now writes to `*_enc` only, but reads still fall back to plaintext
when `*_enc IS NULL` (transitional safety net for any row inserted in the
short gap between deploy and backfill completion).

Monitor:

- Vercel Logs - filter for `Decrypt failed`, `Missing ENCRYPTION_KEY_V1`,
  `Unsupported envelope`, `auth tag mismatch`. Zero matches is the bar.
- `/api/csp-report` traffic and audit_log entries with `action =
  csp.violation`. Encryption changes shouldn't trigger new CSP violations -
  if they do, investigate before continuing.
- End-to-end smoke: sign up a new user, run a scan, accept a rewrite, view
  history. Either watch real signups or do it yourself in an incognito
  session against prod.

## Step 5 - T+26h: apply cutover migrations

Take a fresh Supabase backup first. These migrations drop the plaintext
columns - there is no in-place rollback once applied.

```bash
supabase db query --linked --file supabase/migrations/034_*.sql
supabase db query --linked --file supabase/migrations/036_*.sql
supabase db query --linked --file supabase/migrations/038_*.sql
supabase db query --linked --file supabase/migrations/040_*.sql
supabase db query --linked --file supabase/migrations/042_*.sql
```

Once applied, the app reads `*_enc` only - the plaintext fallback path in
each repo becomes unreachable because the column doesn't exist.

## Step 6 - T+26h: re-run verifier

```bash
npx tsx scripts/verify-no-plaintext.ts
```

Expected: every line `[PASS]`. Plaintext column checks now PASS with
"plaintext column dropped (cutover migration applied)". Encrypted column
checks PASS with envelope validation. Dropped-constraint checks PASS.

If any FAIL: stop, capture output, restore from the backup taken at the
start of Step 5.

## Step 7 - T+26h to T+50h: final soak in cutover state for 24h

Same monitoring as Step 4. The bar is unchanged: zero `Decrypt failed`,
zero `Missing ENCRYPTION_KEY_V1`, zero unexpected CSP violations, smoke
tests green.

## Step 8 - T+50h: soak complete + backup audit

1. Trigger a fresh Supabase backup (Dashboard -> Project -> Database ->
   Backups -> "Create backup").
2. Download the SQL dump.
3. Grep the dump for plaintext PII signatures - pick 3-5 known test
   contacts (your seed admin email, a known waitlist email, a known beta
   applicant email). Each grep should return zero hits outside the system
   tables (`auth.users.email` is exempt - see "Known limitations").
4. Spot-check one row per encrypted table by hand: `SELECT * FROM scans
   LIMIT 1` should show `original_text_enc` starting with `v1u.` and no
   `original_text` column. Same shape for the other tables.

If steps 1-4 all pass: soak is complete. Mark `docs/user-level-encryption-plan.md`
Phase 8 closed and post the operator summary.

## Rollback plan

This is a one-way cutover under this plan. Once Step 5 drops the plaintext
columns, in-place rollback is not possible.

If Step 5 or Step 6 reveals a problem:

1. Stop new writes (toggle Vercel deployment to maintenance or shut down
   the previous green deployment).
2. Restore Supabase from the Step 5 pre-cutover backup. This brings the
   plaintext columns back at the cost of any rows inserted post-backup.
3. Revert the deploy to the last `main` SHA before the encryption Phase 7
   merge (`b01b220` or earlier). The repos handle the pre-encryption schema
   correctly.
4. Re-run Step 1-3 once the root cause is patched.

Backwards-incompatible failure modes worth pre-empting: a bad
ENCRYPTION_KEY_V1 paste (refuse-fallback halts derivation cleanly - fix
the env var and redeploy), a row whose `_enc` failed to backfill (rerun
the backfill script - it's idempotent), a plaintext column with a
non-empty backlog at Step 6 (a column we forgot to backfill - close the
gap before cutting over).

## Known limitations

- **GHL receives plaintext PII** at write time, intentionally. The plan is
  documented in `docs/security/encryption-architecture.md` - GHL is the
  email/CRM provider of record and consumes plaintext via webhooks. This
  soak does not change that surface.
- **`auth.users.email`** is owned by Supabase Auth. It stays plaintext in
  the `auth` schema. Application-level columns that mirror the email
  (waitlist, beta_applications, free_audit_leads, audit_log.user_email,
  team_members.email) are in scope and encrypted by this rollout.
- **`profiles.stripe_customer_id` / `stripe_subscription_id`** stay
  plaintext because the Stripe webhook needs equality lookups on them.
  This is by design (see `docs/user-level-encryption-plan.md` §12.8).
- **`profiles.logo_url`** stays plaintext because the file behind it is
  served from a public Supabase Storage bucket. Encrypting a URL that
  points at a public asset is theatre.
