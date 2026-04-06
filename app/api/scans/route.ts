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
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
    const contentType = searchParams.get("content_type")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")
    const search = searchParams.get("search")

    let query = supabase
      .from("scans")
      .select("*", { count: "exact" })
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (contentType) query = query.eq("content_type", contentType)
    if (dateFrom) query = query.gte("created_at", dateFrom)
    if (dateTo) query = query.lte("created_at", dateTo)
    if (search) query = query.ilike("original_text", `%${search}%`)

    const { data: scans, count, error } = await query

    if (error) {
      console.error("Scans fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch scans" }, { status: 500 })
    }

    return NextResponse.json({
      scans: scans || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Scans error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
