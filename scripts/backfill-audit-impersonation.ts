/**
 * Phase 5 backfill: encrypt audit_log + impersonation_sessions plaintext
 * columns into their `*_enc` companions in place.
 *
 * Idempotent. Safe to re-run. Skips rows that already have non-null `*_enc`.
 *
 * Run between migrations 039 (add *_enc) and 040 (drop plaintext):
 *
 *   $ tsx scripts/backfill-audit-impersonation.ts
 *
 * Required env:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - ENCRYPTION_KEY_V1
 *
 * audit_log can be HUGE (every login attempt, every action). We page in
 * batches of 100 and log progress so a long run is observable. The cursor is
 * `created_at ASC + id` so resuming after a crash doesn't double-process.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import {
  encryptForUser,
  encryptForSystem,
  encryptJSONForUser,
  encryptJSONForSystem,
} from "@/lib/crypto"

const BATCH_SIZE = 100

interface AuditRowRaw {
  id: string
  user_id: string | null
  user_email: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  user_email_enc: string | null
  details_enc: string | null
  ip_address_enc: string | null
  user_agent_enc: string | null
  created_at: string
}

interface ImpersonationRowRaw {
  id: string
  admin_user_id: string
  admin_email: string | null
  target_user_id: string
  target_email: string | null
  admin_email_enc: string | null
  target_email_enc: string | null
  created_at: string
}

function envFromProcess(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) {
    throw new Error(`Missing required env: ${name}`)
  }
  return v
}

function makeClient(): SupabaseClient {
  return createClient(
    envFromProcess("NEXT_PUBLIC_SUPABASE_URL"),
    envFromProcess("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  )
}

function encStr(
  userId: string | null,
  table: string,
  column: string,
  rowId: string,
  plaintext: string,
): string {
  return userId
    ? encryptForUser({ userId, plaintext, table, column, rowId })
    : encryptForSystem({ plaintext, table, column, rowId })
}

function encJSON(
  userId: string | null,
  table: string,
  column: string,
  rowId: string,
  payload: unknown,
): string {
  return userId
    ? encryptJSONForUser({ userId, payload, table, column, rowId })
    : encryptJSONForSystem({ payload, table, column, rowId })
}

// ============================================================
// audit_log
// ============================================================

async function backfillAuditLog(supabase: SupabaseClient): Promise<void> {
  console.log("[backfill] audit_log: starting")

  // Total count to surface progress %
  const { count: total } = await supabase
    .from("audit_log")
    .select("*", { count: "exact", head: true })

  console.log(`[backfill] audit_log: ${total ?? 0} total rows`)

  let processed = 0
  let updated = 0
  let skipped = 0
  let errors = 0
  let cursorCreatedAt: string | null = null
  let cursorId: string | null = null

  while (true) {
    // Page by created_at + id so a crashed run resumes cleanly. Filter for
    // rows that still need backfill: any *_enc is null AND its plaintext
    // sibling is not null. Cheap pre-filter on details_enc since details
    // defaults to '{}' on every row.
    let query = supabase
      .from("audit_log")
      .select(
        "id, user_id, user_email, details, ip_address, user_agent, " +
          "user_email_enc, details_enc, ip_address_enc, user_agent_enc, " +
          "created_at",
      )
      .is("details_enc", null)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .limit(BATCH_SIZE)

    if (cursorCreatedAt && cursorId) {
      // Tuple cursor: (created_at, id) > (cursorCreatedAt, cursorId)
      query = query.or(
        `created_at.gt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.gt.${cursorId})`,
      )
    }

    const { data, error } = await query
    if (error) {
      console.error("[backfill] audit_log: query failed:", error.message)
      errors++
      break
    }
    const rows = (data ?? []) as unknown as AuditRowRaw[]
    if (rows.length === 0) break

    for (const row of rows) {
      processed++
      try {
        const patch: Record<string, string | null> = {}

        if (row.user_email_enc === null && row.user_email !== null) {
          patch.user_email_enc = encStr(
            row.user_id,
            "audit_log",
            "user_email",
            row.id,
            row.user_email,
          )
        }

        // details is JSONB; always non-null because of the table default of
        // '{}'. Encrypt regardless of content so every row has a v1u/v1s
        // envelope post-backfill.
        if (row.details_enc === null) {
          patch.details_enc = encJSON(
            row.user_id,
            "audit_log",
            "details",
            row.id,
            row.details ?? {},
          )
        }

        if (row.ip_address_enc === null && row.ip_address !== null) {
          patch.ip_address_enc = encStr(
            row.user_id,
            "audit_log",
            "ip_address",
            row.id,
            row.ip_address,
          )
        }

        if (row.user_agent_enc === null && row.user_agent !== null) {
          patch.user_agent_enc = encStr(
            row.user_id,
            "audit_log",
            "user_agent",
            row.id,
            row.user_agent,
          )
        }

        if (Object.keys(patch).length === 0) {
          skipped++
          continue
        }

        const { error: upErr } = await supabase
          .from("audit_log")
          .update(patch)
          .eq("id", row.id)

        if (upErr) {
          console.error(`[backfill] audit_log: update ${row.id} failed:`, upErr.message)
          errors++
        } else {
          updated++
        }
      } catch (err) {
        console.error(
          `[backfill] audit_log: row ${row.id} encrypt failed:`,
          err instanceof Error ? err.message : err,
        )
        errors++
      }
    }

    const last = rows[rows.length - 1]
    cursorCreatedAt = last.created_at
    cursorId = last.id

    const pct = total ? Math.round((processed / total) * 100) : 0
    console.log(
      `[backfill] audit_log: processed=${processed} updated=${updated} ` +
        `skipped=${skipped} errors=${errors} (~${pct}%)`,
    )

    if (rows.length < BATCH_SIZE) break
  }

  console.log(
    `[backfill] audit_log: done. processed=${processed} updated=${updated} ` +
      `skipped=${skipped} errors=${errors}`,
  )
}

// ============================================================
// impersonation_sessions
// ============================================================

async function backfillImpersonationSessions(
  supabase: SupabaseClient,
): Promise<void> {
  console.log("[backfill] impersonation_sessions: starting")

  const { count: total } = await supabase
    .from("impersonation_sessions")
    .select("*", { count: "exact", head: true })

  console.log(`[backfill] impersonation_sessions: ${total ?? 0} total rows`)

  let processed = 0
  let updated = 0
  let skipped = 0
  let errors = 0
  let cursorCreatedAt: string | null = null
  let cursorId: string | null = null

  while (true) {
    let query = supabase
      .from("impersonation_sessions")
      .select(
        "id, admin_user_id, admin_email, target_user_id, target_email, " +
          "admin_email_enc, target_email_enc, created_at",
      )
      .is("admin_email_enc", null)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .limit(BATCH_SIZE)

    if (cursorCreatedAt && cursorId) {
      query = query.or(
        `created_at.gt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.gt.${cursorId})`,
      )
    }

    const { data, error } = await query
    if (error) {
      console.error("[backfill] impersonation_sessions: query failed:", error.message)
      errors++
      break
    }
    const rows = (data ?? []) as unknown as ImpersonationRowRaw[]
    if (rows.length === 0) break

    for (const row of rows) {
      processed++
      try {
        const patch: Record<string, string | null> = {}

        if (row.admin_email_enc === null && row.admin_email !== null) {
          patch.admin_email_enc = encryptForUser({
            userId: row.admin_user_id,
            plaintext: row.admin_email,
            table: "impersonation_sessions",
            column: "admin_email",
            rowId: row.id,
          })
        }

        if (row.target_email_enc === null && row.target_email !== null) {
          patch.target_email_enc = encryptForUser({
            userId: row.target_user_id,
            plaintext: row.target_email,
            table: "impersonation_sessions",
            column: "target_email",
            rowId: row.id,
          })
        }

        if (Object.keys(patch).length === 0) {
          skipped++
          continue
        }

        const { error: upErr } = await supabase
          .from("impersonation_sessions")
          .update(patch)
          .eq("id", row.id)

        if (upErr) {
          console.error(
            `[backfill] impersonation_sessions: update ${row.id} failed:`,
            upErr.message,
          )
          errors++
        } else {
          updated++
        }
      } catch (err) {
        console.error(
          `[backfill] impersonation_sessions: row ${row.id} encrypt failed:`,
          err instanceof Error ? err.message : err,
        )
        errors++
      }
    }

    const last = rows[rows.length - 1]
    cursorCreatedAt = last.created_at
    cursorId = last.id

    const pct = total ? Math.round((processed / total) * 100) : 0
    console.log(
      `[backfill] impersonation_sessions: processed=${processed} ` +
        `updated=${updated} skipped=${skipped} errors=${errors} (~${pct}%)`,
    )

    if (rows.length < BATCH_SIZE) break
  }

  console.log(
    `[backfill] impersonation_sessions: done. processed=${processed} ` +
      `updated=${updated} skipped=${skipped} errors=${errors}`,
  )
}

// ============================================================
// main
// ============================================================

async function main(): Promise<void> {
  // Surface ENCRYPTION_KEY_V1 validation eagerly so we don't get into a
  // half-backfilled state if the env is misconfigured.
  envFromProcess("ENCRYPTION_KEY_V1")

  const supabase = makeClient()

  await backfillAuditLog(supabase)
  await backfillImpersonationSessions(supabase)

  console.log("[backfill] all phases complete. Safe to apply migration 040.")
}

main().catch((err) => {
  console.error("[backfill] fatal:", err)
  process.exit(1)
})
