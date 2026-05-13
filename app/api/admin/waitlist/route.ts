import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { parsePagination, isValidUUID } from "@/lib/validations"
import { listWaitlistForAdmin } from "@/lib/repos/waitlist"

export const maxDuration = 30

export async function GET(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { serviceClient } = auth
  const { searchParams } = new URL(request.url)
  const { page, limit } = parsePagination(searchParams)

  // Search by name/email REMOVED per plan §12.6: post-Phase-6 encryption the
  // email + name columns are opaque ciphertext, so server-side ilike no
  // longer matches anything meaningful. Admin pivots to row UUID or browses
  // by created_at order. The query param is silently ignored so old
  // bookmarks don't 400 - the UI also dropped the search input.

  // Pull the page from the repo (decrypts each row). For the total count we
  // do a head:true count on the table directly - count doesn't need
  // decryption.
  const { count } = await serviceClient
    .from("waitlist")
    .select("id", { count: "exact", head: true })

  let entries
  try {
    entries = await listWaitlistForAdmin(serviceClient, {
      limit,
      offset: (page - 1) * limit,
      order: "desc",
    })
  } catch (error) {
    console.error("Admin waitlist fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch waitlist" }, { status: 500 })
  }

  return NextResponse.json({
    entries,
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

  // Validate UUID format up front so a non-UUID surfaces as a clean 400
  // (consistent with every other admin DELETE route - prevents Postgres
  // errors from leaking type/format details through the 500 path).
  if (!id || typeof id !== "string" || !isValidUUID(id)) {
    return NextResponse.json({ error: "Valid UUID id required" }, { status: 400 })
  }

  const { error } = await serviceClient.from("waitlist").delete().eq("id", id)
  if (error) {
    console.error("Admin waitlist delete error:", error)
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
