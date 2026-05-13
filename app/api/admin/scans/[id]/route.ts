import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { isValidUUID } from "@/lib/validations"
import { getScanForAdmin } from "@/lib/repos/scans"

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

    // Admin read path: decrypt under the scan's own profile_id (read from
    // the row, not the requesting admin's id).
    const scan = await getScanForAdmin(serviceClient, scanId)

    if (!scan) {
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
        id: scan.id,
        profile_id: scan.profile_id,
        content_type: scan.content_type,
        original_text: scan.original_text,
        compliance_score: scan.compliance_score,
        flag_count: scan.flag_count,
        flags: scan.flags,
        created_at: scan.created_at,
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
