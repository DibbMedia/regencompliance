import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { listTeamMembers } from "@/lib/repos/team-members"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const members = await listTeamMembers(supabase, user.id)
    return NextResponse.json({ members })
  } catch (error) {
    console.error("Team error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
