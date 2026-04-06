import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: members, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("profile_id", user.id)
      .order("invited_at", { ascending: true })

    if (error) {
      console.error("Team fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
    }

    return NextResponse.json({ members: members || [] })
  } catch (error) {
    console.error("Team error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
