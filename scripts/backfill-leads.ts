/**
 * scripts/backfill-leads.ts
 *
 * Phase 6 (plan §12.7) backfill: encrypts existing plaintext lead rows
 * into their `*_enc` companion columns. Runs between mig 041 (adds
 * columns + drops uniques) and mig 042 (drops plaintext columns).
 *
 * Tables (in order, lightest first for fast-fail visibility):
 *   - beta_purchases    (small; pre-auth Stripe reservations)
 *   - free_audit_leads  (medium; lead-magnet rows)
 *   - beta_applications (small; founder-beta intake)
 *   - waitlist          (large)
 *   - newsletter_subscribers (large)
 *
 * Per-row strategy:
 *   1. SELECT id + every plaintext column + every *_enc column
 *   2. Skip rows where every *_enc is already non-NULL (already backfilled)
 *   3. Encrypt each plaintext value via encryptForRow (AAD=table:column:row.id)
 *   4. UPDATE the row's *_enc columns; leave plaintext alone (mig 042 drops them)
 *
 * Idempotent: re-running over a partial backfill is safe - already-encrypted
 * rows are skipped. Resumable: paginates by created_at ascending so a crash
 * can resume from the highest backfilled row's timestamp.
 *
 * Required env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ENCRYPTION_KEY_V1
 *
 * Run with: npx tsx scripts/backfill-leads.ts
 */
import { createClient } from "@supabase/supabase-js"
import {
  encryptForRow,
  encryptJSONForRow,
  withCryptoRequestScope,
} from "../lib/crypto"

const BATCH_SIZE = 100

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    console.error(`Missing required env: ${name}`)
    process.exit(1)
  }
  return v
}

const SUPABASE_URL = requireEnv("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
requireEnv("ENCRYPTION_KEY_V1") // exercised by encryptForRow

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

type Row = Record<string, unknown>

interface BackfillSpec {
  table: string
  // columns: { plaintextCol, encCol, json? } - json columns are wrapped via encryptJSONForRow
  columns: Array<{ plain: string; enc: string; json?: boolean }>
}

const SPECS: BackfillSpec[] = [
  {
    table: "beta_purchases",
    columns: [{ plain: "email", enc: "email_enc" }],
  },
  {
    table: "free_audit_leads",
    columns: [
      { plain: "email", enc: "email_enc" },
      { plain: "website_url", enc: "website_url_enc" },
      { plain: "page_title", enc: "page_title_enc" },
      { plain: "ip_address", enc: "ip_address_enc" },
      { plain: "user_agent", enc: "user_agent_enc" },
      { plain: "flags", enc: "flags_enc", json: true },
    ],
  },
  {
    table: "beta_applications",
    columns: [
      { plain: "name", enc: "name_enc" },
      { plain: "email", enc: "email_enc" },
      { plain: "clinic_name", enc: "clinic_name_enc" },
      { plain: "specialty", enc: "specialty_enc" },
      { plain: "role", enc: "role_enc" },
      { plain: "website", enc: "website_enc" },
      { plain: "monthly_volume", enc: "monthly_volume_enc" },
      { plain: "why_apply", enc: "why_apply_enc" },
      { plain: "ip_address", enc: "ip_address_enc" },
      { plain: "user_agent", enc: "user_agent_enc" },
    ],
  },
  {
    table: "waitlist",
    columns: [
      { plain: "email", enc: "email_enc" },
      { plain: "name", enc: "name_enc" },
      { plain: "ip_address", enc: "ip_address_enc" },
      { plain: "user_agent", enc: "user_agent_enc" },
    ],
  },
  {
    table: "newsletter_subscribers",
    columns: [
      { plain: "email", enc: "email_enc" },
      { plain: "ip_address", enc: "ip_address_enc" },
      { plain: "user_agent", enc: "user_agent_enc" },
    ],
  },
]

function isReservationSentinel(row: Row, table: string): boolean {
  if (table !== "beta_purchases") return false
  const email = row.email
  return typeof email === "string" && email.startsWith("pending-")
}

async function backfillTable(spec: BackfillSpec): Promise<void> {
  const selectCols = ["id", "created_at", ...spec.columns.flatMap((c) => [c.plain, c.enc])].join(",")
  let cursor: string | null = null
  let processed = 0
  let encrypted = 0
  let skipped = 0
  let failed = 0

  console.log(`[backfill] ${spec.table}: starting`)

  while (true) {
    let query = supabase
      .from(spec.table)
      .select(selectCols)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE)
    if (cursor) query = query.gt("created_at", cursor)

    const { data, error } = await query
    if (error) {
      console.error(`[backfill] ${spec.table}: SELECT error`, error)
      throw error
    }
    const rows = (data ?? []) as unknown as Row[]
    if (rows.length === 0) break

    for (const row of rows) {
      processed++
      const rowId = String(row.id)
      // Skip if every *_enc is already populated.
      const allFilled = spec.columns.every((c) => {
        const v = row[c.enc]
        return v !== null && v !== undefined
      })
      if (allFilled) {
        skipped++
        continue
      }
      // Skip the reservation sentinel ("pending-<token>") - it carries no
      // real PII, no need to encrypt; the column drop in mig 042 deletes it.
      if (isReservationSentinel(row, spec.table)) {
        skipped++
        continue
      }

      const update: Row = {}
      try {
        await withCryptoRequestScope(async () => {
          for (const col of spec.columns) {
            // Already encrypted? Leave it.
            const existingEnc = row[col.enc]
            if (existingEnc !== null && existingEnc !== undefined) continue

            const plain = row[col.plain]
            if (plain === null || plain === undefined) continue

            if (col.json) {
              update[col.enc] = encryptJSONForRow({
                rowId,
                payload: plain,
                table: spec.table,
                column: col.plain,
              })
            } else {
              if (typeof plain !== "string") {
                // Unexpected non-string in a text column; coerce defensively.
                update[col.enc] = encryptForRow({
                  rowId,
                  plaintext: String(plain),
                  table: spec.table,
                  column: col.plain,
                })
              } else {
                update[col.enc] = encryptForRow({
                  rowId,
                  plaintext: plain,
                  table: spec.table,
                  column: col.plain,
                })
              }
            }
          }
        })
      } catch (err) {
        failed++
        console.error(`[backfill] ${spec.table}: encrypt failed for id=${rowId}`, err)
        continue
      }

      if (Object.keys(update).length === 0) {
        // Nothing to write - all source values were null.
        skipped++
        continue
      }

      const { error: updErr } = await supabase
        .from(spec.table)
        .update(update)
        .eq("id", rowId)
      if (updErr) {
        failed++
        console.error(`[backfill] ${spec.table}: UPDATE failed for id=${rowId}`, updErr)
        continue
      }
      encrypted++
    }

    cursor = String(rows[rows.length - 1].created_at)
    if (rows.length < BATCH_SIZE) break
  }

  console.log(
    `[backfill] ${spec.table}: done - processed=${processed} encrypted=${encrypted} skipped=${skipped} failed=${failed}`,
  )
}

async function main(): Promise<void> {
  for (const spec of SPECS) {
    await backfillTable(spec)
  }
  console.log("[backfill] all tables done")
}

main().catch((err) => {
  console.error("[backfill] fatal:", err)
  process.exit(1)
})
