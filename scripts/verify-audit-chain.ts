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
//   0  clean chain (every row's row_hash matches recomputed value)
//   1  one or more chain breaks detected (post-hoc tampering or fork)
//   2  setup error (missing env, DB unreachable, etc.)
//
// What it checks:
//   - Selects all audit_log rows where row_hash IS NOT NULL, ordered by
//     created_at ASC, paginated 1000 rows/page.
//   - For each row, recomputes `expected = sha256(prev_row_hash_or_empty ||
//     canonical_serialize(row))` and compares to the stored `row_hash`.
//   - On first mismatch: reports the row id + expected vs actual hex, then
//     walks the rest of the chain counting subsequent rows that descend
//     from a bad parent (i.e., rows whose stored row_hash chains off the
//     compromised row).
//
// Caveats (v1 acceptable):
//   - Forks from concurrent inserts: if two writes near the same instant
//     both read the same prev_hash, they both compute hashes off the same
//     parent and the chain forks. The verifier walks rows in created_at
//     ASC order and will report a fork as a mismatch at the second of the
//     two. Production audit-log write rate is single-digit ops/sec; fork
//     rate is near-zero. v2 could add a DB unique constraint on row_hash
//     or pessimistically lock the latest row, but neither is in scope here.
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

interface Mismatch {
  row_id: string
  created_at: string
  expected_hash: string
  actual_hash: string
  prev_hash: string | null
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
  let prevHash: string | null = null
  const mismatches: Mismatch[] = []
  let firstMismatchRowId: string | null = null
  let rowsAfterFirstMismatch = 0

  let pageStart = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await fetchChainPage(client, pageStart, pageStart + PAGE_SIZE - 1)
    if (page.length === 0) break

    for (const row of page) {
      totalScanned += 1
      const expected = computeRowHash(prevHash, toChainRow(row))
      const actual = (row.row_hash ?? "").toString().trim().toLowerCase()

      if (expected !== actual) {
        const m: Mismatch = {
          row_id: row.id,
          created_at: row.created_at,
          expected_hash: expected,
          actual_hash: actual,
          prev_hash: prevHash,
          canonical: canonicalSerializeChainRow(toChainRow(row)),
        }
        mismatches.push(m)
        if (firstMismatchRowId === null) firstMismatchRowId = row.id
      }
      if (firstMismatchRowId !== null && row.id !== firstMismatchRowId) {
        rowsAfterFirstMismatch += 1
      }

      // Chain forward off the STORED row_hash, not the recomputed `expected`.
      // We want every subsequent row's check to descend from the actual
      // persisted parent, so a single tampered row surfaces as one mismatch
      // and every descendant continues to mismatch (because the tamper
      // propagates forward in the persisted chain).
      prevHash = actual.length > 0 ? actual : null
    }

    if (page.length < PAGE_SIZE) break
    pageStart += PAGE_SIZE
  }

  console.log(`[verify-audit-chain] total rows scanned: ${totalScanned}`)

  if (mismatches.length === 0) {
    console.log("[verify-audit-chain] CLEAN: every row_hash matches recomputed value")
    process.exit(0)
  }

  console.error(`[verify-audit-chain] CHAIN BREAK DETECTED`)
  console.error(`[verify-audit-chain] total mismatches: ${mismatches.length}`)
  console.error(
    `[verify-audit-chain] descendants of the first bad parent: ${rowsAfterFirstMismatch}`,
  )
  console.error("")

  // Report the first mismatch in detail (the rest are likely descendants).
  const first = mismatches[0]
  console.error(`[verify-audit-chain] first mismatch:`)
  console.error(`  row_id:        ${first.row_id}`)
  console.error(`  created_at:    ${first.created_at}`)
  console.error(`  prev_hash:     ${first.prev_hash ?? "(null - genesis)"}`)
  console.error(`  expected_hash: ${first.expected_hash}`)
  console.error(`  actual_hash:   ${first.actual_hash}`)
  console.error(`  canonical:     ${first.canonical}`)
  console.error("")

  // Show up to 5 additional mismatches for quick triage.
  const extras = mismatches.slice(1, 6)
  if (extras.length > 0) {
    console.error(`[verify-audit-chain] next ${extras.length} mismatches:`)
    for (const m of extras) {
      console.error(`  - ${m.created_at}  row_id=${m.row_id}  actual=${m.actual_hash.slice(0, 16)}...`)
    }
    if (mismatches.length > 6) {
      console.error(`  ... and ${mismatches.length - 6} more`)
    }
  }

  process.exit(1)
}

main().catch((e) => {
  console.error("[verify-audit-chain] fatal error:", e)
  process.exit(2)
})
