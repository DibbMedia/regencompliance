// One-time backfill for the audit_log tamper-evident hash chain (mig 044).
//
// Run:
//   npx tsx scripts/backfill-audit-chain.ts [flags]
//   npm run backfill:audit-chain -- [flags]
//
// Required env:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// (ENCRYPTION_KEY_V1 is NOT required - the chain hash is over the encrypted
// envelopes already persisted on disk, not over plaintext, so the backfill
// never invokes the crypto layer.)
//
// Flags:
//   --dry-run                    Compute hashes + print first 5 and last 5 rows
//                                that would be updated, do NOT execute UPDATEs.
//                                Exit 0 on success.
//   --batch-size <N>             Page size for SELECT + UPDATE loop. Default 1000.
//   --limit <N>                  Process at most N rows. Default unlimited.
//   --from-id <uuid>             Resume cursor: skip rows with id <= this id at
//                                the from-created-at boundary (tiebreaker only;
//                                paired with --from-created-at).
//   --from-created-at <iso>      Resume cursor: skip rows with created_at < this
//                                value. Use the last printed cursor from a
//                                prior partial run.
//
// Exit codes:
//   0  success (all targeted rows backfilled, or dry-run completed)
//   1  one or more rows errored during update (chain may have a gap)
//   2  setup error (missing env, DB unreachable, prereq missing)
//
// Algorithm:
//   1. Determine the chain prev_hash. We need the row_hash of the row whose
//      created_at is the largest value LESS THAN the first NULL-row_hash row
//      we are about to backfill. If the table has no chained rows at all the
//      prev for the very first NULL row is null (genesis).
//
//      In practice the schema means rows are EITHER pre-chain (NULL row_hash,
//      inserted before migration 044) OR chained (row_hash NOT NULL, inserted
//      after). So the chain prefix-suffix order is:
//         [pre-chain rows: NULL row_hash, oldest first]
//         [chained rows:  row_hash NOT NULL, oldest first]
//
//      The backfill walks the pre-chain rows in created_at ASC and links each
//      one off the previous BACKFILLED row's hash. The genesis row gets
//      prev=null. After the last pre-chain row is backfilled the chain joins
//      cleanly to whatever the first chained-row's prev_hash was (NULL in the
//      worst case, which is fine because computeRowHash treats null prev as
//      empty-string prev, which is exactly what the existing chained writer
//      did when it saw a NULL most-recent row).
//
//      Caveat: if a chained row exists between two NULL-hash rows (shouldn't
//      happen under the current schema; would require an INSERT-skip-then-
//      INSERT pattern that the runtime path doesn't take), we still process
//      every NULL row in created_at ASC order linked to the previous NULL
//      row's just-computed hash. Documented as "backfill chains every NULL
//      row in chronological order using the previous BACKFILLED row's hash."
//
//   2. Page through NULL-row_hash rows in created_at ASC, batch_size at a
//      time. For each row:
//         - Build the chain row from the on-disk encrypted columns.
//         - Compute row_hash = sha256(prevHash || canonical_serialize).
//         - UPDATE audit_log SET row_hash = $1
//             WHERE id = $2 AND row_hash IS NULL
//           (the row_hash IS NULL clause makes the operation idempotent: a
//            mid-flight rerun never overwrites an already-backfilled row.)
//         - prevHash := this row's computed hash, for the next iteration.
//
//   3. After every batch: log progress. After the last row: log summary.
//
//   4. Errors caught per-row + logged + counted; the script does not abort
//      on one bad row. Exit 1 if any errors.

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import {
  computeRowHash,
  toChainRow,
  type AuditLogEncryptedRow,
} from "@/lib/repos/audit-log"

interface CliFlags {
  dryRun: boolean
  batchSize: number
  limit: number | null
  fromId: string | null
  fromCreatedAt: string | null
}

function parseFlags(argv: string[]): CliFlags {
  const flags: CliFlags = {
    dryRun: false,
    batchSize: 1000,
    limit: null,
    fromId: null,
    fromCreatedAt: null,
  }

  // Skip the first two argv entries (node + script path).
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case "--dry-run":
        flags.dryRun = true
        break
      case "--batch-size": {
        const v = argv[++i]
        const n = Number.parseInt(v ?? "", 10)
        if (!Number.isFinite(n) || n <= 0) {
          console.error(`[backfill] invalid --batch-size: ${v}`)
          process.exit(2)
        }
        flags.batchSize = n
        break
      }
      case "--limit": {
        const v = argv[++i]
        const n = Number.parseInt(v ?? "", 10)
        if (!Number.isFinite(n) || n <= 0) {
          console.error(`[backfill] invalid --limit: ${v}`)
          process.exit(2)
        }
        flags.limit = n
        break
      }
      case "--from-id": {
        const v = argv[++i]
        if (!v) {
          console.error(`[backfill] --from-id requires a value`)
          process.exit(2)
        }
        flags.fromId = v
        break
      }
      case "--from-created-at": {
        const v = argv[++i]
        if (!v) {
          console.error(`[backfill] --from-created-at requires a value`)
          process.exit(2)
        }
        // Validate ISO-ish: Postgres tolerates a wide range but we surface
        // obvious typos here so the operator catches them before the run.
        if (Number.isNaN(Date.parse(v))) {
          console.error(`[backfill] --from-created-at is not a parseable date: ${v}`)
          process.exit(2)
        }
        flags.fromCreatedAt = v
        break
      }
      case "--help":
      case "-h":
        printUsage()
        process.exit(0)
        // eslint-disable-next-line no-fallthrough
      default:
        console.error(`[backfill] unknown flag: ${arg}`)
        printUsage()
        process.exit(2)
    }
  }

  return flags
}

function printUsage(): void {
  console.log(
    [
      "Usage: tsx scripts/backfill-audit-chain.ts [flags]",
      "",
      "Flags:",
      "  --dry-run                  Print preview, do not execute UPDATEs.",
      "  --batch-size <N>           Page size (default 1000).",
      "  --limit <N>                Process at most N rows.",
      "  --from-id <uuid>           Resume cursor (tiebreaker for from-created-at).",
      "  --from-created-at <iso>    Resume cursor (skip rows older than this).",
      "  -h, --help                 Show this help.",
      "",
      "Exit codes: 0=ok, 1=per-row errors, 2=setup error.",
    ].join("\n"),
  )
}

function requireEnv(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) {
    console.error(`[backfill] missing required env var: ${name}`)
    process.exit(2)
  }
  return v
}

// Find the prev_hash to chain the first NULL-row_hash row off of. This is the
// row_hash of the most-recent already-chained row whose created_at is STRICTLY
// LESS than the oldest NULL-hash row we'll process. In the realistic schema
// (all NULL rows come before all chained rows, see header comment) this is
// either:
//   - null (no chained rows exist yet; the very first NULL row is genesis), OR
//   - the row_hash of the most-recent chained row that sits before the cursor
//     (rare path; only relevant when a resume cursor is provided).
//
// For the no-cursor case we want null - the backfill starts at the very
// oldest NULL row and that row is genesis. We could instead look up "the row
// immediately before this NULL row in created_at order, whether chained or
// not" but the schema invariant (NULLs are oldest) means that's null anyway.
async function determineGenesisPrevHash(
  client: SupabaseClient,
  fromCreatedAt: string | null,
): Promise<string | null> {
  // If no resume cursor: the first NULL row is genesis prev=null.
  if (!fromCreatedAt) return null

  // With a resume cursor we need to recover the chain state at that point.
  // We look for the most-recent row (chained or not) STRICTLY BEFORE the
  // cursor. If it's chained, use its row_hash. If it's pre-chain (NULL
  // hash), we can't recover the chain state without re-walking from the
  // beginning - the operator should re-run without the cursor in that
  // case. We surface that and exit 2.
  const { data, error } = await client
    .from("audit_log")
    .select("id, row_hash, created_at")
    .lt("created_at", fromCreatedAt)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error(`[backfill] resume-cursor prev-hash lookup failed: ${error.message}`)
    process.exit(2)
  }

  if (!data) {
    // No rows before the cursor at all - cursor was before genesis.
    return null
  }

  if (data.row_hash === null) {
    console.error(
      [
        "[backfill] cannot resume from --from-created-at because the row",
        `[backfill] immediately before ${fromCreatedAt} (id=${data.id}) is NOT YET`,
        "[backfill] backfilled (row_hash IS NULL). Re-run WITHOUT the cursor so",
        "[backfill] the backfill starts from the chain genesis. The WHERE",
        "[backfill] row_hash IS NULL clause makes this safe to do - already-",
        "[backfill] backfilled rows are skipped automatically.",
      ].join("\n"),
    )
    process.exit(2)
  }

  return data.row_hash
}

interface FetchPageArgs {
  client: SupabaseClient
  batchSize: number
  fromCreatedAt: string | null
  fromId: string | null
}

async function fetchPage(args: FetchPageArgs): Promise<AuditLogEncryptedRow[]> {
  const { client, batchSize, fromCreatedAt, fromId } = args
  let query = client
    .from("audit_log")
    .select("*")
    .is("row_hash", null)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(batchSize)

  if (fromCreatedAt) {
    // Use gte combined with the id tiebreaker, so the page after a resume
    // cursor starts at the right place. The id tiebreaker matters when
    // multiple rows share a created_at value at sub-millisecond precision.
    query = query.gte("created_at", fromCreatedAt)
    if (fromId) {
      // Open-half-interval at the cursor: we want rows strictly AFTER
      // (created_at, id). PostgREST does not support tuple comparison, so
      // we approximate with: (created_at > fromCreatedAt) OR
      //                     (created_at = fromCreatedAt AND id > fromId)
      // We can't easily express OR in PostgREST without `.or()`, so we
      // structure as:
      query = query.or(
        `created_at.gt.${fromCreatedAt},and(created_at.eq.${fromCreatedAt},id.gt.${fromId})`,
      )
    }
  }

  const { data, error } = await query
  if (error) {
    console.error(`[backfill] page fetch failed: ${error.message}`)
    process.exit(2)
  }
  return (data ?? []) as unknown as AuditLogEncryptedRow[]
}

interface RowPreview {
  id: string
  created_at: string
  computed_hash: string
  prev_hash: string | null
}

async function updateRowHash(
  client: SupabaseClient,
  id: string,
  rowHash: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Idempotency guard: WHERE row_hash IS NULL. If a concurrent or prior
  // backfill already filled this row, the UPDATE matches zero rows and we
  // surface that as a "skipped" outcome (not an error).
  const { error, count } = await client
    .from("audit_log")
    .update({ row_hash: rowHash }, { count: "exact" })
    .eq("id", id)
    .is("row_hash", null)

  if (error) return { ok: false, error: error.message }
  // count is the number of rows affected by the UPDATE; 0 means the
  // row_hash was already non-null. The caller treats that as "skipped".
  if (count === 0) return { ok: false, error: "skipped (row_hash already populated)" }
  return { ok: true }
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv)

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`[backfill] starting audit_log row_hash backfill`)
  console.log(`[backfill] mode:           ${flags.dryRun ? "DRY RUN" : "WRITE"}`)
  console.log(`[backfill] batch size:     ${flags.batchSize}`)
  console.log(`[backfill] limit:          ${flags.limit ?? "(unlimited)"}`)
  console.log(`[backfill] from_created_at: ${flags.fromCreatedAt ?? "(none)"}`)
  console.log(`[backfill] from_id:        ${flags.fromId ?? "(none)"}`)
  console.log("")

  // Sanity check: confirm the row_hash column exists. Selecting it from any
  // row is the cheapest way to catch "migration 044 not yet applied".
  {
    const { error } = await client
      .from("audit_log")
      .select("row_hash")
      .limit(1)
    if (error) {
      console.error(
        `[backfill] preflight failed (is migration 044 applied?): ${error.message}`,
      )
      process.exit(2)
    }
  }

  // Count NULL-hash rows we'll process (informational, helps the operator
  // size expectations). Capped by --limit if provided.
  {
    let countQuery = client
      .from("audit_log")
      .select("id", { count: "exact", head: true })
      .is("row_hash", null)
    if (flags.fromCreatedAt) countQuery = countQuery.gte("created_at", flags.fromCreatedAt)
    const { count, error } = await countQuery
    if (error) {
      console.error(`[backfill] count query failed: ${error.message}`)
      process.exit(2)
    }
    const total = count ?? 0
    const capped = flags.limit !== null ? Math.min(total, flags.limit) : total
    console.log(`[backfill] NULL-hash rows in scope: ${total}`)
    if (flags.limit !== null) {
      console.log(`[backfill] processing at most:      ${capped} (--limit)`)
    }
    console.log("")
    if (total === 0) {
      console.log("[backfill] nothing to do; the chain is fully backfilled.")
      process.exit(0)
    }
  }

  let prevHash = await determineGenesisPrevHash(client, flags.fromCreatedAt)
  console.log(
    `[backfill] genesis prev_hash: ${
      prevHash === null ? "(null - true genesis)" : prevHash.slice(0, 16) + "..."
    }`,
  )
  console.log("")

  let totalProcessed = 0
  let updated = 0
  let skipped = 0
  let errors = 0
  let cursorCreatedAt: string | null = flags.fromCreatedAt
  let cursorId: string | null = flags.fromId

  // For dry-run preview: collect the first 5 and last 5 rows we would update.
  // We track the last 5 with a simple ring-buffer-via-array of length <= 5.
  const previewFirst: RowPreview[] = []
  const previewLast: RowPreview[] = []

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Stop if we've hit --limit.
    if (flags.limit !== null && totalProcessed >= flags.limit) break

    // Compute how many rows to fetch in this page: batch size, clamped to
    // remaining limit.
    const remainingLimit =
      flags.limit !== null ? Math.max(0, flags.limit - totalProcessed) : flags.batchSize
    const pageSize = Math.min(flags.batchSize, remainingLimit)
    if (pageSize === 0) break

    const page = await fetchPage({
      client,
      batchSize: pageSize,
      fromCreatedAt: cursorCreatedAt,
      fromId: cursorId,
    })

    if (page.length === 0) break

    for (const row of page) {
      const chainRow = toChainRow(row)
      const computedHash = computeRowHash(prevHash, chainRow)

      if (flags.dryRun) {
        const preview: RowPreview = {
          id: row.id,
          created_at: row.created_at,
          computed_hash: computedHash,
          prev_hash: prevHash,
        }
        if (previewFirst.length < 5) {
          previewFirst.push(preview)
        }
        // Always keep the last 5 we've seen.
        previewLast.push(preview)
        if (previewLast.length > 5) previewLast.shift()
      } else {
        const result = await updateRowHash(client, row.id, computedHash)
        if (result.ok) {
          updated += 1
        } else if (result.error.startsWith("skipped")) {
          // Already had a hash - someone else backfilled this row, or a
          // prior run partially completed and this one is finishing it.
          skipped += 1
        } else {
          errors += 1
          console.error(
            `[backfill] update failed for id=${row.id}: ${result.error}`,
          )
          // We still advance prevHash to the COMPUTED hash here, even
          // though the UPDATE failed. Rationale: this row's hash is
          // deterministic; if the operator re-runs after fixing the
          // underlying error, the WHERE row_hash IS NULL clause will
          // pick this row up again, and the computed hash for the
          // NEXT row remains correct. Alternative (advancing to NULL
          // / skipping) would force a re-walk from the previous
          // good row, which is more expensive.
        }
      }

      // Advance bookkeeping.
      totalProcessed += 1
      prevHash = computedHash
      cursorCreatedAt = row.created_at
      cursorId = row.id

      if (flags.limit !== null && totalProcessed >= flags.limit) break
    }

    // Progress log per batch (only every batchSize rows, not per row).
    console.log(
      `[backfill] ${totalProcessed} rows processed, last_id=${cursorId}, last_created_at=${cursorCreatedAt}`,
    )

    // If the page came back smaller than what we asked for, we're done.
    if (page.length < pageSize) break
  }

  console.log("")

  if (flags.dryRun) {
    console.log(`[backfill] DRY RUN: would update ${totalProcessed} row(s)`)
    console.log("")
    if (previewFirst.length > 0) {
      console.log(`[backfill] first ${previewFirst.length} row(s) to update:`)
      for (const p of previewFirst) {
        const prev = p.prev_hash === null ? "(null - genesis)" : p.prev_hash.slice(0, 16) + "..."
        console.log(
          `  - ${p.created_at}  id=${p.id}  prev=${prev}  hash=${p.computed_hash.slice(0, 16)}...`,
        )
      }
    }
    // Only show "last" preview if we actually saw more than 5 rows and the
    // last batch contains rows we didn't already show. Otherwise the same
    // rows would appear twice.
    if (totalProcessed > previewFirst.length && previewLast.length > 0) {
      const lastNotInFirst = previewLast.filter(
        (p) => !previewFirst.some((f) => f.id === p.id),
      )
      if (lastNotInFirst.length > 0) {
        console.log("")
        console.log(`[backfill] last ${lastNotInFirst.length} row(s) to update:`)
        for (const p of lastNotInFirst) {
          const prev = p.prev_hash === null ? "(null - genesis)" : p.prev_hash.slice(0, 16) + "..."
          console.log(
            `  - ${p.created_at}  id=${p.id}  prev=${prev}  hash=${p.computed_hash.slice(0, 16)}...`,
          )
        }
      }
    }
    process.exit(0)
  }

  console.log(
    `[backfill] DONE: total=${totalProcessed}, updated=${updated}, skipped=${skipped}, errors=${errors}`,
  )
  if (errors > 0) {
    console.error(
      `[backfill] ${errors} row(s) failed to update. Re-run the backfill to retry (idempotent).`,
    )
    process.exit(1)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error("[backfill] fatal error:", e)
  process.exit(2)
})
