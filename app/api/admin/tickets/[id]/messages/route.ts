import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const { id: ticketId } = await params

    const { data: messages, error } = await serviceClient
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Ticket messages fetch error:", error)
      // Table may not exist
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json({ messages: [] })
      }
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages: messages || [] })
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
    const body = await request.json()
    const { message } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Insert admin reply
    const { data, error } = await serviceClient
      .from("ticket_messages")
      .insert({
        ticket_id: ticketId,
        user_id: user.id,
        message: message.trim(),
        is_admin: true,
      })
      .select()
      .single()

    if (error) {
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

    return NextResponse.json(data)
  } catch (error) {
    console.error("Ticket reply error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
