import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
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
    const service = createServiceClient()

    if (body.all) {
      // 1. Mark personal notifications as read (RLS allows this)
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false)
        .eq("profile_id", profileId)

      // 2. Get all broadcast notifications not yet read by this user
      const { data: broadcasts } = await service
        .from("notifications")
        .select("id")
        .is("profile_id", null)

      if (broadcasts && broadcasts.length > 0) {
        // Get already-read broadcast IDs for this user
        const { data: alreadyRead } = await supabase
          .from("notification_reads")
          .select("notification_id")
          .eq("user_id", user.id)

        const readSet = new Set((alreadyRead || []).map((r) => r.notification_id))
        const unreadBroadcasts = broadcasts.filter((b) => !readSet.has(b.id))

        if (unreadBroadcasts.length > 0) {
          await supabase
            .from("notification_reads")
            .upsert(
              unreadBroadcasts.map((b) => ({
                notification_id: b.id,
                user_id: user.id,
              })),
              { onConflict: "notification_id,user_id" }
            )
        }
      }
    } else if (body.ids && Array.isArray(body.ids)) {
      // Fetch the specific notifications to separate personal from broadcast
      const { data: notifications } = await service
        .from("notifications")
        .select("id, profile_id")
        .in("id", body.ids)

      if (notifications) {
        const personalIds = notifications
          .filter((n) => n.profile_id !== null)
          .map((n) => n.id)
        const broadcastIds = notifications
          .filter((n) => n.profile_id === null)
          .map((n) => n.id)

        // Update personal notifications
        if (personalIds.length > 0) {
          await supabase
            .from("notifications")
            .update({ read: true })
            .in("id", personalIds)
            .eq("profile_id", profileId)
        }

        // Insert read receipts for broadcast notifications
        if (broadcastIds.length > 0) {
          await supabase
            .from("notification_reads")
            .upsert(
              broadcastIds.map((id) => ({
                notification_id: id,
                user_id: user.id,
              })),
              { onConflict: "notification_id,user_id" }
            )
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark read error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
