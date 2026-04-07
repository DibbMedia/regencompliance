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
