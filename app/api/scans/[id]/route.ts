import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)

    const { data: scan, error } = await supabase
      .from("scans")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 })
    }

    if (scan.profile_id !== profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(scan)
  } catch (error) {
    console.error("Scan detail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
