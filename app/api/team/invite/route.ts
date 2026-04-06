import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { inviteSchema } from "@/lib/validations"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Check seat count (max 3 including owner)
    const { count } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id)

    if ((count || 0) >= 2) {
      return NextResponse.json({ error: "Maximum 3 seats (including owner). Remove a member first." }, { status: 400 })
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex")

    // Insert team member
    const { error: insertError } = await supabase
      .from("team_members")
      .insert({
        profile_id: user.id,
        email: parsed.data.email,
        role: "member",
        invite_token: token,
      })

    if (insertError) {
      console.error("Invite insert error:", insertError)
      return NextResponse.json({ error: "Failed to create invite" }, { status: 500 })
    }

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
