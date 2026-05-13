import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { parsePagination } from "@/lib/validations"
import { listNotifications } from "@/lib/repos/notifications"

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

    // Count comes from a separate head select against the table; the repo
    // doesn't yet expose a count helper.
    let countQuery = supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
    if (unreadOnly) countQuery = countQuery.eq("read", false)
    if (type) countQuery = countQuery.eq("type", type)
    const { count, error: countError } = await countQuery
    if (countError) {
      console.error("Notifications count error:", countError)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    const offset = (page - 1) * limit
    const opts: { read?: boolean; type?: string; limit: number; offset: number } = {
      limit,
      offset,
    }
    if (unreadOnly) opts.read = false
    if (type) opts.type = type

    let notifications
    try {
      notifications = await listNotifications(supabase, profileId, opts)
    } catch (error) {
      console.error("Notifications fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    return NextResponse.json({
      notifications,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
