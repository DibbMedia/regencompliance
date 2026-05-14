// Primary profile read/write API.
//
// Wave 2A (Phase 2 of the user-level encryption rollout):
// - PATCH routes through `updateProfile` from `lib/repos/profiles.ts`, which
//   encrypts `clinic_name` + `treatments` under the caller's per-user DEK
//   before they hit Supabase. The route returns the decrypted plaintext
//   profile to the caller.
// - GET added for client components that previously read encrypted columns
//   directly via the user-bound supabase client (e.g. dashboard pages and
//   onboarding flows). The browser cannot decrypt - everyone goes through
//   here.

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireWriteMode } from "@/lib/impersonation"
import { profileSchema } from "@/lib/validations"
import { getProfile, updateProfile } from "@/lib/repos/profiles"
import { logAudit, getRequestMeta } from "@/lib/audit-log"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await getProfile(supabase, user.id)
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }
    return NextResponse.json(profile)
  } catch (error) {
    console.error("Profile GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocked = await requireWriteMode()
    if (blocked) return blocked

    const body = await request.json()
    const parsed = profileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    try {
      const profile = await updateProfile(supabase, user.id, parsed.data)
      // SOC 2: user-initiated profile changes are tracked in audit_log.
      // Field names only — `details` is encrypted at rest under the per-user
      // DEK by lib/repos/audit-log.ts so logging the actual values would be
      // safe, but names are sufficient and keep the audit row compact.
      const { ip, userAgent } = getRequestMeta(request)
      logAudit({
        user_id: user.id,
        user_email: user.email,
        action: "profile.updated",
        details: { changed_fields: Object.keys(parsed.data) },
        ip_address: ip,
        user_agent: userAgent,
      })
      return NextResponse.json(profile)
    } catch (error) {
      console.error("Profile update error:", error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }
  } catch (error) {
    console.error("Profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
