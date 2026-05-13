// Repository for `impersonation_sessions`.
//
// Per the user-level encryption plan (`docs/user-level-encryption-plan.md` §3,
// §4), impersonation sessions are DUAL-tenant rows. Each row has two encrypted
// email columns under two different DEKs:
//   - `admin_email_enc`  -> encrypted under the ADMIN's user DEK
//   - `target_email_enc` -> encrypted under the TARGET user's DEK
//
// Rationale: the row identifies an admin acting on behalf of a target. Both
// emails are PII, each belonging to its owner. Encrypting each under its
// rightful owner's DEK preserves the per-user crypto-shred property (if the
// admin's DEK is destroyed, `admin_email_enc` becomes unrecoverable; same for
// the target).
//
// AAD format: `impersonation_sessions:{column}:{row.id}`.
//
// Pass-through (plaintext): id, admin_user_id, target_user_id, mode,
// expires_at, created_at.

import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptForUser,
  encryptForUser,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "impersonation_sessions"

export type ImpersonationMode = "read" | "write"

/** Plaintext shape returned by repo reads. Mirrors the existing
 *  `ActiveImpersonation` interface in `lib/impersonation.ts` minus the
 *  derived `session_id` alias — readers can spread + rename if they need
 *  that shape. */
export interface ImpersonationSession {
  id: string
  admin_user_id: string
  admin_email: string
  target_user_id: string
  target_email: string | null
  mode: ImpersonationMode
  expires_at: string
  created_at: string
}

/** Plaintext shape accepted by writes. `id` and `created_at` are filled by
 *  Postgres defaults; the repo client-side allocates the UUID so AAD can be
 *  bound in a single insert. */
export interface ImpersonationSessionWrite {
  admin_user_id: string
  admin_email: string
  target_user_id: string
  target_email?: string | null
  mode: ImpersonationMode
  expires_at: string
}

/** On-disk shape after cutover migration (plaintext email columns dropped).
 *  During the 039->040 dual-write window the plaintext columns may still be
 *  present; we keep them as optional fields so `decryptImpersonationRow` can
 *  fall back to plaintext when `*_enc IS NULL`. */
export interface ImpersonationEncryptedRow {
  id: string
  admin_user_id: string
  admin_email_enc: string | null
  target_user_id: string
  target_email_enc: string | null
  mode: ImpersonationMode
  expires_at: string
  created_at: string
  // Plaintext fallback fields - present during the 039->040 transition.
  admin_email?: string | null
  target_email?: string | null
}

/** Insert payload destined for Supabase. */
export interface ImpersonationEncryptedInsert {
  admin_user_id: string
  admin_email_enc: string
  target_user_id: string
  target_email_enc: string | null
  mode: ImpersonationMode
  expires_at: string
}

/** Decrypt a stored row into the plaintext shape. `admin_email_enc` is keyed
 *  off `admin_user_id`; `target_email_enc` is keyed off `target_user_id`. The
 *  AAD ties each ciphertext to its column and the row id — moving ciphertext
 *  between rows or between columns will fail to decrypt. During the 039->040
 *  transition unbackfilled rows fall back to the plaintext columns. */
export function decryptImpersonationRow(
  row: ImpersonationEncryptedRow,
): ImpersonationSession {
  const admin_email =
    row.admin_email_enc !== null && row.admin_email_enc !== undefined
      ? decryptForUser({
          userId: row.admin_user_id,
          envelope: row.admin_email_enc,
          table: TABLE,
          column: "admin_email",
          rowId: row.id,
        })
      : row.admin_email ?? ""

  const target_email =
    row.target_email_enc !== null && row.target_email_enc !== undefined
      ? decryptForUser({
          userId: row.target_user_id,
          envelope: row.target_email_enc,
          table: TABLE,
          column: "target_email",
          rowId: row.id,
        })
      : row.target_email ?? null

  return {
    id: row.id,
    admin_user_id: row.admin_user_id,
    admin_email,
    target_user_id: row.target_user_id,
    target_email,
    mode: row.mode,
    expires_at: row.expires_at,
    created_at: row.created_at,
  }
}

/** Encrypt a plaintext write into the insert shape. Each email is encrypted
 *  under its rightful owner's user DEK; AAD binds to the row id supplied by
 *  the caller. */
export function encryptImpersonationWrite(
  input: ImpersonationSessionWrite,
  sessionId: string,
): ImpersonationEncryptedInsert {
  const admin_email_enc = encryptForUser({
    userId: input.admin_user_id,
    plaintext: input.admin_email,
    table: TABLE,
    column: "admin_email",
    rowId: sessionId,
  })

  const target_email_enc =
    input.target_email === undefined || input.target_email === null
      ? null
      : encryptForUser({
          userId: input.target_user_id,
          plaintext: input.target_email,
          table: TABLE,
          column: "target_email",
          rowId: sessionId,
        })

  return {
    admin_user_id: input.admin_user_id,
    admin_email_enc,
    target_user_id: input.target_user_id,
    target_email_enc,
    mode: input.mode,
    expires_at: input.expires_at,
  }
}

// --- CRUD -------------------------------------------------------------------

// `*` so the repo works both pre-040 (plaintext columns still present, used
// as fallback for unbackfilled rows) and post-040 (encrypted only).
// impersonation_sessions is service-role-only by RLS (mig 019).
const SELECT_COLUMNS = "*"

export async function getImpersonationSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<ImpersonationSession | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("id", sessionId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return decryptImpersonationRow(data as unknown as ImpersonationEncryptedRow)
  })
}

export async function createImpersonationSession(
  supabase: SupabaseClient,
  input: ImpersonationSessionWrite,
): Promise<ImpersonationSession> {
  return withCryptoRequestScope(async () => {
    const sessionId = (globalThis.crypto ?? (await import("node:crypto"))).randomUUID()
    const payload = encryptImpersonationWrite(input, sessionId)
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ id: sessionId, ...payload })
      .select(SELECT_COLUMNS)
      .single()

    if (error) throw error
    return decryptImpersonationRow(data as unknown as ImpersonationEncryptedRow)
  })
}

export async function deleteImpersonationSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", sessionId)
  if (error) throw error
}

export async function deleteAllSessionsForAdmin(
  supabase: SupabaseClient,
  adminUserId: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("admin_user_id", adminUserId)
  if (error) throw error
}
