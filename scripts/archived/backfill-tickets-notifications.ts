/**
 * Backfill plaintext -> *_enc for Wave 2C / Phase 4:
 *   - support_tickets.subject          -> subject_enc
 *   - ticket_messages.message          -> message_enc (uses profile_id added in 037)
 *   - notifications.title|body|action_url -> *_enc
 *
 * Idempotent: only fills rows where *_enc IS NULL and the plaintext column is
 * still present + non-null. Safe to re-run.
 *
 * Run with:
 *   npx tsx scripts/backfill-tickets-notifications.ts
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ENCRYPTION_KEY_V1 (64-char hex)
 */
import { createClient } from "@supabase/supabase-js"
import { encryptForUser } from "../lib/crypto"

const BATCH_SIZE = 500

function env(name: string): string {
  const v = process.env[name]
  if (!v) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return v
}

function makeAdminClient() {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

interface TicketRow {
  id: string
  profile_id: string
  subject: string | null
  subject_enc: string | null
}

async function backfillTickets(): Promise<{ scanned: number; encrypted: number }> {
  const supabase = makeAdminClient()
  let scanned = 0
  let encrypted = 0
  let lastId: string | null = null

  for (;;) {
    let q = supabase
      .from("support_tickets")
      .select("id, profile_id, subject, subject_enc")
      .order("id", { ascending: true })
      .limit(BATCH_SIZE)
    if (lastId) q = q.gt("id", lastId)
    const { data, error } = await q
    if (error) throw error
    const rows = (data ?? []) as TicketRow[]
    if (rows.length === 0) break
    scanned += rows.length
    lastId = rows[rows.length - 1].id

    for (const row of rows) {
      if (row.subject_enc) continue
      if (row.subject === null || row.subject === undefined) continue
      const envelope = encryptForUser({
        userId: row.profile_id,
        plaintext: row.subject,
        table: "support_tickets",
        column: "subject",
        rowId: row.id,
      })
      const { error: updErr } = await supabase
        .from("support_tickets")
        .update({ subject_enc: envelope })
        .eq("id", row.id)
        .is("subject_enc", null)
      if (updErr) throw updErr
      encrypted++
    }
    if (rows.length < BATCH_SIZE) break
  }
  return { scanned, encrypted }
}

interface TicketMessageRow {
  id: string
  ticket_id: string
  profile_id: string | null
  message: string | null
  message_enc: string | null
}

async function backfillTicketMessages(): Promise<{ scanned: number; encrypted: number; skippedNoProfile: number }> {
  const supabase = makeAdminClient()
  let scanned = 0
  let encrypted = 0
  let skippedNoProfile = 0
  let lastId: string | null = null

  for (;;) {
    let q = supabase
      .from("ticket_messages")
      .select("id, ticket_id, profile_id, message, message_enc")
      .order("id", { ascending: true })
      .limit(BATCH_SIZE)
    if (lastId) q = q.gt("id", lastId)
    const { data, error } = await q
    if (error) throw error
    const rows = (data ?? []) as TicketMessageRow[]
    if (rows.length === 0) break
    scanned += rows.length
    lastId = rows[rows.length - 1].id

    for (const row of rows) {
      if (row.message_enc) continue
      if (row.message === null || row.message === undefined) continue
      if (!row.profile_id) {
        // profile_id may not yet be backfilled if 037 hadn't completed. Skip
        // and log so the operator can re-run after the migration finishes.
        skippedNoProfile++
        continue
      }
      const envelope = encryptForUser({
        userId: row.profile_id,
        plaintext: row.message,
        table: "ticket_messages",
        column: "message",
        rowId: row.id,
      })
      const { error: updErr } = await supabase
        .from("ticket_messages")
        .update({ message_enc: envelope })
        .eq("id", row.id)
        .is("message_enc", null)
      if (updErr) throw updErr
      encrypted++
    }
    if (rows.length < BATCH_SIZE) break
  }
  return { scanned, encrypted, skippedNoProfile }
}

interface NotificationRow {
  id: string
  profile_id: string | null
  title: string | null
  body: string | null
  action_url: string | null
  title_enc: string | null
  body_enc: string | null
  action_url_enc: string | null
}

async function backfillNotifications(): Promise<{ scanned: number; encrypted: number; skippedNoProfile: number }> {
  const supabase = makeAdminClient()
  let scanned = 0
  let encrypted = 0
  let skippedNoProfile = 0
  let lastId: string | null = null

  for (;;) {
    let q = supabase
      .from("notifications")
      .select(
        "id, profile_id, title, body, action_url, title_enc, body_enc, action_url_enc",
      )
      .order("id", { ascending: true })
      .limit(BATCH_SIZE)
    if (lastId) q = q.gt("id", lastId)
    const { data, error } = await q
    if (error) throw error
    const rows = (data ?? []) as NotificationRow[]
    if (rows.length === 0) break
    scanned += rows.length
    lastId = rows[rows.length - 1].id

    for (const row of rows) {
      if (!row.profile_id) {
        // Legacy broadcast-NULL rows. Plan §12.4 says these don't exist in
        // practice; flag and skip rather than mass-encrypt under a synthetic
        // key.
        skippedNoProfile++
        continue
      }
      const updates: Record<string, string | null> = {}
      let touched = false
      if (!row.title_enc && row.title !== null && row.title !== undefined) {
        updates.title_enc = encryptForUser({
          userId: row.profile_id,
          plaintext: row.title,
          table: "notifications",
          column: "title",
          rowId: row.id,
        })
        touched = true
      }
      if (!row.body_enc && row.body !== null && row.body !== undefined) {
        updates.body_enc = encryptForUser({
          userId: row.profile_id,
          plaintext: row.body,
          table: "notifications",
          column: "body",
          rowId: row.id,
        })
        touched = true
      }
      if (
        !row.action_url_enc &&
        row.action_url !== null &&
        row.action_url !== undefined
      ) {
        updates.action_url_enc = encryptForUser({
          userId: row.profile_id,
          plaintext: row.action_url,
          table: "notifications",
          column: "action_url",
          rowId: row.id,
        })
        touched = true
      }
      if (!touched) continue
      const { error: updErr } = await supabase
        .from("notifications")
        .update(updates)
        .eq("id", row.id)
      if (updErr) throw updErr
      encrypted++
    }
    if (rows.length < BATCH_SIZE) break
  }
  return { scanned, encrypted, skippedNoProfile }
}

async function main(): Promise<void> {
  const t0 = Date.now()
  console.log("[backfill] support_tickets ...")
  const tickets = await backfillTickets()
  console.log(`  scanned=${tickets.scanned} encrypted=${tickets.encrypted}`)

  console.log("[backfill] ticket_messages ...")
  const messages = await backfillTicketMessages()
  console.log(
    `  scanned=${messages.scanned} encrypted=${messages.encrypted} skippedNoProfile=${messages.skippedNoProfile}`,
  )

  console.log("[backfill] notifications ...")
  const notifs = await backfillNotifications()
  console.log(
    `  scanned=${notifs.scanned} encrypted=${notifs.encrypted} skippedNoProfile=${notifs.skippedNoProfile}`,
  )

  console.log(`[backfill] done in ${Date.now() - t0}ms`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
