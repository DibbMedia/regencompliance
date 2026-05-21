// Periodic verifier for the audit_log tamper-evident hash chain (mig 044).
//
// Run:
//   npx tsx scripts/verify-audit-chain.ts
//   npm run verify:audit-chain
//
// Required env:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Optional env:
//   ENCRYPTION_KEY_V1   (not used directly; left here for parity with the
//                        other verifier scripts. The chain hash is over the
//                        ENCRYPTED envelopes, not the plaintext, so we don't
//                        decrypt anything.)
//
// Exit codes:
//   0  clean chain OR clean-with-forks-only (no post-hoc mutations detected)
//   1  one or more TAMPERS detected (post-hoc mutation of stored hash)
//   2  setup error (missing env, DB unreachable, etc.)
//
// What it checks:
//   - Selects all audit_log rows where row_hash IS NOT NULL, ordered by
//     created_at ASC, paginated 1000 rows/page.
//   - For each row, recomputes TWO candidate hashes and compares to the
//     stored `row_hash`:
//       1. expectedLinear = sha256(prevRowActualHash || serialize(thisRow))
//          -> the "honest, serialized" chain extension off the immediately
//          preceding row.
//       2. expectedFork   = sha256(lastPrevHash || serialize(thisRow))
//          -> "what would this hash be if this row had read the SAME parent
//          as the previous row did?" i.e. a concurrent-insert fork.
//   - Classification:
//       stored == expectedLinear -> CLEAN (chain matches)
//       stored == expectedFork   -> FORK  (concurrent insert against the
//                                          same parent the previous row
//                                          already chained off of)
//       otherwise                -> TAMPER (stored hash matches neither
//                                          the linear extension NOR the
//                                          fork pattern - this is a sign
//                                          of post-hoc mutation, NOT
//                                          honest concurrency)
//
// Why distinguish:
//   A FORK is a legitimate consequence of two near-simultaneous INSERTs
//   that both read the same prev_hash before either commits. Both rows
//   compute their hash off the same parent; one ends up earlier in
//   created_at order, the other later. The "later" one's stored hash will
//   not chain off the "earlier" one's hash, but it WILL chain off the
//   grandparent (the parent both inserts saw). That's not tampering -
//   it's append-only honest concurrency, observable from outside the DB.
//
//   A TAMPER is a stored hash that matches NEITHER the linear extension
//   nor the fork pattern. That means someone (or something) wrote a
//   value that the honest writer code would never produce - either a
//   chosen hash, or a re-hash after the row's encrypted columns were
//   mutated. This is the failure mode the chain is designed to surface.
//
// Walk semantics on mismatch:
//   After ANY mismatch (fork or tamper), we still chain forward off the
//   row's STORED row_hash. Downstream rows are checked against the
//   actually-persisted parent, so a single bad row doesn't cascade into
//   N "descendants of a bad parent" false positives.
//
// `lastPrevHash` bookkeeping:
//   For the linear check we need the previous row's STORED hash (that's
//   `prevHash` below). For the fork check we need the prev_hash the
//   PREVIOUS row was computed from - the grandparent. We track that as
//   `lastPrevHash`. On the genesis row both are null.
//
// Caveats (v2 — fork detection, but still detection-of-casual-tampering):
//   - Fork detection is best-effort. A sophisticated tamperer who knows
//     the chain format could compute a "fork pattern" hash for their
//     mutated row to disguise it as concurrent-insert noise. The chain
//     is detection-of-casual-tampering + correctness-under-honest-
//     concurrency, NOT Byzantine-fault-tolerant: it deters and surfaces
//     careless / panicked mutation by an attacker with DB write access,
//     it does not stop a determined one who is willing to re-hash.
//   - If forks are routine (>1% of scanned rows), the operator should
//     investigate whether audit-log INSERT pattern needs serialization
//     (e.g. a Postgres serial advisory lock around the prev-hash read
//     and the INSERT, or a unique constraint on prev_hash to force
//     retries). The current write rate (single-digit ops/sec) should
//     produce fork rates on the order of 0.001% or less.
//   - Pre-chain rows (row_hash IS NULL, inserted before mig 044) are
//     skipped entirely — they form an unverifiable prefix. A separate
//     one-time backfill script (out of scope) could chain-hash them.
//   - The chain commits to the ENCRYPTED column envelopes, so a tamper
//     that swaps one valid envelope for another (e.g., reusing an old
//     envelope from a different row) still changes the hash because AAD
//     binds envelope content to (table, column, rowId). This is by design:
//     the chain asserts persisted state, not decrypted meaning.

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import {
  canonicalSerializeChainRow,
  computeRowHash,
  toChainRow,
  type AuditLogEncryptedRow,
} from "@/lib/repos/audit-log"

const PAGE_SIZE = 1000

function requireEnv(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) {
    console.error(`[verify-audit-chain] missing required env var: ${name}`)
    process.exit(2)
  }
  return v
}

interface Fork {
  row_id: string
  created_at: string
  // The grandparent hash that both this row and the previous row chained
  // off of. Surfaced for operator triage.
  grandparent_hash: string | null
  stored_hash: string
}

interface Tamper {
  row_id: string
  created_at: string
  // Hash the row WOULD have had under linear chain extension off the
  // previous row's stored hash.
  expected_linear_hash: string
  // Hash the row would have had under the fork pattern (chained off the
  // grandparent). Surfaced so the operator can see that BOTH honest
  // patterns failed.
  expected_fork_hash: string
  // What is actually persisted on the row.
  stored_hash: string
  prev_hash: string | null
  grandparent_hash: string | null
  // The canonical-serialized form of the row, for forensic comparison.
  canonical: string
}

async function fetchChainPage(
  client: SupabaseClient,
  fromRange: number,
  toRange: number,
): Promise<AuditLogEncryptedRow[]> {
  const { data, error } = await client
    .from("audit_log")
    .select("*")
    .not("row_hash", "is", null)
    .order("created_at", { ascending: true })
    .range(fromRange, toRange)
  if (error) {
    console.error(`[verify-audit-chain] page fetch failed: ${error.message}`)
    process.exit(2)
  }
  return (data ?? []) as unknown as AuditLogEncryptedRow[]
}

async function main(): Promise<void> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`[verify-audit-chain] starting walk of audit_log hash chain`)
  console.log(`[verify-audit-chain] page size: ${PAGE_SIZE}`)
  console.log("")

  let totalScanned = 0
  let cleanCount = 0
  // prevHash: the STORED row_hash of the immediately-preceding row. Used
  // for the linear chain check. Initially null (genesis prev).
  let prevHash: string | null = null
  // lastPrevHash: the prev_hash the PREVIOUS row computed FROM. i.e. the
  // grandparent's stored hash. Used for the fork check. Initially null.
  let lastPrevHash: string | null = null

  const forks: Fork[] = []
  const tampers: Tamper[] = []

  let pageStart = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await fetchChainPage(client, pageStart, pageStart + PAGE_SIZE - 1)
    if (page.length === 0) break

    for (const row of page) {
      totalScanned += 1
      const chainRow = toChainRow(row)
      const expectedLinear = computeRowHash(prevHash, chainRow)
      const expectedFork = computeRowHash(lastPrevHash, chainRow)
      const stored = (row.row_hash ?? "").toString().trim().toLowerCase()

      // Classification:
      //   1. stored matches the linear extension -> clean.
      //   2. stored matches the fork pattern (chain off grandparent) ->
      //      legitimate concurrent insert; report informationally.
      //   3. otherwise -> tamper.
      // Order matters: if lastPrevHash === prevHash (e.g., genesis), then
      // expectedLinear === expectedFork and we land in the linear branch
      // first, which is correct.
      if (stored === expectedLinear) {
        cleanCount += 1
      } else if (stored === expectedFork && lastPrevHash !== prevHash) {
        // A fork is only meaningful when the grandparent is distinct
        // from the parent. If they're equal we'd be classifying a clean
        // row as a fork, which is wrong. The `lastPrevHash !== prevHash`
        // guard is redundant when stored === expectedLinear (handled
        // above), but kept here for defensive clarity.
        forks.push({
          row_id: row.id,
          created_at: row.created_at,
          grandparent_hash: lastPrevHash,
          stored_hash: stored,
        })
      } else {
        tampers.push({
          row_id: row.id,
          created_at: row.created_at,
          expected_linear_hash: expectedLinear,
          expected_fork_hash: expectedFork,
          stored_hash: stored,
          prev_hash: prevHash,
          grandparent_hash: lastPrevHash,
          canonical: canonicalSerializeChainRow(chainRow),
        })
      }

      // Advance the two trackers:
      //   lastPrevHash := the prev_hash THIS row was computed from. For a
      //     clean row that's `prevHash`. For a fork it's `lastPrevHash`
      //     (because the fork chained off the grandparent). For a tamper
      //     we don't know, so we conservatively use `prevHash` - that's
      //     what an honest writer would have used.
      //   prevHash := this row's stored hash (so the NEXT row's linear
      //     check chains off the actually-persisted parent, not the
      //     recomputed `expectedLinear`).
      if (stored === expectedLinear) {
        lastPrevHash = prevHash
      } else if (stored === expectedFork && lastPrevHash !== prevHash) {
        // Fork: this row chained off the grandparent, so the prev_hash
        // it "saw" was lastPrevHash. Leave lastPrevHash unchanged.
        // (The NEXT row's grandparent is this row's parent, which is
        //  still lastPrevHash from the fork's perspective. But the next
        //  row likely chained off prevHash like a normal extension. To
        //  keep the linear check honest going forward, we update
        //  lastPrevHash := prevHash here too — the fork is a one-off
        //  branch and we resume the linear discipline from this row.)
        lastPrevHash = prevHash
      } else {
        // Tamper: best guess for what the honest writer would have used.
        lastPrevHash = prevHash
      }

      prevHash = stored.length > 0 ? stored : null
    }

    if (page.length < PAGE_SIZE) break
    pageStart += PAGE_SIZE
  }

  // ---------- Report ----------

  console.log(`[verify-audit-chain] total rows scanned: ${totalScanned}`)
  console.log(`[verify-audit-chain] clean rows:         ${cleanCount}`)
  console.log(`[verify-audit-chain] forks detected:     ${forks.length}`)
  console.log(`[verify-audit-chain] tampers detected:   ${tampers.length}`)
  console.log("")

  // Forks are informational. Surface row ids so the operator can audit.
  if (forks.length > 0) {
    const forkRatePct =
      totalScanned > 0 ? ((forks.length / totalScanned) * 100).toFixed(3) : "0.000"
    console.log(`[verify-audit-chain] FORKS (concurrent-insert noise, not tampering)`)
    console.log(`[verify-audit-chain] fork rate: ${forkRatePct}% of scanned rows`)
    if (forks.length > 0 && totalScanned > 0 && forks.length / totalScanned > 0.01) {
      console.log(
        `[verify-audit-chain] WARNING: fork rate exceeds 1% - audit-log INSERT pattern`,
      )
      console.log(
        `[verify-audit-chain]          may need serialization (advisory lock around`,
      )
      console.log(
        `[verify-audit-chain]          prev-hash read + INSERT, or unique constraint`,
      )
      console.log(`[verify-audit-chain]          on prev_hash to force retries).`)
    }
    const previewLimit = 10
    const preview = forks.slice(0, previewLimit)
    for (const f of preview) {
      console.log(
        `  - ${f.created_at}  row_id=${f.row_id}  grandparent=${
          (f.grandparent_hash ?? "(null - genesis)").slice(0, 16)
        }...`,
      )
    }
    if (forks.length > previewLimit) {
      console.log(`  ... and ${forks.length - previewLimit} more`)
    }
    console.log("")
  }

  // Tampers are the failure mode. Exit-code 1 ONLY if any tampers found.
  if (tampers.length === 0) {
    if (forks.length === 0) {
      console.log("[verify-audit-chain] CLEAN: every row_hash matches the linear chain")
    } else {
      console.log(
        "[verify-audit-chain] CLEAN-WITH-FORKS: no tampers detected; forks are honest",
      )
      console.log(
        "[verify-audit-chain]                  concurrent-insert noise (see above)",
      )
    }
    process.exit(0)
  }

  console.error(`[verify-audit-chain] TAMPER DETECTED`)
  console.error(`[verify-audit-chain] total tampers: ${tampers.length}`)
  console.error("")

  // Report the first tamper in detail (the rest may be downstream noise
  // depending on whether they're independent mutations).
  const first = tampers[0]
  console.error(`[verify-audit-chain] first tamper:`)
  console.error(`  row_id:               ${first.row_id}`)
  console.error(`  created_at:           ${first.created_at}`)
  console.error(`  prev_hash:            ${first.prev_hash ?? "(null - genesis)"}`)
  console.error(`  grandparent_hash:     ${first.grandparent_hash ?? "(null - genesis)"}`)
  console.error(`  expected_linear_hash: ${first.expected_linear_hash}`)
  console.error(`  expected_fork_hash:   ${first.expected_fork_hash}`)
  console.error(`  stored_hash:          ${first.stored_hash}`)
  console.error(`  canonical:            ${first.canonical}`)
  console.error("")

  // Show up to 5 additional tampers for quick triage.
  const extras = tampers.slice(1, 6)
  if (extras.length > 0) {
    console.error(`[verify-audit-chain] next ${extras.length} tampers:`)
    for (const t of extras) {
      console.error(
        `  - ${t.created_at}  row_id=${t.row_id}  stored=${t.stored_hash.slice(0, 16)}...`,
      )
    }
    if (tampers.length > 6) {
      console.error(`  ... and ${tampers.length - 6} more`)
    }
  }

  process.exit(1)
}

main().catch((e) => {
  console.error("[verify-audit-chain] fatal error:", e)
  process.exit(2)
})
