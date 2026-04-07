import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import ReactPDF from "@react-pdf/renderer"
import { ScanPdfDocument } from "@/lib/pdf-template"
import { isValidUUID } from "@/lib/validations"

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

    const { data: scan } = await supabase
      .from("scans")
      .select("*")
      .eq("id", id)
      .single()

    if (!scan || scan.profile_id !== profileId) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_name")
      .eq("id", profileId)
      .single()

    const pdfStream = await ReactPDF.renderToStream(
      ScanPdfDocument({
        scan,
        clinicName: profile?.clinic_name || "Unknown Clinic",
      })
    )

    const chunks: Uint8Array[] = []
    for await (const chunk of pdfStream) {
      chunks.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk)
    }
    const buffer = Buffer.concat(chunks)

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="compliance-scan.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF export error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
