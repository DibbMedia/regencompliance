import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""

    let query = serviceClient
      .from("compliance_rules")
      .select("*", { count: "exact" })
      .order("risk_level", { ascending: true })
      .order("banned_phrase", { ascending: true })
      .range((page - 1) * limit, page * limit - 1)

    if (search) {
      query = query.or(
        `banned_phrase.ilike.%${search}%,compliant_alternative.ilike.%${search}%`
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
    const { id, is_active } = body

    if (!id || typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "id and is_active (boolean) are required" },
        { status: 400 }
      )
    }

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
