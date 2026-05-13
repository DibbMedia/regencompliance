// Backfill script for the Phase 2 (Wave 2A) encryption rollout.
//
// Encrypts existing plaintext `clinic_name` / `treatments[]` on `profiles`
// and plaintext `email` on `team_members` into their `_enc` companion
// columns added by migration 033.
//
// Usage:
//   npx tsx scripts/backfill-profiles.ts
//
// Requires the standard service-role env (NEXT_PUBLIC_SUPABASE_URL +
// SUPABASE_SERVICE_ROLE_KEY + ENCRYPTION_KEY_V1).
//
// Idempotency: each pass selects only rows whose `_enc` column is still NULL.
// Re-running the script after a partial failure resumes from where it left
// off. If the script is run again after a full backfill, the SELECT returns
// zero rows for both tables and it exits cleanly.
//
// AAD bindings match the repo modules exactly:
//   profiles.clinic_name -> userId = row.id,        rowId = row.id
//   profiles.treatments  -> userId = row.id,        rowId = row.id
//   team_members.email   -> userId = row.profile_id, rowId = row.id

import { createClient } from "@supabase/supabase-js"
import {
  encryptForUser,
  encryptJSONForUser,
  withCryptoRequestScope,
} from "@/lib/crypto"

const PAGE = 50

function requireEnv(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) throw new Error(`Missing required env var ${name}`)
  return v
}

async function backfillProfiles(): Promise<{ scanned: number; encrypted: number; failures: number }> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })

  let scanned = 0
  let encrypted = 0
  let failures = 0

  // Loop until no rows match the WHERE clause. We rely on idempotency: each
  // pass reads rows where ANY of the encrypted columns is still NULL while
  // the corresponding plaintext column is populated.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, clinic_name, treatments, clinic_name_enc, treatments_enc")
      .or("clinic_name_enc.is.null,treatments_enc.is.null")
      .limit(PAGE)

    if (error) {
      console.error("[backfill-profiles] select failed:", error)
      throw error
    }
    if (!data || data.length === 0) break

    scanned += data.length

    for (const row of data) {
      const userId = row.id as string
      const patch: Record<string, string | null> = {}
      try {
        await withCryptoRequestScope(async () => {
          if (
            row.clinic_name_enc == null &&
            row.clinic_name != null &&
            row.clinic_name !== ""
          ) {
            patch.clinic_name_enc = encryptForUser({
              userId,
              plaintext: row.clinic_name as string,
              table: "profiles",
              column: "clinic_name",
              rowId: userId,
            })
          }
          if (
            row.treatments_enc == null &&
            Array.isArray(row.treatments) &&
            row.treatments.length > 0
          ) {
            patch.treatments_enc = encryptJSONForUser({
              userId,
              payload: row.treatments,
              table: "profiles",
              column: "treatments",
              rowId: userId,
            })
          }
        })
      } catch (err) {
        console.error(
          `[backfill-profiles] encrypt failed for profile ${userId}:`,
          err,
        )
        failures += 1
        continue
      }

      if (Object.keys(patch).length === 0) {
        // Nothing to backfill on this row (both plaintexts empty or both
        // already encrypted). Move on without an UPDATE.
        continue
      }

      const { error: upErr } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", userId)

      if (upErr) {
        console.error(`[backfill-profiles] update failed for ${userId}:`, upErr)
        failures += 1
        continue
      }

      encrypted += 1
      console.log(
        `[backfill-profiles] encrypted profile ${userId} (${Object.keys(patch).join(", ")})`,
      )
    }

    // Guard against an infinite loop if every row in the page failed to
    // backfill (e.g. validation errors on the encrypted column type). When
    // nothing changed we've made no forward progress, so bail.
    if (failures >= data.length) {
      console.error(
        "[backfill-profiles] entire page failed; aborting to avoid infinite loop",
      )
      break
    }
  }

  return { scanned, encrypted, failures }
}

async function backfillTeamMembers(): Promise<{ scanned: number; encrypted: number; failures: number }> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })

  let scanned = 0
  let encrypted = 0
  let failures = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, profile_id, email, email_enc")
      .is("email_enc", null)
      .limit(PAGE)

    if (error) {
      console.error("[backfill-team-members] select failed:", error)
      throw error
    }
    if (!data || data.length === 0) break

    scanned += data.length

    for (const row of data) {
      const rowId = row.id as string
      const profileId = row.profile_id as string
      const email = row.email as string | null

      if (email == null || email === "") {
        // Pre-2026-05-13 invites always had email; defensive skip.
        console.warn(
          `[backfill-team-members] row ${rowId} has NULL email and NULL email_enc; skipping`,
        )
        continue
      }

      let envelope: string
      try {
        envelope = await withCryptoRequestScope(async () =>
          encryptForUser({
            userId: profileId,
            plaintext: email,
            table: "team_members",
            column: "email",
            rowId,
          }),
        )
      } catch (err) {
        console.error(
          `[backfill-team-members] encrypt failed for member ${rowId}:`,
          err,
        )
        failures += 1
        continue
      }

      const { error: upErr } = await supabase
        .from("team_members")
        .update({ email_enc: envelope })
        .eq("id", rowId)

      if (upErr) {
        console.error(
          `[backfill-team-members] update failed for ${rowId}:`,
          upErr,
        )
        failures += 1
        continue
      }

      encrypted += 1
      console.log(`[backfill-team-members] encrypted member ${rowId}`)
    }

    if (failures >= data.length) {
      console.error(
        "[backfill-team-members] entire page failed; aborting to avoid infinite loop",
      )
      break
    }
  }

  return { scanned, encrypted, failures }
}

async function main() {
  console.log("[backfill] Starting Wave 2A backfill (profiles + team_members)")
  const profilesResult = await backfillProfiles()
  console.log(
    `[backfill] profiles: scanned=${profilesResult.scanned} encrypted=${profilesResult.encrypted} failures=${profilesResult.failures}`,
  )
  const teamResult = await backfillTeamMembers()
  console.log(
    `[backfill] team_members: scanned=${teamResult.scanned} encrypted=${teamResult.encrypted} failures=${teamResult.failures}`,
  )

  const totalFailures = profilesResult.failures + teamResult.failures
  if (totalFailures > 0) {
    console.error(`[backfill] FINISHED WITH ${totalFailures} FAILURES`)
    process.exit(1)
  }
  console.log("[backfill] Done. Safe to apply migration 034 once the deploy is stable.")
}

main().catch((err) => {
  console.error("[backfill] fatal error:", err)
  process.exit(1)
})
