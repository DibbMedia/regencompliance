import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { isValidUUID } from "@/lib/validations"

// GET — site detail with all pages and their scores
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid site ID" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)

    // Fetch site and verify ownership
    const { data: site, error } = await supabase
      .from("monitored_sites")
      .select("*")
      .eq("id", id)
      .eq("profile_id", profileId)
      .single()

    if (error || !site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Fetch all pages for this site
    const { data: pages } = await supabase
      .from("site_pages")
      .select("*")
      .eq("site_id", id)
      .order("compliance_score", { ascending: true, nullsFirst: false })

    return NextResponse.json({ site, pages: pages || [] })
  } catch (error) {
    console.error("Site GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE — remove site and all its pages (cascade)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid site ID" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)

    // Verify ownership before deleting
    const { data: site } = await supabase
      .from("monitored_sites")
      .select("id")
      .eq("id", id)
      .eq("profile_id", profileId)
      .single()

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Delete site (site_pages cascade via FK)
    const { error } = await supabase
      .from("monitored_sites")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Failed to delete site:", error)
      return NextResponse.json({ error: "Failed to delete site" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Site DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
