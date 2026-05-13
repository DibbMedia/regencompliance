import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { requireWriteMode } from "@/lib/impersonation"
import { inviteSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { inviteTeamMember, listTeamMembers } from "@/lib/repos/team-members"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { allowed } = await checkRateLimit(`invite:${user.id}`, 10, 60 * 60 * 1000)
      if (!allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocked = await requireWriteMode()
    if (blocked) return blocked

    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // List the owner's team_members through the repo so we get decrypted
    // emails for both the seat-count gate and the existing-invite dedupe.
    // Email-equality lookup via SQL is no longer possible (Wave 2A:
    // team_members.email is encrypted), so we filter in JS. Per the repo's
    // 3-seat cap below, the list is at most 2 rows.
    const existingMembers = await listTeamMembers(supabase, user.id)
    if (existingMembers.length >= 2) {
      return NextResponse.json({ error: "Maximum 3 seats (including owner). Remove a member first." }, { status: 400 })
    }

    const targetEmail = parsed.data.email.toLowerCase()
    const existingInvite = existingMembers.find(
      (m) => m.user_id === null && m.email.toLowerCase() === targetEmail,
    )
    if (existingInvite && existingInvite.invite_token) {
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?invite_token=${existingInvite.invite_token}`
      return NextResponse.json({ invite_url: inviteUrl, existing: true })
    }

    // Repo handles UUID + token + AAD-bound email_enc encrypt + insert in
    // one call. Use the user-bound client so RLS still applies.
    let inserted
    try {
      inserted = await inviteTeamMember(supabase, user.id, parsed.data.email, "member")
    } catch (err) {
      console.error("Invite insert error:", err)
      return NextResponse.json({ error: "Failed to create invite" }, { status: 500 })
    }
    const token = inserted.invite_token ?? ""

    // Generate magic link via admin
    const adminClient = createServiceClient()
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: parsed.data.email,
    })

    let inviteUrl: string
    if (linkError || !linkData?.properties?.action_link) {
      // Fallback: use app URL with token
      inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?invite_token=${token}`
    } else {
      inviteUrl = `${linkData.properties.action_link}&invite_token=${token}`
    }

    return NextResponse.json({ invite_url: inviteUrl })
  } catch (error) {
    console.error("Invite error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
