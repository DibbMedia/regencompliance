import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"

export async function GET(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  const { serviceClient } = auth

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500)
  const publishedParam = url.searchParams.get("published")

  let q = serviceClient
    .from("enforcement_actions")
    .select("id, source_url, source_type, source_name, source_date, agency, company_name, product_or_treatment, summary, violation_categories, rule_count, is_published, created_at")
    .order("source_date", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (publishedParam === "true") q = q.eq("is_published", true)
  else if (publishedParam === "false") q = q.eq("is_published", false)

  const { data, error } = await q

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ actions: data ?? [] })
}
