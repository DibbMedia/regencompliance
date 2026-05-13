import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { isValidUUID } from "@/lib/validations"
import { getMonitoredSite } from "@/lib/repos/monitored-sites"
import { listPagesForSite } from "@/lib/repos/site-pages"

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

    // Verify site ownership via repo lookup.
    const site = await getMonitoredSite(supabase, profileId, id)
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get("sort") || "score_asc"
    const status = searchParams.get("status")

    // Fetch all pages, decrypted; sort client-side because compliance_score
    // and last_scanned_at are pass-through columns but the repo doesn't
    // expose an `order_by` knob today and the page count per site is
    // bounded (max 50 discovered, often less).
    const { pages } = await listPagesForSite(supabase, profileId, id, {
      limit: 1000,
      status: status ?? undefined,
    })

    const sorted = [...pages].sort((a, b) => {
      switch (sort) {
        case "score_desc": {
          const av = a.compliance_score
          const bv = b.compliance_score
          if (av == null && bv == null) return 0
          if (av == null) return -1
          if (bv == null) return 1
          return bv - av
        }
        case "recent": {
          const av = a.last_scanned_at
          const bv = b.last_scanned_at
          if (av == null && bv == null) return 0
          if (av == null) return -1
          if (bv == null) return 1
          return av < bv ? 1 : av > bv ? -1 : 0
        }
        case "score_asc":
        default: {
          const av = a.compliance_score
          const bv = b.compliance_score
          if (av == null && bv == null) return 0
          if (av == null) return 1
          if (bv == null) return -1
          return av - bv
        }
      }
    })

    return NextResponse.json({ pages: sorted })
  } catch (error) {
    console.error("Pages GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
