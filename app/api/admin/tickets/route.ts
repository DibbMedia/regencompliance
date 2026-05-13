import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { parsePagination } from "@/lib/validations"
import { listTicketsForAdmin } from "@/lib/repos/support-tickets"

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || ""
    const { page, limit } = parsePagination(searchParams)

    // Count comes from a head select against the table directly; the repo
    // doesn't yet expose a count helper.
    let countQuery = serviceClient
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
    if (status) countQuery = countQuery.eq("status", status)
    const { count, error: countError } = await countQuery
    if (countError) {
      console.error("Admin tickets count error:", countError)
      if (countError.code === "42P01" || countError.message?.includes("does not exist")) {
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

    const offset = (page - 1) * limit
    const opts: { status?: string; limit: number; offset: number } = {
      limit,
      offset,
    }
    if (status) opts.status = status

    let tickets
    try {
      tickets = await listTicketsForAdmin(serviceClient, opts)
    } catch (error) {
      console.error("Admin tickets fetch error:", error)
      return NextResponse.json(
        { error: "Failed to fetch tickets" },
        { status: 500 }
      )
    }

    // Resolve user emails
    const profileEmailCache: Record<string, string> = {}
    const ticketsWithEmail = []
    for (const ticket of tickets) {
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
    const { id, status, priority } = body

    if (!id) {
      return NextResponse.json(
        { error: "Missing ticket id" },
        { status: 400 }
      )
    }

    if (!status && !priority) {
      return NextResponse.json(
        { error: "Must provide status or priority to update" },
        { status: 400 }
      )
    }

    const validStatuses = ["open", "in_progress", "resolved", "closed"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const validPriorities = ["low", "normal", "medium", "high", "urgent"]
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority" },
        { status: 400 }
      )
    }

    const updates: Record<string, string> = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (priority) updates.priority = priority

    const { data, error } = await serviceClient
      .from("support_tickets")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Ticket update error:", error)
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
