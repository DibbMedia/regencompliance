// Repository for `team_members`.
//
// Per the user-level encryption plan (`docs/user-level-encryption-plan.md` §4,
// §12), `email` is encrypted under the owning profile's per-user DEK. The
// tenant key for the AAD + the DEK is `profile_id` (the owner of the seat),
// NOT `user_id` (which may be NULL for an unaccepted invite). This keeps the
// encryption stable across the invite -> accept transition.
//
// AAD format: `team_members:{column}:{row.id}` -- the row's own id, not the
// profile_id. This binds the ciphertext to the specific team_member row so an
// attacker with DB write access can't swap email envelopes between two seats
// owned by the same profile.
//
// `invite_token` stays plaintext: it's already a random secret with no
// plaintext content to leak. Admin email search dies on this table; admin
// pivots to `auth.users.email` or row UUID lookup per the plan §12.6.
//
// Wave 2A dual-state notes:
//   - WRITES go to `email_enc` only. There is no dual-write.
//   - READS prefer `email_enc` and fall back to the legacy plaintext `email`
//     column when `email_enc IS NULL` (un-backfilled rows). After migration
//     034 drops `email`, the fallback path becomes dead code.

import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptForUser,
  encryptForUser,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "team_members"

export type TeamRole = "owner" | "member"

/** Plaintext shape returned by repo reads. */
export interface TeamMember {
  id: string
  profile_id: string
  user_id: string | null
  email: string
  role: TeamRole
  invite_token: string | null
  accepted: boolean
  accepted_at: string | null
  invited_at: string
}

/** Patch shape for updates and the input shape for invites (subset). */
export interface TeamMemberWrite {
  user_id?: string | null
  email?: string
  role?: TeamRole
  invite_token?: string | null
  accepted?: boolean
  accepted_at?: string | null
}

/** On-disk shape during the Wave 2A transition window. Both ciphertext and
 *  legacy plaintext `email` are selectable; reads prefer ciphertext and fall
 *  back to plaintext when `email_enc IS NULL`. After migration 034 drops
 *  `email` the fallback path is dead code. */
export interface TeamMemberEncryptedRow {
  id: string
  profile_id: string
  user_id: string | null
  email_enc: string | null
  // Legacy plaintext fallback. Optional because migration 034 drops it.
  email?: string | null
  role: TeamRole
  invite_token: string | null
  accepted: boolean
  accepted_at: string | null
  invited_at: string
}

export interface TeamMemberEncryptedWrite {
  profile_id?: string
  user_id?: string | null
  email_enc?: string | null
  role?: TeamRole
  invite_token?: string | null
  accepted?: boolean
  accepted_at?: string | null
}

// --- Stateless transforms --------------------------------------------------

export function decryptTeamMemberRow(
  profileId: string,
  row: TeamMemberEncryptedRow,
): TeamMember {
  if (profileId !== row.profile_id) {
    throw new Error(
      `decryptTeamMemberRow: profileId ${profileId} does not match row.profile_id ${row.profile_id}`,
    )
  }

  // `email` is non-nullable in the plaintext contract. Prefer ciphertext; if
  // it's NULL try the transitional plaintext fallback. If both are missing
  // it's a data integrity error - we throw rather than silently return "".
  let email: string
  if (row.email_enc != null) {
    email = decryptForUser({
      userId: profileId,
      envelope: row.email_enc,
      table: TABLE,
      column: "email",
      rowId: row.id,
    })
  } else if (row.email != null) {
    email = row.email // legacy plaintext fallback (transitional)
  } else {
    throw new Error(
      `decryptTeamMemberRow: row ${row.id} has NULL email_enc AND NULL email (data integrity error)`,
    )
  }

  return {
    id: row.id,
    profile_id: row.profile_id,
    user_id: row.user_id,
    email,
    role: row.role,
    invite_token: row.invite_token,
    accepted: row.accepted,
    accepted_at: row.accepted_at,
    invited_at: row.invited_at,
  }
}

/** Transform a plaintext write into the encrypted shape. `rowId` is required
 *  because the AAD binds the ciphertext to the specific team_member row id.
 *  For INSERTs the caller should generate the id (e.g., `crypto.randomUUID()`)
 *  before calling so it can be stamped into both the row and the AAD. */
export function encryptTeamMemberWrite(
  profileId: string,
  rowId: string,
  input: TeamMemberWrite,
): TeamMemberEncryptedWrite {
  const out: TeamMemberEncryptedWrite = {}

  if ("email" in input) {
    out.email_enc =
      input.email === undefined
        ? null
        : encryptForUser({
            userId: profileId,
            plaintext: input.email,
            table: TABLE,
            column: "email",
            rowId,
          })
  }

  if ("user_id" in input) out.user_id = input.user_id ?? null
  if ("role" in input && input.role !== undefined) out.role = input.role
  if ("invite_token" in input) out.invite_token = input.invite_token ?? null
  if ("accepted" in input && input.accepted !== undefined) out.accepted = input.accepted
  if ("accepted_at" in input) out.accepted_at = input.accepted_at ?? null

  return out
}

// --- CRUD ------------------------------------------------------------------

// Post-cutover: migration 034 dropped the plaintext `email` column.
const SELECT_COLUMNS =
  "id, profile_id, user_id, email_enc, role, invite_token, accepted, accepted_at, invited_at"

export async function getTeamMember(
  supabase: SupabaseClient,
  profileId: string,
  memberId: string,
): Promise<TeamMember | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("id", memberId)
      .eq("profile_id", profileId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return decryptTeamMemberRow(profileId, data as unknown as TeamMemberEncryptedRow)
  })
}

export async function listTeamMembers(
  supabase: SupabaseClient,
  profileId: string,
): Promise<TeamMember[]> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("profile_id", profileId)
      .order("invited_at", { ascending: false })

    if (error) throw error
    const rows = (data ?? []) as unknown as TeamMemberEncryptedRow[]
    return rows.map((row) => decryptTeamMemberRow(profileId, row))
  })
}

/** Generate a 32-byte url-safe invite token. Tokens stay plaintext per the
 *  plan -- they're random secrets with no PII to leak. */
function generateInviteToken(): string {
  // node:crypto is available in all Vercel runtimes we deploy to. Avoiding a
  // top-level import keeps the repo edge-runtime-friendly for callers that
  // tree-shake unused branches.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { randomBytes } = require("node:crypto") as typeof import("node:crypto")
  return randomBytes(32).toString("base64url")
}

/** Generate a v4 UUID. */
function generateId(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { randomUUID } = require("node:crypto") as typeof import("node:crypto")
  return randomUUID()
}

export async function inviteTeamMember(
  supabase: SupabaseClient,
  profileId: string,
  email: string,
  role: TeamRole,
): Promise<TeamMember> {
  return withCryptoRequestScope(async () => {
    const id = generateId()
    const invite_token = generateInviteToken()
    const invited_at = new Date().toISOString()

    const encrypted = encryptTeamMemberWrite(profileId, id, {
      email,
      role,
      invite_token,
      accepted: false,
      accepted_at: null,
      user_id: null,
    })

    const insert = {
      id,
      profile_id: profileId,
      invited_at,
      ...encrypted,
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert(insert)
      .select(SELECT_COLUMNS)
      .single()

    if (error) throw error
    return decryptTeamMemberRow(profileId, data as unknown as TeamMemberEncryptedRow)
  })
}

/** Accept an invite. Looks the row up by `invite_token` (which is unique),
 *  flips `accepted = true`, stamps `accepted_at` + `user_id`. Returns the
 *  accepted row decrypted. Throws if no row matches the token. */
export async function acceptInvite(
  supabase: SupabaseClient,
  inviteToken: string,
  userId: string,
): Promise<TeamMember> {
  return withCryptoRequestScope(async () => {
    // First fetch to discover profile_id (needed both for AAD and to return
    // the decrypted row).
    const { data: existing, error: fetchErr } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("invite_token", inviteToken)
      .maybeSingle()

    if (fetchErr) throw fetchErr
    if (!existing) {
      throw new Error("acceptInvite: invite token not found")
    }

    const existingRow = existing as unknown as TeamMemberEncryptedRow
    const profileId = existingRow.profile_id

    const { data, error } = await supabase
      .from(TABLE)
      .update({
        accepted: true,
        accepted_at: new Date().toISOString(),
        user_id: userId,
      })
      .eq("id", existingRow.id)
      .select(SELECT_COLUMNS)
      .single()

    if (error) throw error
    return decryptTeamMemberRow(profileId, data as unknown as TeamMemberEncryptedRow)
  })
}
