import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)
    const body = await request.json()

    if (body.all) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .or(`profile_id.eq.${profileId},profile_id.is.null`)
        .eq("read", false)
    } else if (body.ids && Array.isArray(body.ids)) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", body.ids)
        .or(`profile_id.eq.${profileId},profile_id.is.null`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark read error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
