import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20
    const unreadOnly = searchParams.get("unread_only") === "true"
    const type = searchParams.get("type")

    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .or(`profile_id.eq.${profileId},profile_id.is.null`)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (unreadOnly) query = query.eq("read", false)
    if (type) query = query.eq("type", type)

    const { data: notifications, count, error } = await query

    if (error) {
      console.error("Notifications fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    return NextResponse.json({
      notifications: notifications || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
