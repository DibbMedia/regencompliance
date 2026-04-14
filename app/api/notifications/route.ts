import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { parsePagination } from "@/lib/validations"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)
    const { searchParams } = new URL(request.url)
    const { page, limit } = parsePagination(searchParams)
    const unreadOnly = searchParams.get("unread_only") === "true"
    const type = searchParams.get("type")

    // Fetch notifications (personal + broadcasts)
    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .or(`profile_id.eq.${profileId},profile_id.is.null`)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (type) query = query.eq("type", type)
    // Don't filter unread here for broadcasts — we need to check notification_reads

    const { data: notifications, count, error } = await query

    if (error) {
      console.error("Notifications fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    // Get broadcast read receipts for this user
    const broadcastIds = (notifications || [])
      .filter((n) => n.profile_id === null)
      .map((n) => n.id)

    let readBroadcastSet = new Set<string>()
    if (broadcastIds.length > 0) {
      const { data: reads } = await supabase
        .from("notification_reads")
        .select("notification_id")
        .eq("user_id", user.id)
        .in("notification_id", broadcastIds)

      readBroadcastSet = new Set((reads || []).map((r) => r.notification_id))
    }

    // Merge read status: broadcasts use notification_reads, personal use the read column
    const merged = (notifications || []).map((n) => ({
      ...n,
      read: n.profile_id === null ? readBroadcastSet.has(n.id) : n.read,
    }))

    // Apply unread filter after merging (since broadcast read status comes from notification_reads)
    const filtered = unreadOnly ? merged.filter((n) => !n.read) : merged

    return NextResponse.json({
      notifications: filtered,
      total: unreadOnly ? filtered.length : (count || 0),
      page,
      totalPages: unreadOnly
        ? Math.max(1, Math.ceil(filtered.length / limit))
        : Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
