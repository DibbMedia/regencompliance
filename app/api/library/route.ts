import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const riskLevel = searchParams.get("risk_level")
    const category = searchParams.get("category")
    const treatment = searchParams.get("treatment")
    const search = searchParams.get("search")

    let query = supabase
      .from("compliance_rules")
      .select("*")
      .eq("is_active", true)
      .order("risk_level", { ascending: true })
      .order("source_date", { ascending: false })

    if (riskLevel) query = query.eq("risk_level", riskLevel)
    if (category) query = query.eq("category", category)
    if (treatment) query = query.contains("applies_to", [treatment])
    if (search) {
      const escapedSearch = search.replace(/%/g, '\\%').replace(/_/g, '\\_')
      query = query.or(`banned_phrase.ilike.%${escapedSearch}%,compliant_alternative.ilike.%${escapedSearch}%`)
    }

    const { data: rules, error } = await query

    if (error) {
      console.error("Library fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 })
    }

    return NextResponse.json({ rules: rules || [] })
  } catch (error) {
    console.error("Library error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
