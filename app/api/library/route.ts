import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { libraryQuerySchema } from "@/lib/validations"
import type { EnforcementActionWithRules } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parsed = libraryQuerySchema.safeParse({
      risk_level: searchParams.get("risk_level") || undefined,
      category: searchParams.get("category") || undefined,
      treatment: searchParams.get("treatment") || undefined,
      source_type: searchParams.get("source_type") || undefined,
      search: searchParams.get("search") || undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      )
    }
    const { risk_level, category, treatment, source_type, search } = parsed.data

    // Inner join: actions whose embedded rules survive the filters.
    // Embedded select also pre-filtered to is_active rules only.
    const buildBase = () => {
      let q = supabase
        .from("enforcement_actions")
        .select("*, compliance_rules!inner(*)")
        .eq("is_published", true)
        .eq("compliance_rules.is_active", true)

      if (risk_level) q = q.eq("compliance_rules.risk_level", risk_level)
      if (category) q = q.eq("compliance_rules.category", category)
      if (treatment) q = q.contains("compliance_rules.applies_to", [treatment])
      if (source_type) q = q.eq("source_type", source_type)

      return q.order("source_date", { ascending: false, nullsFirst: false })
    }

    let actions: EnforcementActionWithRules[] = []

    if (search) {
      const escaped = search.replace(/%/g, "\\%").replace(/_/g, "\\_")
      const pattern = `%${escaped}%`

      // Query A: parent fields match (company_name, summary, source_name)
      const { data: parentMatches } = await buildBase().or(
        `company_name.ilike.${pattern},summary.ilike.${pattern},source_name.ilike.${pattern}`,
      )

      // Query B: child rule fields match (banned_phrase, compliant_alternative)
      const { data: childMatches } = await buildBase().or(
        `banned_phrase.ilike.${pattern},compliant_alternative.ilike.${pattern}`,
        { referencedTable: "compliance_rules" },
      )

      const byId = new Map<string, EnforcementActionWithRules>()
      for (const a of (parentMatches ?? []) as EnforcementActionWithRules[]) byId.set(a.id, a)
      for (const a of (childMatches ?? []) as EnforcementActionWithRules[]) {
        if (!byId.has(a.id)) byId.set(a.id, a)
      }
      actions = Array.from(byId.values()).sort((a, b) => {
        if (!a.source_date) return 1
        if (!b.source_date) return -1
        return b.source_date.localeCompare(a.source_date)
      })
    } else {
      const { data, error } = await buildBase()
      if (error) {
        console.error("Library fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 })
      }
      actions = (data ?? []) as EnforcementActionWithRules[]
    }

    return NextResponse.json({ actions })
  } catch (error) {
    console.error("Library error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
