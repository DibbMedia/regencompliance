import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { requireWriteMode } from "@/lib/impersonation"
import { isValidUUID } from "@/lib/validations"
import { markNotificationRead } from "@/lib/repos/notifications"

// PATCH /api/notifications/[id]
// Body: { read?: boolean } - defaults to true.
// Bulk mark-read (all unread, or an explicit id list) is at PATCH /api/notifications/read.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid notification id" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocked = await requireWriteMode()
    if (blocked) return blocked

    const profileId = await effectiveProfileId(user.id, supabase)

    const body = await request.json().catch(() => ({}))
    const read = typeof body?.read === "boolean" ? body.read : true

    try {
      const updated = await markNotificationRead(supabase, profileId, id, read)
      return NextResponse.json({ notification: updated })
    } catch (error) {
      console.error("Mark notification read error:", error)
      return NextResponse.json(
        { error: "Failed to mark notification" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Notification PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
