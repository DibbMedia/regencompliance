import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { requireWriteMode } from "@/lib/impersonation"
import { isValidUUID } from "@/lib/validations"
import {
  getMonitoredSite,
  updateMonitoredSite,
} from "@/lib/repos/monitored-sites"
import { listPagesForSite } from "@/lib/repos/site-pages"

// GET - site detail with all pages and their scores
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

    // Fetch site via encrypted repo (also enforces profile_id ownership).
    const site = await getMonitoredSite(supabase, profileId, id)
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Fetch all pages for this site (decrypted).
    // Note: listPagesForSite orders by created_at desc by default; the
    // legacy route ordered by compliance_score asc nullsFirst:false. Sort
    // client-side to preserve the prior ordering for UI compatibility.
    const { pages } = await listPagesForSite(supabase, profileId, id, { limit: 1000 })
    const sorted = [...pages].sort((a, b) => {
      const av = a.compliance_score
      const bv = b.compliance_score
      // nullsFirst:false -> nulls last
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      return av - bv
    })

    return NextResponse.json({ site, pages: sorted })
  } catch (error) {
    console.error("Site GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - update site (toggle active, rename, etc.)
export async function PATCH(
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

    const blocked = await requireWriteMode()
    if (blocked) return blocked

    const profileId = await effectiveProfileId(user.id, supabase)

    // Verify ownership via repo lookup.
    const site = await getMonitoredSite(supabase, profileId, id)
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    const body = await request.json()
    const patch: Parameters<typeof updateMonitoredSite>[3] = {}

    if (typeof body.is_active === "boolean") patch.is_active = body.is_active
    if (typeof body.name === "string") patch.name = body.name.slice(0, 200)

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    patch.updated_at = new Date().toISOString()

    try {
      const updated = await updateMonitoredSite(supabase, profileId, id, patch)
      return NextResponse.json(updated)
    } catch (err) {
      console.error("Failed to update site:", err)
      return NextResponse.json({ error: "Failed to update site" }, { status: 500 })
    }
  } catch (error) {
    console.error("Site PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - remove site and all its pages (cascade)
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

    const blocked = await requireWriteMode()
    if (blocked) return blocked

    const profileId = await effectiveProfileId(user.id, supabase)

    // Verify ownership before deleting (via repo lookup).
    const site = await getMonitoredSite(supabase, profileId, id)
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Delete site (site_pages cascade via FK). Plain DB call; no encrypted
    // fields involved in a DELETE.
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
