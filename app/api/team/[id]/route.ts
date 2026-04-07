import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isValidUUID } from "@/lib/validations"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid member ID format" }, { status: 400 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify this member belongs to the owner's profile
    const { data: member } = await supabase
      .from("team_members")
      .select("profile_id, user_id")
      .eq("id", id)
      .single()

    if (!member || member.profile_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (member.user_id === user.id) {
      return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 })
    }

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to remove member" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Team delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
