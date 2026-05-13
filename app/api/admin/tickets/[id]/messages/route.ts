import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { isValidUUID, ticketMessageSchema } from "@/lib/validations"
import {
  listTicketMessagesForAdmin,
  createTicketMessage,
} from "@/lib/repos/ticket-messages"
import { getTicketForAdmin } from "@/lib/repos/support-tickets"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const { id: ticketId } = await params

    if (!isValidUUID(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID format" }, { status: 400 })
    }

    let messages
    try {
      messages = await listTicketMessagesForAdmin(serviceClient, { ticket_id: ticketId })
    } catch (error) {
      const e = error as { code?: string; message?: string }
      console.error("Ticket messages fetch error:", error)
      // Table may not exist
      if (e.code === "42P01" || e.message?.includes("does not exist")) {
        return NextResponse.json({ messages: [] })
      }
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Ticket messages error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient, user } = auth

    const { id: ticketId } = await params

    if (!isValidUUID(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID format" }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Mirror the customer-side schema: 1-5000 chars. Without this cap an
    // admin reply could be arbitrarily large and the customer's ticket
    // fetch would render the whole blob client-side.
    const parsed = ticketMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid message" },
        { status: 400 }
      )
    }

    // Need the ticket's profile_id to bind the encrypted message envelope to
    // the customer's tenant key, not the admin's.
    const ticket = await getTicketForAdmin(serviceClient, ticketId)
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    let newMessage
    try {
      newMessage = await createTicketMessage(serviceClient, {
        ticket_id: ticketId,
        profile_id: ticket.profile_id,
        user_id: user.id,
        is_admin: true,
        message: parsed.data.message.trim(),
      })
    } catch (error) {
      console.error("Ticket reply insert error:", error)
      return NextResponse.json(
        { error: "Failed to send reply" },
        { status: 500 }
      )
    }

    // Update ticket updated_at timestamp
    await serviceClient
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", ticketId)

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Ticket reply error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
