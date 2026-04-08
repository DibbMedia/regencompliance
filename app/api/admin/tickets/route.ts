import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { parsePagination } from "@/lib/validations"

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || ""
    const { page, limit } = parsePagination(searchParams)

    let query = serviceClient
      .from("support_tickets")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: tickets, count, error } = await query

    if (error) {
      console.error("Admin tickets fetch error:", error)
      // Table may not exist yet
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json({
          tickets: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        })
      }
      return NextResponse.json(
        { error: "Failed to fetch tickets" },
        { status: 500 }
      )
    }

    // Resolve user emails
    const profileEmailCache: Record<string, string> = {}
    const ticketsWithEmail = []
    for (const ticket of tickets || []) {
      const pid = ticket.user_id || ticket.profile_id
      if (pid && !profileEmailCache[pid]) {
        const {
          data: { user },
        } = await serviceClient.auth.admin.getUserById(pid)
        profileEmailCache[pid] = user?.email || "unknown"
      }
      ticketsWithEmail.push({
        ...ticket,
        user_email: pid ? profileEmailCache[pid] : "unknown",
      })
    }

    return NextResponse.json({
      tickets: ticketsWithEmail,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Admin tickets error:", error)
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
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      )
    }

    const validStatuses = ["open", "in_progress", "resolved", "closed"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const { data, error } = await serviceClient
      .from("support_tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Ticket status update error:", error)
      return NextResponse.json(
        { error: "Failed to update ticket" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Admin ticket patch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
