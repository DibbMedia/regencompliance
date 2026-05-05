import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"

export const maxDuration = 60

/**
 * Escape a value for CSV output AND neutralize formula injection.
 *
 * Excel / Google Sheets / Numbers all interpret cells starting with `=`, `+`,
 * `-`, `@`, tab, or carriage-return as formulas, which means a malicious
 * waitlist signup with name `=cmd|'/c calc'!A1` could execute on the admin's
 * machine when the CSV is opened. Per OWASP CSV-injection guidance, prefix
 * any cell starting with one of those characters with a single quote.
 */
function csvEscape(value: string | null | undefined): string {
  if (value == null) return ""
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`
  }
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET() {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { serviceClient } = auth

  const { data, error } = await serviceClient
    .from("waitlist")
    .select("name, email, source, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Waitlist export error:", error)
    return NextResponse.json({ error: "Failed to export waitlist" }, { status: 500 })
  }

  const header = "name,email,source,created_at"
  const rows = (data || []).map((r) =>
    [csvEscape(r.name), csvEscape(r.email), csvEscape(r.source), csvEscape(r.created_at)].join(",")
  )
  const csv = [header, ...rows].join("\n")

  const filename = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
