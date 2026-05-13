import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { requireWriteMode } from "@/lib/impersonation"
import { ticketMessageSchema, isValidUUID } from "@/lib/validations"
import { getTicket } from "@/lib/repos/support-tickets"
import { createTicketMessage } from "@/lib/repos/ticket-messages"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid ticket ID format" }, { status: 400 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocked = await requireWriteMode()
    if (blocked) return blocked

    const profileId = await effectiveProfileId(user.id, supabase)

    let ticket
    try {
      ticket = await getTicket(supabase, profileId, id)
    } catch (ticketError) {
      console.error("Ticket lookup error:", ticketError)
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.status === "closed") {
      return NextResponse.json({ error: "Cannot reply to a closed ticket" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = ticketMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { message } = parsed.data

    let newMessage
    try {
      newMessage = await createTicketMessage(supabase, {
        ticket_id: id,
        profile_id: profileId,
        user_id: user.id,
        is_admin: false,
        message: message.trim(),
      })
    } catch (messageError) {
      console.error("Message creation error:", messageError)
      return NextResponse.json({ error: "Failed to add message" }, { status: 500 })
    }

    // Update ticket's updated_at timestamp
    await supabase
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id)

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    console.error("Message creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
