import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { isValidUUID } from "@/lib/validations"

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

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.profile_id !== profileId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: messages, error: messagesError } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("Messages fetch error:", messagesError)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    return NextResponse.json({
      ticket,
      messages: messages || [],
    })
  } catch (error) {
    console.error("Ticket fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
