import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { requireWriteMode } from "@/lib/impersonation"
import { ticketCreateSchema, parsePagination } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { listTickets, createTicket } from "@/lib/repos/support-tickets"
import { createTicketMessage } from "@/lib/repos/ticket-messages"
import { logAudit, getRequestMeta } from "@/lib/audit-log"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)
    const { searchParams } = new URL(request.url)
    const { page, limit } = parsePagination(searchParams)
    const status = searchParams.get("status")

    const offset = (page - 1) * limit
    const opts: { status?: string; limit: number; offset: number } = {
      limit,
      offset,
    }
    if (status && status !== "all") opts.status = status

    // Pull count separately - the repo doesn't expose a count helper yet, and
    // exposing one here would mean a second round-trip for the totalPages math.
    let countQuery = supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
    if (status && status !== "all") countQuery = countQuery.eq("status", status)
    const { count: rawCount, error: countError } = await countQuery
    if (countError) {
      console.error("Tickets count error:", countError)
      return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
    }

    let tickets
    try {
      tickets = await listTickets(supabase, profileId, opts)
    } catch (error) {
      console.error("Tickets fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
    }

    const count = rawCount ?? 0
    return NextResponse.json({
      tickets,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    })
  } catch (error) {
    console.error("Tickets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocked = await requireWriteMode()
    if (blocked) return blocked

    const { allowed } = await checkRateLimit(`ticket:${user.id}`, 20, 60 * 60 * 1000)
    if (!allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })

    const profileId = await effectiveProfileId(user.id, supabase)
    const body = await request.json()
    const parsed = ticketCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { subject, priority: ticketPriority, message } = parsed.data

    let ticket
    try {
      ticket = await createTicket(supabase, {
        profile_id: profileId,
        user_id: user.id,
        subject: subject.trim(),
        priority: ticketPriority || "normal",
        status: "open",
      })
    } catch (ticketError) {
      console.error("Ticket creation error:", ticketError)
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
    }

    try {
      await createTicketMessage(supabase, {
        ticket_id: ticket.id,
        profile_id: profileId,
        user_id: user.id,
        is_admin: false,
        message: message.trim(),
      })
    } catch (messageError) {
      // Compensating delete: orphaned tickets with no body confuse the
      // support UI and leave a permanent dead row. Use service client so
      // RLS doesn't block the cleanup if the user-bound client is in a
      // weird state.
      console.error("Ticket message creation error:", messageError)
      try {
        const service = createServiceClient()
        await service.from("support_tickets").delete().eq("id", ticket.id)
      } catch (rollbackErr) {
        console.error("Ticket rollback error:", rollbackErr)
      }
      return NextResponse.json({ error: "Failed to create ticket. Please try again." }, { status: 500 })
    }

    // SOC 2: support-action audit trail. Captures who opened which ticket
    // for forensic correlation with later admin replies.
    const { ip, userAgent } = getRequestMeta(request)
    logAudit({
      user_id: user.id,
      user_email: user.email,
      action: "ticket.created",
      resource_type: "ticket",
      resource_id: ticket.id,
      details: { priority: ticketPriority || "normal" },
      ip_address: ip,
      user_agent: userAgent,
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error("Ticket creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
