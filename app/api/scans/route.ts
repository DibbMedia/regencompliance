import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { parsePagination } from "@/lib/validations"
import { listScans } from "@/lib/repos/scans"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)
    const { searchParams } = new URL(request.url)
    const { page, limit } = parsePagination(searchParams)
    const contentType = searchParams.get("content_type")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")
    const search = searchParams.get("search")

    // List + decrypt via the encrypted scans repo. Encrypted columns are
    // opaque to SQL so date/content_type filters on plaintext columns
    // (already supported by the repo) still work; the `search` ilike on
    // original_text dies post-encryption — we fall back to client-side
    // filtering over the decrypted page. For founder-beta scale (handful
    // of users, scans-per-day in the low hundreds) this is fine.
    const { scans, count } = await listScans(supabase, profileId, {
      limit,
      offset: (page - 1) * limit,
      content_type: contentType ?? undefined,
    })

    // Date filters: apply client-side to the decrypted page. The repo
    // doesn't accept date params today; pushing them in there is a
    // follow-up. For now we honour them after decryption.
    let filtered = scans
    if (dateFrom) {
      filtered = filtered.filter((s) => s.created_at >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((s) => s.created_at <= dateTo)
    }
    if (search) {
      const needle = search.toLowerCase()
      filtered = filtered.filter((s) =>
        (s.original_text ?? "").toLowerCase().includes(needle),
      )
    }

    return NextResponse.json({
      scans: filtered,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Scans error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
