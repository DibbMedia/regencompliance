// Repository for `audit_log`.
//
// Per the user-level encryption plan (`docs/user-level-encryption-plan.md` §3,
// §4, §12.3, §12.4), audit-log rows are MIXED key mode:
//   - `user_id` IS NOT NULL  -> encrypt with that user's DEK   (v1u.)
//   - `user_id` IS NULL      -> encrypt with the system key    (v1s.)
//
// System-key rows exist for events that have no tenant: CSP report violations
// from unauthenticated clients, initial Stripe-webhook event-received audits
// before profile resolution, and purge-cancelled audits after a user is gone.
//
// Encrypted columns (TEXT envelopes on the row):
//   - user_email      -> user_email_enc
//   - details (JSONB) -> details_enc        (JSON variant)
//   - ip_address      -> ip_address_enc
//   - user_agent      -> user_agent_enc
//
// Pass-through (plaintext): id, user_id, action, resource_type, resource_id,
// status, created_at.
//
// AAD format for every encrypted column: `audit_log:{column}:{row.id}`.
//
// All public CRUD wraps in `withCryptoRequestScope` so a single request doing
// N decrypts pays HKDF once per distinct user_id (or system key derivation).

import { createHash } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptForUser,
  decryptForSystem,
  decryptJSONForUser,
  decryptJSONForSystem,
  encryptForUser,
  encryptForSystem,
  encryptJSONForUser,
  encryptJSONForSystem,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "audit_log"

/** Plaintext shape returned by repo reads. `row_hash` is the migration-044
 *  tamper-evident chain hash; NULL for rows inserted before the migration
 *  applies (the "pre-chain" prefix). */
export interface AuditLogEntry {
  id: string
  user_id: string | null
  user_email: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  status: string
  created_at: string
  row_hash: string | null
}

/** Plaintext shape accepted by writes. `id` and `created_at` are filled by
 *  Postgres defaults; the repo provides the row id (from `select("id")`) to
 *  bind AAD on subsequent encrypts. `details` defaults to `{}`, `status` to
 *  `"success"`. */
export interface AuditLogWrite {
  user_id?: string | null
  user_email?: string | null
  action: string
  resource_type?: string | null
  resource_id?: string | null
  details?: Record<string, unknown>
  ip_address?: string | null
  user_agent?: string | null
  status?: string
}

/** On-disk shape after cutover migration (plaintext columns dropped). During
 *  the dual-write window between migrations 039 (add *_enc) and 040 (drop
 *  plaintext) the row may also carry plaintext columns - we keep those as
 *  optional fields so `decryptAuditLogRow` can fall back to plaintext when
 *  `*_enc IS NULL`. Post-040 the plaintext fields are always absent.
 *
 *  `row_hash` (mig 044) is the tamper-evident chain hash. NULL on rows
 *  inserted before that migration applied. */
export interface AuditLogEncryptedRow {
  id: string
  user_id: string | null
  user_email_enc: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details_enc: string | null
  ip_address_enc: string | null
  user_agent_enc: string | null
  status: string
  created_at: string
  // mig 044 chain hash; absent on pre-chain rows and on test fixtures that
  // don't exercise the chain. Surfaced via decryptAuditLogRow as `null`
  // when absent.
  row_hash?: string | null
  // Plaintext fallback fields - present during the 039->040 transition,
  // dropped from the table by 040. Marked optional so post-cutover code
  // doesn't have to thread `undefined` through.
  user_email?: string | null
  details?: Record<string, unknown> | null
  ip_address?: string | null
  user_agent?: string | null
}

/** Insert payload destined for Supabase. `details_enc` is non-null on insert
 *  because we always serialize an object (defaulting to `{}`) so the field
 *  carries a valid envelope. `row_hash` is filled in by `createAuditLogEntry`
 *  after the insert payload is built (it needs the previous row's hash, which
 *  it reads from the DB just before the INSERT). */
export interface AuditLogEncryptedInsert {
  user_id: string | null
  user_email_enc: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details_enc: string
  ip_address_enc: string | null
  user_agent_enc: string | null
  status: string
}

// --- helpers ----------------------------------------------------------------

function encOpts(column: string, rowId: string) {
  return { table: TABLE, column, rowId }
}

function encString(
  userId: string | null,
  column: string,
  rowId: string,
  plaintext: string,
): string {
  return userId
    ? encryptForUser({ userId, plaintext, ...encOpts(column, rowId) })
    : encryptForSystem({ plaintext, ...encOpts(column, rowId) })
}

function encJSON(
  userId: string | null,
  column: string,
  rowId: string,
  payload: unknown,
): string {
  return userId
    ? encryptJSONForUser({ userId, payload, ...encOpts(column, rowId) })
    : encryptJSONForSystem({ payload, ...encOpts(column, rowId) })
}

function envelopeVersion(envelope: string): string {
  const dot = envelope.indexOf(".")
  if (dot < 0) {
    throw new Error("audit-log: malformed envelope (missing version separator)")
  }
  return envelope.slice(0, dot)
}

/** Choose decrypt key mode by envelope version, not by `row.user_id`. This
 *  matters for GDPR-anonymized rows where `user_id` is still populated
 *  (historical trail) but the row's free-text columns were re-encrypted under
 *  the system key when the user's DEK was crypto-shredded. */
function decString(
  userId: string | null,
  column: string,
  rowId: string,
  envelope: string,
): string {
  const version = envelopeVersion(envelope)
  if (version === "v1u") {
    if (!userId) {
      throw new Error(
        `audit-log: v1u. envelope on column ${column} but row.user_id is NULL`,
      )
    }
    return decryptForUser({ userId, envelope, ...encOpts(column, rowId) })
  }
  if (version === "v1s") {
    return decryptForSystem({ envelope, ...encOpts(column, rowId) })
  }
  throw new Error(`audit-log: unsupported envelope version "${version}" on ${column}`)
}

function decJSON<T = Record<string, unknown>>(
  userId: string | null,
  column: string,
  rowId: string,
  envelope: string,
): T {
  const version = envelopeVersion(envelope)
  if (version === "v1u") {
    if (!userId) {
      throw new Error(
        `audit-log: v1u. envelope on column ${column} but row.user_id is NULL`,
      )
    }
    return decryptJSONForUser<T>({ userId, envelope, ...encOpts(column, rowId) })
  }
  if (version === "v1s") {
    return decryptJSONForSystem<T>({ envelope, ...encOpts(column, rowId) })
  }
  throw new Error(`audit-log: unsupported envelope version "${version}" on ${column}`)
}

/** Decrypt one stored row into the plaintext shape. Key mode is selected by
 *  envelope version (see `decString` / `decJSON`). During the 039->040
 *  transition rows may carry plaintext columns alongside null `*_enc` values;
 *  in that case we surface the plaintext as-is (no encryption applied yet). */
export function decryptAuditLogRow(row: AuditLogEncryptedRow): AuditLogEntry {
  const userId = row.user_id
  const id = row.id

  const user_email =
    row.user_email_enc !== null && row.user_email_enc !== undefined
      ? decString(userId, "user_email", id, row.user_email_enc)
      : row.user_email ?? null

  const details =
    row.details_enc !== null && row.details_enc !== undefined
      ? decJSON<Record<string, unknown>>(userId, "details", id, row.details_enc)
      : (row.details ?? {}) as Record<string, unknown>

  const ip_address =
    row.ip_address_enc !== null && row.ip_address_enc !== undefined
      ? decString(userId, "ip_address", id, row.ip_address_enc)
      : row.ip_address ?? null

  const user_agent =
    row.user_agent_enc !== null && row.user_agent_enc !== undefined
      ? decString(userId, "user_agent", id, row.user_agent_enc)
      : row.user_agent ?? null

  return {
    id,
    user_id: userId,
    user_email,
    action: row.action,
    resource_type: row.resource_type,
    resource_id: row.resource_id,
    details,
    ip_address,
    user_agent,
    status: row.status,
    created_at: row.created_at,
    row_hash: row.row_hash ?? null,
  }
}

/** Encrypt a plaintext write payload into the insert shape. AAD is bound to
 *  the row id supplied by the caller — typically the just-generated UUID from
 *  Postgres's `gen_random_uuid()` default, fetched via a two-step insert
 *  (reserve id, then update with `_enc` columns) when the caller does not
 *  pre-allocate one. */
export function encryptAuditLogWrite(
  input: AuditLogWrite,
  rowId: string,
): AuditLogEncryptedInsert {
  const userId = input.user_id ?? null
  const details = input.details ?? {}

  return {
    user_id: userId,
    user_email_enc:
      input.user_email === undefined || input.user_email === null
        ? null
        : encString(userId, "user_email", rowId, input.user_email),
    action: input.action,
    resource_type: input.resource_type ?? null,
    resource_id: input.resource_id ?? null,
    details_enc: encJSON(userId, "details", rowId, details),
    ip_address_enc:
      input.ip_address === undefined || input.ip_address === null
        ? null
        : encString(userId, "ip_address", rowId, input.ip_address),
    user_agent_enc:
      input.user_agent === undefined || input.user_agent === null
        ? null
        : encString(userId, "user_agent", rowId, input.user_agent),
    status: input.status ?? "success",
  }
}

// --- Tamper-evident hash chain (migration 044) ------------------------------
//
// Each audit_log row carries `row_hash = sha256_hex(prev_row_hash_or_empty ||
// canonical_serialize(this_row_persisted_fields))`. The serializer keys off
// the ENCRYPTED columns because the chain asserts the persisted on-disk
// state, not the plaintext interpretation. Swapping a valid encrypted
// envelope for another valid one still breaks the hash.
//
// Inputs to the canonical serializer are exactly the fields the chain
// commits to. Adding a field here is a chain-format change and would
// invalidate every row after the change. Removing one similarly.

/** The exact persisted-row shape that gets hashed. Encrypted columns appear
 *  as their on-disk envelope; plaintext pass-throughs appear as-is. All
 *  nullable fields are coerced to JS `null` (not `undefined`) so the JSON
 *  output is stable. */
export interface AuditLogChainRow {
  action: string
  created_at: string
  details_enc: string | null
  ip_address_enc: string | null
  resource_id: string | null
  resource_type: string | null
  status: string
  user_agent_enc: string | null
  user_email_enc: string | null
  user_id: string | null
}

const CHAIN_KEYS: ReadonlyArray<keyof AuditLogChainRow> = [
  "action",
  "created_at",
  "details_enc",
  "ip_address_enc",
  "resource_id",
  "resource_type",
  "status",
  "user_agent_enc",
  "user_email_enc",
  "user_id",
]

/** Canonical JSON serialization of a chain row: keys sorted lexicographically
 *  (CHAIN_KEYS is already sorted), no whitespace, nulls preserved. Stable
 *  across JS object key-insertion order. */
export function canonicalSerializeChainRow(row: AuditLogChainRow): string {
  // Build an object with keys in CHAIN_KEYS order so JSON.stringify
  // emits them in that order. JS object property order is insertion order
  // for string keys, so this is the canonical form.
  const ordered: Record<string, unknown> = {}
  for (const k of CHAIN_KEYS) {
    const v = row[k]
    // Normalize undefined to null so `{x: undefined}` and `{}` hash
    // identically. (JSON.stringify already drops `undefined` properties,
    // which would silently break stability if the caller passed one.)
    ordered[k] = v === undefined ? null : v
  }
  return JSON.stringify(ordered)
}

/** Compute the chain hash for one row given the previous row's `row_hash`
 *  (or `null` for the genesis row). Returns lowercase hex SHA-256. */
export function computeRowHash(
  prevHashHex: string | null,
  row: AuditLogChainRow,
): string {
  const prev = prevHashHex ?? ""
  const serialized = canonicalSerializeChainRow(row)
  return createHash("sha256").update(prev).update(serialized).digest("hex")
}

/** Project the on-disk encrypted row down to the subset of fields the chain
 *  commits to. Used by the verifier script to recompute hashes from stored
 *  rows. */
export function toChainRow(row: AuditLogEncryptedRow): AuditLogChainRow {
  return {
    action: row.action,
    created_at: row.created_at,
    details_enc: row.details_enc,
    ip_address_enc: row.ip_address_enc,
    resource_id: row.resource_id,
    resource_type: row.resource_type,
    status: row.status,
    user_agent_enc: row.user_agent_enc,
    user_email_enc: row.user_email_enc,
    user_id: row.user_id,
  }
}

// --- CRUD -------------------------------------------------------------------

// Use `*` so the same repo works both pre-cutover (when 040 has not yet
// dropped plaintext columns and the repo needs the plaintext fallback for
// unbackfilled rows) and post-cutover (plaintext columns gone). PostgREST
// raises on a named-column select that references a dropped column, but `*`
// just returns whichever columns currently exist. The audit_log table is
// service-role-only by RLS (mig 009 + 024), and repo callers never echo
// the raw row back to clients - they consume the `AuditLogEntry` shape.
const SELECT_COLUMNS = "*"

/** Insert an audit_log row. Two-phase to bind AAD to the server-assigned UUID:
 *  1. Insert a placeholder with the pass-through columns + a NULL `_enc`
 *     payload, returning the row id.
 *  2. Update the row with the encrypted columns bound to that id.
 *
 *  The placeholder details_enc value is computed using the new id, so we
 *  effectively collapse the second step into the first by inserting the
 *  payload along with a generated UUID. We use `crypto.randomUUID()` to avoid
 *  the round-trip. The DB default would also work; this is simpler.
 *
 *  Tamper-evident chain (mig 044): before the insert, read the most-recent
 *  row's `row_hash` and compute this row's hash as
 *  `sha256(prev || canonical_serialize(this_row))`. We allocate `created_at`
 *  client-side so the hash input matches the stored value; otherwise the
 *  hash would commit to one timestamp while the DB stored a microsecond
 *  later. If the chain step fails for any reason (DB hiccup reading prev,
 *  hash compute throws), we log and proceed without the hash - the
 *  audit-log write itself must never block on chain ops. The verifier
 *  treats NULL row_hash rows as pre-chain prefix; a runtime failure here
 *  thus creates a small unverifiable gap rather than losing the audit
 *  record entirely. */
export async function createAuditLogEntry(
  supabase: SupabaseClient,
  input: AuditLogWrite,
): Promise<AuditLogEntry> {
  return withCryptoRequestScope(async () => {
    // Allocate the row id client-side so AAD = `audit_log:{col}:{id}` works
    // in a single insert. The DB column defaults to gen_random_uuid() but
    // accepts an explicit value.
    const rowId = (globalThis.crypto ?? (await import("node:crypto"))).randomUUID()
    const payload = encryptAuditLogWrite(input, rowId)

    // Allocate created_at client-side so the chain hash can include it. The
    // DB default would be NOW() at insert time; we'd then either have to
    // skip created_at from the chain (weakens tamper detection on timing)
    // or do a follow-up UPDATE with the hash. Both worse than picking now()
    // client-side. ISO 8601 with millisecond precision matches Postgres's
    // timestamptz string form.
    const createdAt = new Date().toISOString()

    // Compute row_hash. This is best-effort: any failure logs and skips,
    // never blocks the insert. Race caveat: if two inserts read the same
    // prev_hash, both compute hashes off the same parent and the chain
    // forks at that point. v1 accepts this; the verifier in
    // scripts/verify-audit-chain.ts distinguishes the fork pattern
    // (chain-off-grandparent) from post-hoc tampering and exits 0 on
    // forks-only / 1 on tampers.
    let rowHash: string | null = null
    try {
      // Take the most recent row by created_at and use its row_hash (or
      // null if that row is pre-chain). The partial index
      // idx_audit_log_row_hash_created keeps this cheap. We deliberately
      // don't filter `row_hash IS NOT NULL` here: if the most recent row
      // is pre-chain, this insert starts a fresh chain segment with
      // prev=null. That's fine — the verifier walks only chained rows.
      const { data: prev, error: prevErr } = await supabase
        .from(TABLE)
        .select("row_hash")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (prevErr) {
        // Don't throw — log and continue with no chain hash. The verifier
        // will treat this row as a NULL-hash gap (pre-chain prefix style).
        if (process.env.NODE_ENV !== "test") {
          console.warn(
            "[audit-log] chain prev-hash read failed: " + prevErr.message,
          )
        }
      } else {
        const prevHash = prev?.row_hash ?? null
        rowHash = computeRowHash(prevHash, {
          action: payload.action,
          created_at: createdAt,
          details_enc: payload.details_enc,
          ip_address_enc: payload.ip_address_enc,
          resource_id: payload.resource_id,
          resource_type: payload.resource_type,
          status: payload.status,
          user_agent_enc: payload.user_agent_enc,
          user_email_enc: payload.user_email_enc,
          user_id: payload.user_id,
        })
      }
    } catch (e) {
      // Defensive: createHash or canonical serializer should never throw,
      // but if they do, the audit write still must succeed.
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          "[audit-log] chain compute failed: " +
            (e instanceof Error ? e.message : String(e)),
        )
      }
    }

    const insertBody: Record<string, unknown> = {
      id: rowId,
      created_at: createdAt,
      ...payload,
    }
    if (rowHash !== null) {
      insertBody.row_hash = rowHash
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert(insertBody)
      .select(SELECT_COLUMNS)
      .single()

    if (error) throw error
    return decryptAuditLogRow(data as unknown as AuditLogEncryptedRow)
  })
}

export interface ListAuditLogOptions {
  action?: string
  /** Case-insensitive substring match on `action`. Preferred over `action`
   *  (exact match) for admin search UX where typing "auth.login" should
   *  surface every login.success/failed/locked entry. */
  action_substring?: string
  user_id?: string
  resource_type?: string
  status?: string
  limit?: number
  offset?: number
}

/** Admin listing. The repo decrypts each row under its own key (user DEK or
 *  system key). The request-scoped derive cache makes repeated user-DEK
 *  derivations free within this single call. */
export async function listAuditLogForAdmin(
  supabase: SupabaseClient,
  opts: ListAuditLogOptions = {},
): Promise<AuditLogEntry[]> {
  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0

  return withCryptoRequestScope(async () => {
    let query = supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (opts.action) query = query.eq("action", opts.action)
    if (opts.action_substring) {
      const escaped = opts.action_substring.replace(/%/g, "\\%").replace(/_/g, "\\_")
      query = query.ilike("action", `%${escaped}%`)
    }
    if (opts.user_id) query = query.eq("user_id", opts.user_id)
    if (opts.resource_type) query = query.eq("resource_type", opts.resource_type)
    if (opts.status) query = query.eq("status", opts.status)

    const { data, error } = await query
    if (error) throw error
    const rows = (data ?? []) as unknown as AuditLogEncryptedRow[]
    return rows.map((row) => decryptAuditLogRow(row))
  })
}

/** GDPR right-to-be-forgotten. Anonymize all audit rows for one user without
 *  destroying the audit trail. Per plan §12.3:
 *   - `user_id` stays plaintext (UUID — not PII by itself, useful for trail).
 *   - `user_email_enc`, `ip_address_enc`, `user_agent_enc` are set to NULL.
 *   - `details_enc` is rewritten to `encryptJSONForSystem({}, ...)` so the
 *     blob is no longer keyed off the (about-to-be-deleted) user's DEK.
 *  Bulk-update via `eq("user_id", userId)`; details_enc needs a per-row pass
 *  because AAD is row-id-bound. */
export async function anonymizeAuditLogForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await withCryptoRequestScope(async () => {
    // Step 1: fetch only ids — we need them to rebind AAD on details_enc.
    const { data, error } = await supabase
      .from(TABLE)
      .select("id")
      .eq("user_id", userId)

    if (error) throw error
    const ids = ((data ?? []) as { id: string }[]).map((r) => r.id)
    if (ids.length === 0) return

    // Step 2: per-row update of details_enc with system-key-encrypted `{}`,
    // and NULL out the three free-text PII columns. Done in parallel.
    await Promise.all(
      ids.map(async (id) => {
        const detailsEnc = encryptJSONForSystem({
          payload: {},
          table: TABLE,
          column: "details",
          rowId: id,
        })
        const { error: upErr } = await supabase
          .from(TABLE)
          .update({
            user_email_enc: null,
            ip_address_enc: null,
            user_agent_enc: null,
            details_enc: detailsEnc,
          })
          .eq("id", id)
        if (upErr) throw upErr
      }),
    )
  })
}
