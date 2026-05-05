// Revoke every session for the authenticated user OTHER THAN the one
// currently used to call this route. Lets the customer kill any
// device/browser they no longer trust without changing their password.
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAudit, getRequestMeta } from "@/lib/audit-log"

export async function POST(request: Request) {
  const { ip, userAgent } = getRequestMeta(request)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase.auth.signOut({ scope: "others" })
  if (error) {
    console.error("[sign-out-others] supabase error:", error.message)
    return NextResponse.json({ error: "Failed to sign out other sessions." }, { status: 500 })
  }

  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "auth.sessions_revoked",
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true })
}
