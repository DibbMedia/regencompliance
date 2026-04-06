import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20
    const status = searchParams.get("status")

    let query = supabase
      .from("support_tickets")
      .select("*", { count: "exact" })
      .eq("profile_id", profileId)
      .order("updated_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: tickets, count, error } = await query

    if (error) {
      console.error("Tickets fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
    }

    return NextResponse.json({
      tickets: tickets || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
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

    const profileId = await effectiveProfileId(user.id, supabase)
    const body = await request.json()
    const { subject, priority, message } = body

    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 })
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const validPriorities = ["low", "normal", "high", "urgent"]
    const ticketPriority = validPriorities.includes(priority) ? priority : "normal"

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        profile_id: profileId,
        user_id: user.id,
        subject: subject.trim(),
        priority: ticketPriority,
        status: "open",
      })
      .select()
      .single()

    if (ticketError || !ticket) {
      console.error("Ticket creation error:", ticketError)
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
    }

    const { error: messageError } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: ticket.id,
        user_id: user.id,
        is_admin: false,
        message: message.trim(),
      })

    if (messageError) {
      console.error("Ticket message creation error:", messageError)
      return NextResponse.json({ error: "Ticket created but failed to add message" }, { status: 500 })
    }

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error("Ticket creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
