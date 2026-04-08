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
      // Mark all unread notifications as read for this user (including broadcasts)
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false)
        .or(`profile_id.eq.${profileId},profile_id.is.null`)

      if (error) {
        console.error("Mark all read error:", error)
        return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
      }
    } else if (body.ids && Array.isArray(body.ids)) {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", body.ids)
        .or(`profile_id.eq.${profileId},profile_id.is.null`)

      if (error) {
        console.error("Mark read error:", error)
        return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark read error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
