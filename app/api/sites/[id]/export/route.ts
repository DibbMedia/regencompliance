import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import ReactPDF from "@react-pdf/renderer"
import { SitePdfDocument } from "@/lib/pdf-template"
import type { SitePageData } from "@/lib/pdf-template"
import { isValidUUID } from "@/lib/validations"
import { getMonitoredSite } from "@/lib/repos/monitored-sites"
import { listPagesForSite } from "@/lib/repos/site-pages"
import { getProfile } from "@/lib/repos/profiles"
import { decryptJSONForUser, withCryptoRequestScope } from "@/lib/crypto"
import type { ScanFlag } from "@/lib/types"

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

    // Subscription gate + clinic name via encrypted profile repo.
    const profile = await getProfile(supabase, profileId)

    if (!profile || !["active", "past_due"].includes(profile.subscription_status ?? "")) {
      return NextResponse.json({ error: "Active subscription required" }, { status: 403 })
    }

    // Verify site ownership via repo.
    const site = await getMonitoredSite(supabase, profileId, id)
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Fetch all pages, decrypted.
    const { pages } = await listPagesForSite(supabase, profileId, id, { limit: 1000 })
    const sortedPages = [...pages].sort((a, b) => {
      const av = a.compliance_score
      const bv = b.compliance_score
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      return av - bv
    })

    // For pages with scans, decrypt top flags from their last scan. The
    // flags column lives on scans, encrypted under the same profile DEK
    // (AAD bound to scan row id), so we read flags_enc + the legacy flags
    // column and decrypt per-row.
    const pagesWithScans = sortedPages.filter((p) => p.last_scan_id != null)
    const scanIds = pagesWithScans.map((p) => p.last_scan_id as string)

    const scanFlagsMap: Record<string, { flags: ScanFlag[] }> = {}
    if (scanIds.length > 0) {
      await withCryptoRequestScope(async () => {
        const batchSize = 50
        for (let i = 0; i < scanIds.length; i += batchSize) {
          const batch = scanIds.slice(i, i + batchSize)
          // Post-cutover (mig 036): plaintext `flags` is gone; select only
          // the encrypted envelope and surface any error instead of swallowing.
          const { data: scans, error: scansErr } = await supabase
            .from("scans")
            .select("id, flags_enc")
            .in("id", batch)

          if (scansErr) throw scansErr
          if (scans) {
            for (const scan of scans as Array<{
              id: string
              flags_enc: string | null
            }>) {
              const flags: ScanFlag[] =
                scan.flags_enc != null
                  ? decryptJSONForUser<ScanFlag[]>({
                      userId: profileId,
                      envelope: scan.flags_enc,
                      table: "scans",
                      column: "flags",
                      rowId: scan.id,
                    })
                  : []
              scanFlagsMap[scan.id] = { flags }
            }
          }
        }
      })
    }

    // Build page data for the PDF
    const pageData: SitePageData[] = sortedPages.map((p) => {
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
          compliance_score: site.avg_compliance_score,
          last_scanned_at: site.last_crawl_at,
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
