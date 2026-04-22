import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { isValidUUID } from "@/lib/validations"

// GET - list all pages for a site with compliance data
export async function GET(
  request: Request,
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

    // Verify site ownership
    const { data: site } = await supabase
      .from("monitored_sites")
      .select("id")
      .eq("id", id)
      .eq("profile_id", profileId)
      .single()

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get("sort") || "score_asc"
    const status = searchParams.get("status")

    // Build query
    let query = supabase
      .from("site_pages")
      .select("*")
      .eq("site_id", id)

    // Filter by status
    if (status) {
      query = query.eq("status", status)
    }

    // Sort
    switch (sort) {
      case "score_asc":
        query = query.order("compliance_score", { ascending: true, nullsFirst: false })
        break
      case "score_desc":
        query = query.order("compliance_score", { ascending: false, nullsFirst: true })
        break
      case "recent":
        query = query.order("last_scanned_at", { ascending: false, nullsFirst: true })
        break
      default:
        query = query.order("compliance_score", { ascending: true, nullsFirst: false })
    }

    const { data: pages, error } = await query

    if (error) {
      console.error("Failed to fetch pages:", error)
      return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
    }

    return NextResponse.json({ pages: pages || [] })
  } catch (error) {
    console.error("Pages GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
