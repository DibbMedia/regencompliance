# Audit-log hash-chain backfill (one-time operator runbook)

**Date authored:** 2026-05-20
**Script:** `scripts/backfill-audit-chain.ts`
**npm:** `npm run backfill:audit-chain`
**Migration this depends on:** `044_audit_log_hash_chain.sql` (must be applied first)
**Verifier:** `npm run verify:audit-chain` (run after the backfill to confirm 0 tampers)

## Background

Migration 044 added the `row_hash` column to `audit_log` for tamper-evident append-only logging. From the migration onward, every new `audit_log` INSERT carries a `row_hash = sha256_hex(prev_row_hash || canonical_serialize(this_row))` computed by `lib/repos/audit-log.ts:createAuditLogEntry`. The verifier (`scripts/verify-audit-chain.ts`) walks every `row_hash IS NOT NULL` row in `created_at ASC` order and flags any row whose stored hash does not match the recomputed value (linear extension or fork-off-grandparent).

The ~858 rows that existed BEFORE migration 044 applied have `row_hash IS NULL` - they form an unverifiable prefix. The verifier currently skips them entirely. This backfill walks that prefix in `created_at ASC` order, computes the same canonical hash for each row, and writes it back, so the verifier can scan the entire table without gaps.

Once backfill completes, the prefix is chained: the first historical row gets `prev=null` (genesis); every subsequent historical row chains off the previous backfilled row's hash; and the boundary with the post-migration-044 chained rows is unchanged because the existing chained writer treats a `NULL` most-recent row_hash as `prev=null` too (which is what the very first chained row already used).

## Prerequisites

1. Migration 044 applied to the target Supabase project (confirm via `supabase db remote get` or Studio -> Database -> Tables -> `audit_log` should show a `row_hash` column).
2. `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set in your local `.env.local` or shell env. The script uses `createClient` directly from `@supabase/supabase-js` (NOT `createServerClient` / `next/headers`), so it can run as a plain Node script.
3. `ENCRYPTION_KEY_V1` is NOT required. The chain hash is computed over the encrypted envelopes already persisted on disk - the backfill never invokes the crypto layer.
4. Node + tsx available (already wired into the repo via `npm run`).

## Operator-facing checklist

- [ ] Migration 044 confirmed applied on the target project.
- [ ] Local env file has `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` pointing at the target project.
- [ ] Dry-run executed: `npm run backfill:audit-chain -- --dry-run --limit 10`
- [ ] Dry-run output sanity-checked (5 sample rows printed, exit 0).
- [ ] Real run executed: `npm run backfill:audit-chain`
- [ ] Real run summary line read: `[backfill] DONE: total=N, updated=N, skipped=0, errors=0`
- [ ] Verifier run: `npm run verify:audit-chain`
- [ ] Verifier reports `CLEAN` (or `CLEAN-WITH-FORKS`) - no tampers.

## Run sequence

### Step 1 - Dry-run smoke test

Run the backfill in preview mode against the first 10 NULL-row_hash rows. Nothing is written to the database; the script computes hashes and prints what it WOULD update.

```bash
npm run backfill:audit-chain -- --dry-run --limit 10
```

Expected output shape:

```
[backfill] starting audit_log row_hash backfill
[backfill] mode:           DRY RUN
[backfill] batch size:     1000
[backfill] limit:          10
[backfill] from_created_at: (none)
[backfill] from_id:        (none)

[backfill] NULL-hash rows in scope: 858
[backfill] processing at most:      10 (--limit)

[backfill] genesis prev_hash: (null - true genesis)

[backfill] 10 rows processed, last_id=..., last_created_at=...

[backfill] DRY RUN: would update 10 row(s)

[backfill] first 5 row(s) to update:
  - 2025-... id=... prev=(null - genesis) hash=...
  - 2025-... id=... prev=... hash=...
  ...

[backfill] last 5 row(s) to update:
  - 2025-... id=... prev=... hash=...
  ...
```

Exit code should be `0`. If you see `setup error` exit 2, double-check the env vars.

### Step 2 - Full backfill

Run without flags. Expect 10-20 seconds total for ~858 rows; per-batch progress is logged every 1000 rows (so for ~858 you get one batch progress log + the summary).

```bash
npm run backfill:audit-chain
```

Expected summary:

```
[backfill] DONE: total=858, updated=858, skipped=0, errors=0
```

Exit code: `0`.

If `errors > 0`: the script logs each per-row error inline. The most common cause is a transient network hiccup. The script is idempotent (`WHERE row_hash IS NULL` on every UPDATE), so you can simply re-run the command and it will pick up only the still-NULL rows:

```bash
npm run backfill:audit-chain
```

If `skipped > 0`: that means some rows already had a non-NULL row_hash when the backfill tried to update them. This is expected on a re-run; on a fresh run it would indicate either (a) a concurrent insert happened to populate those rows between the SELECT and the UPDATE, or (b) someone else already ran a partial backfill. Neither is an error.

### Step 3 - Verify

Run the verifier. It will now walk every row in the table, not just the post-044 ones.

```bash
npm run verify:audit-chain
```

Expected:

```
[verify-audit-chain] total rows scanned: 858+N (where N is the post-044 count)
[verify-audit-chain] clean rows:         858+N
[verify-audit-chain] forks detected:     0 (or a small number, see verifier docs)
[verify-audit-chain] tampers detected:   0

[verify-audit-chain] CLEAN: every row_hash matches the linear chain
```

Exit code: `0`.

If the verifier reports tampers AFTER the backfill: investigate. The most likely cause is an algorithm mismatch between the backfill's `computeRowHash` invocation and what the runtime writer used. Both pull `computeRowHash`, `toChainRow`, and `canonicalSerializeChainRow` from the same `lib/repos/audit-log.ts` module, so a mismatch is unlikely unless the module changed between when the post-044 rows were written and when the backfill ran. If that happened, see the rollback section below.

## Flags reference

| Flag | Default | Meaning |
| --- | --- | --- |
| `--dry-run` | off | Print what WOULD be updated (first 5 + last 5 of the targeted rows), do NOT execute UPDATEs. |
| `--batch-size <N>` | `1000` | Page size for SELECT + per-row UPDATE loop. |
| `--limit <N>` | unlimited | Process at most N rows. Useful for spot-checks. |
| `--from-created-at <iso>` | (none) | Resume cursor: skip rows with `created_at < this`. |
| `--from-id <uuid>` | (none) | Resume cursor tiebreaker for rows sharing a `created_at`. Paired with `--from-created-at`. |
| `-h`, `--help` | - | Show CLI usage. |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success. All targeted rows backfilled (or dry-run completed). |
| `1` | One or more rows errored during UPDATE. Chain has a gap; re-run the script (idempotent) to retry. |
| `2` | Setup error: missing env, DB unreachable, migration 044 not applied, invalid CLI flag, or resume cursor sits in the still-NULL prefix. |

## Rollback / recovery

There is no clean rollback. The backfill changes `row_hash` from `NULL` to a hex string. Re-running the backfill on the same row is idempotent because of the `WHERE row_hash IS NULL` clause: already-backfilled rows are skipped.

**If a row gets a wrong hash** (e.g., the canonical serializer is changed AFTER backfill, or there's a subtle bug we didn't catch):

1. The verifier will flag the affected rows as TAMPER (exit code 1).
2. To redo just the affected rows, manually NULL their `row_hash` via Studio or psql:
   ```sql
   UPDATE audit_log SET row_hash = NULL
     WHERE id IN ('<id1>', '<id2>', ...);
   ```
3. Re-run the backfill: `npm run backfill:audit-chain`. Only the just-NULLed rows will be picked up.
4. Re-run the verifier.

**If the entire chain is corrupted** (e.g., the canonical serializer was changed in a way that affects every row): NULL out every `row_hash` and re-run from scratch:

```sql
UPDATE audit_log SET row_hash = NULL;
```

Then `npm run backfill:audit-chain` will rebuild the chain end-to-end. NOTE: this rewrites the post-migration-044 rows too, so the chain state at any given moment is no longer a perfect record of "what was written at the time of insert" - but the resulting chain is internally consistent and the verifier will pass.

## Algorithm contract (load-bearing)

The backfill uses the EXACT same primitives the runtime writer uses:

- `computeRowHash(prevHashHex, chainRow)` from `lib/repos/audit-log.ts`
- `canonicalSerializeChainRow(chainRow)` from `lib/repos/audit-log.ts`
- `toChainRow(encryptedRow)` from `lib/repos/audit-log.ts`

These are already exported (verified at script-author-time; no edits to `lib/repos/audit-log.ts` were required).

If `toChainRow` or `canonicalSerializeChainRow` ever changes its field set / key order / null handling, this backfill MUST be re-run end-to-end (after NULLing the entire `row_hash` column) - the chain format is a single global invariant, not a per-row choice.

## Why we don't roll the chain through pgsql directly

The canonical serializer is JS-side (UTF-8 byte-exact `JSON.stringify` over a known key order). Re-implementing the serializer in Postgres / plpgsql is feasible but risky: any divergence in JSON formatting (e.g. number serialization, escape rules, ordering) would silently produce different hashes from the JS writer. By using the JS path for backfill we guarantee the historical rows hash identically to the post-044 rows.

## Performance notes

- ~858 rows in scope on prod as of 2026-05-20. Expected total: 10-20 seconds wall-clock at the default batch size of 1000.
- Each iteration: one `SELECT *` page fetch + N per-row `UPDATE` round-trips. Postgres + Supabase REST handle this comfortably at audit-log scale (no rate limit risk).
- Memory: only the current batch is held in memory; pages older than the current one are discarded.

## Re-running safely

The backfill is fully idempotent. You can run it any number of times. A re-run on a fully-backfilled chain prints:

```
[backfill] NULL-hash rows in scope: 0

[backfill] nothing to do; the chain is fully backfilled.
```

Exit code: `0`.
