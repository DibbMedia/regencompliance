import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { adminSearchSchema, adminRulePatchSchema } from "@/lib/validations"

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const { searchParams } = new URL(request.url)
    const paramsParsed = adminSearchSchema.safeParse({
      search: searchParams.get("search") || "",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "50",
      category: searchParams.get("category") || "",
    })
    if (!paramsParsed.success) {
      return NextResponse.json({ error: paramsParsed.error.issues[0].message }, { status: 400 })
    }

    const { search, page, category } = paramsParsed.data
    const limit = Math.min(paramsParsed.data.limit || 50, 100)

    let query = serviceClient
      .from("compliance_rules")
      .select("*", { count: "exact" })
      .order("risk_level", { ascending: true })
      .order("banned_phrase", { ascending: true })
      .range((page - 1) * limit, page * limit - 1)

    if (search) {
      const escapedSearch = search.replace(/%/g, '\\%').replace(/_/g, '\\_')
      query = query.or(
        `banned_phrase.ilike.%${escapedSearch}%,compliant_alternative.ilike.%${escapedSearch}%`
      )
    }
    if (category) {
      query = query.eq("category", category)
    }

    const { data: rules, count, error } = await query

    if (error) {
      console.error("Admin rules fetch error:", error)
      return NextResponse.json(
        { error: "Failed to fetch rules" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      rules: rules || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Admin rules error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const body = await request.json()
    let { banned_phrase, compliant_alternative, risk_level, category } = body

    if (!banned_phrase || !compliant_alternative) {
      return NextResponse.json(
        { error: "banned_phrase and compliant_alternative are required" },
        { status: 400 }
      )
    }

    // Strip HTML tags from inputs
    const stripHtml = (str: string) => str.replace(/<[^>]*>/g, "")
    banned_phrase = stripHtml(String(banned_phrase)).trim()
    compliant_alternative = stripHtml(String(compliant_alternative)).trim()
    category = category ? stripHtml(String(category)).trim() : "general"

    // Length validation
    if (banned_phrase.length > 500) {
      return NextResponse.json(
        { error: "banned_phrase must be 500 characters or fewer" },
        { status: 400 }
      )
    }
    if (compliant_alternative.length > 1000) {
      return NextResponse.json(
        { error: "compliant_alternative must be 1000 characters or fewer" },
        { status: 400 }
      )
    }

    // Re-check after sanitization
    if (!banned_phrase || !compliant_alternative) {
      return NextResponse.json(
        { error: "Fields cannot be empty after sanitization" },
        { status: 400 }
      )
    }

    const validRiskLevels = ["high", "medium", "low"]
    if (risk_level && !validRiskLevels.includes(risk_level)) {
      return NextResponse.json(
        { error: "Invalid risk_level" },
        { status: 400 }
      )
    }

    // Duplicate check
    const { data: existing } = await serviceClient
      .from("compliance_rules")
      .select("id")
      .ilike("banned_phrase", banned_phrase)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "A rule with this banned phrase already exists" },
        { status: 409 }
      )
    }

    const { data, error } = await serviceClient
      .from("compliance_rules")
      .insert({
        banned_phrase,
        compliant_alternative,
        risk_level: risk_level || "medium",
        category: category || "general",
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Admin rule create error:", error)
      return NextResponse.json(
        { error: "Failed to create rule" },
        { status: 500 }
      )
    }

    return NextResponse.json({ rule: data }, { status: 201 })
  } catch (error) {
    console.error("Admin rules POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const body = await request.json()
    const parsed = adminRulePatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { id, is_active } = parsed.data

    const { data, error } = await serviceClient
      .from("compliance_rules")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Admin rule toggle error:", error)
      return NextResponse.json(
        { error: "Failed to update rule" },
        { status: 500 }
      )
    }

    return NextResponse.json({ rule: data })
  } catch (error) {
    console.error("Admin rules PATCH error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
