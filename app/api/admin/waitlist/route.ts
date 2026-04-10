import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { parsePagination } from "@/lib/validations"

export const maxDuration = 30

export async function GET(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { serviceClient } = auth
  const { searchParams } = new URL(request.url)
  const { page, limit } = parsePagination(searchParams)
  const search = (searchParams.get("search") || "").trim().slice(0, 100)

  let query = serviceClient
    .from("waitlist")
    .select("id, name, email, source, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (search) {
    // Escape % and _ for ilike, then wrap
    const safe = search.replace(/[%_\\]/g, (c) => `\\${c}`)
    query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%`)
  }

  const { data, count, error } = await query

  if (error) {
    console.error("Admin waitlist fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch waitlist" }, { status: 500 })
  }

  return NextResponse.json({
    entries: data || [],
    total: count || 0,
    page,
    totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
  })
}

export async function DELETE(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { serviceClient } = auth
  const body = await request.json().catch(() => null)
  const id = body?.id

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 })
  }

  const { error } = await serviceClient.from("waitlist").delete().eq("id", id)
  if (error) {
    console.error("Admin waitlist delete error:", error)
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
