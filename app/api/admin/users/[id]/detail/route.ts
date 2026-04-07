import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { isValidUUID } from "@/lib/validations"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const { id: userId } = await params

    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    // Get profile info
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("created_at, subscription_status")
      .eq("id", userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Last 5 scans
    const { data: recentScans } = await serviceClient
      .from("scans")
      .select("id, content_type, compliance_score, flag_count, created_at")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    // Scans this month
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const { count: scansThisMonth } = await serviceClient
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", userId)
      .gte("created_at", monthStart.toISOString())

    return NextResponse.json({
      recentScans: recentScans || [],
      subscriptionDates: {
        created_at: profile.created_at,
        subscription_status: profile.subscription_status,
      },
      scansThisMonth: scansThisMonth || 0,
    })
  } catch (error) {
    console.error("Admin user detail error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
