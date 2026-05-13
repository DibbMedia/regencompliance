import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { isValidUUID } from "@/lib/validations"
import { getScan } from "@/lib/repos/scans"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid scan ID format" }, { status: 400 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)

    // getScan() also filters by profile_id, so a stranger's scan returns null.
    const scan = await getScan(supabase, profileId, id)

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 })
    }

    return NextResponse.json(scan)
  } catch (error) {
    console.error("Scan detail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
