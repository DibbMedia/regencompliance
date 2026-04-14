import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)

    // Count personal unread notifications
    const { count: personalUnread } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("read", false)

    // Count broadcast notifications not yet read by this user
    const { data: broadcasts } = await supabase
      .from("notifications")
      .select("id")
      .is("profile_id", null)

    let broadcastUnread = 0
    if (broadcasts && broadcasts.length > 0) {
      const { data: reads } = await supabase
        .from("notification_reads")
        .select("notification_id")
        .eq("user_id", user.id)

      const readSet = new Set((reads || []).map((r) => r.notification_id))
      broadcastUnread = broadcasts.filter((b) => !readSet.has(b.id)).length
    }

    return NextResponse.json({ count: (personalUnread || 0) + broadcastUnread })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
