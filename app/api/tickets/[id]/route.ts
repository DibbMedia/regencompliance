import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { isValidUUID } from "@/lib/validations"
import { getTicket } from "@/lib/repos/support-tickets"
import { listTicketMessages } from "@/lib/repos/ticket-messages"

export async function GET(
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

    const profileId = await effectiveProfileId(user.id, supabase)

    let ticket
    try {
      ticket = await getTicket(supabase, profileId, id)
    } catch (error) {
      console.error("Ticket fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 })
    }

    if (!ticket) {
      // Repo already enforces profile_id match; return 404 either way.
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    let messages
    try {
      messages = await listTicketMessages(supabase, profileId, { ticket_id: id })
    } catch (messagesError) {
      console.error("Messages fetch error:", messagesError)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    return NextResponse.json({
      ticket,
      messages,
    })
  } catch (error) {
    console.error("Ticket fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
