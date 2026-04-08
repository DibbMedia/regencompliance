import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import ReactPDF from "@react-pdf/renderer"
import { SitePdfDocument } from "@/lib/pdf-template"
import type { SitePageData } from "@/lib/pdf-template"
import { isValidUUID } from "@/lib/validations"

export const maxDuration = 60

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

    // Check subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_name, subscription_status")
      .eq("id", profileId)
      .single()

    if (!profile || !["active", "past_due"].includes(profile.subscription_status ?? "")) {
      return NextResponse.json({ error: "Active subscription required" }, { status: 403 })
    }

    // Verify site ownership
    const { data: site } = await supabase
      .from("monitored_sites")
      .select("*")
      .eq("id", id)
      .eq("profile_id", profileId)
      .single()

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Fetch all pages with scores
    const { data: pages } = await supabase
      .from("site_pages")
      .select("*")
      .eq("site_id", id)
      .order("compliance_score", { ascending: true, nullsFirst: false })

    // For pages with scans, fetch top flags from their last scan
    const pagesWithScans = (pages || []).filter((p: { last_scan_id: string | null }) => p.last_scan_id)
    const scanIds = pagesWithScans.map((p: { last_scan_id: string }) => p.last_scan_id)

    let scanFlagsMap: Record<string, { flags: unknown[] }> = {}
    if (scanIds.length > 0) {
      // Fetch scans in batches of 50 to avoid query limits
      const batchSize = 50
      for (let i = 0; i < scanIds.length; i += batchSize) {
        const batch = scanIds.slice(i, i + batchSize)
        const { data: scans } = await supabase
          .from("scans")
          .select("id, flags")
          .in("id", batch)

        if (scans) {
          for (const scan of scans) {
            scanFlagsMap[scan.id] = { flags: (scan.flags || []) as unknown[] }
          }
        }
      }
    }

    // Build page data for the PDF
    const pageData: SitePageData[] = (pages || []).map((p: {
      id: string
      url: string
      title: string | null
      compliance_score: number | null
      high_risk_count: number
      medium_risk_count: number
      low_risk_count: number
      last_scanned_at: string | null
      last_scan_id: string | null
    }) => {
      const scanData = p.last_scan_id ? scanFlagsMap[p.last_scan_id] : null
      return {
        id: p.id,
        url: p.url,
        title: p.title,
        compliance_score: p.compliance_score,
        high_risk_count: p.high_risk_count,
        medium_risk_count: p.medium_risk_count,
        low_risk_count: p.low_risk_count,
        last_scanned_at: p.last_scanned_at,
        flags: scanData ? (scanData.flags as SitePageData["flags"]) : undefined,
      }
    })

    const clinicName = profile.clinic_name || "Unknown Clinic"

    const pdfStream = await ReactPDF.renderToStream(
      SitePdfDocument({
        site: {
          domain: site.domain,
          name: site.name,
          compliance_score: site.compliance_score,
          last_scanned_at: site.last_scanned_at,
          pages: pageData,
        },
        clinicName,
      })
    )

    const chunks: Uint8Array[] = []
    for await (const chunk of pdfStream) {
      chunks.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk)
    }
    const buffer = Buffer.concat(chunks)

    const safeDomain = site.domain.replace(/[^a-zA-Z0-9.]/g, "-").replace(/-+/g, "-").slice(0, 40)
    const dateStr = new Date().toISOString().split("T")[0]

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeDomain}-site-report-${dateStr}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Site PDF export error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
