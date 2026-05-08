import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { parsePagination } from "@/lib/validations"

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const { searchParams } = new URL(request.url)
    const { page, limit } = parsePagination(searchParams)
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

    const uniqueProfileIds = Array.from(
      new Set((scans || []).map((s) => s.profile_id))
    )
    const emailEntries = await Promise.all(
      uniqueProfileIds.map(async (id) => {
        const {
          data: { user },
        } = await serviceClient.auth.admin.getUserById(id)
        return [id, user?.email || "unknown"] as const
      })
    )
    const emailById = new Map(emailEntries)
    const scansWithEmail = (scans || []).map((scan) => ({
      ...scan,
      user_email: emailById.get(scan.profile_id) || "unknown",
    }))

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
