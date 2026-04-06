import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
    const search = searchParams.get("search") || ""
    const contentType = searchParams.get("content_type") || ""

    let query = serviceClient
      .from("scans")
      .select(
        "id, profile_id, content_type, compliance_score, flag_count, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (contentType) {
      query = query.eq("content_type", contentType)
    }

    const { data: scans, count, error } = await query

    if (error) {
      console.error("Admin scans fetch error:", error)
      return NextResponse.json(
        { error: "Failed to fetch scans" },
        { status: 500 }
      )
    }

    // Resolve emails for each scan's profile_id
    const profileEmailCache: Record<string, string> = {}
    const scansWithEmail = []
    for (const scan of scans || []) {
      if (!profileEmailCache[scan.profile_id]) {
        const {
          data: { user },
        } = await serviceClient.auth.admin.getUserById(scan.profile_id)
        profileEmailCache[scan.profile_id] = user?.email || "unknown"
      }
      scansWithEmail.push({
        ...scan,
        user_email: profileEmailCache[scan.profile_id],
      })
    }

    return NextResponse.json({
      scans: scansWithEmail,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Admin scans error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
