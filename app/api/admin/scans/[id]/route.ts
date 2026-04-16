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

    const { id: scanId } = await params

    if (!isValidUUID(scanId)) {
      return NextResponse.json(
        { error: "Invalid scan ID format" },
        { status: 400 }
      )
    }

    const { data: scan, error } = await serviceClient
      .from("scans")
      .select("id, profile_id, content_type, original_text, compliance_score, flag_count, flags, created_at")
      .eq("id", scanId)
      .single()

    if (error || !scan) {
      return NextResponse.json(
        { error: "Scan not found" },
        { status: 404 }
      )
    }

    // Resolve user email
    const {
      data: { user },
    } = await serviceClient.auth.admin.getUserById(scan.profile_id)

    return NextResponse.json({
      scan: {
        ...scan,
        user_email: user?.email || "unknown",
      },
    })
  } catch (error) {
    console.error("Admin scan detail error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
