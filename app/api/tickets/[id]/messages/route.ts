import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { ticketMessageSchema } from "@/lib/validations"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("id, profile_id, status")
      .eq("id", id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.profile_id !== profileId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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

    const { data: newMessage, error: messageError } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: id,
        user_id: user.id,
        is_admin: false,
        message: message.trim(),
      })
      .select()
      .single()

    if (messageError) {
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
