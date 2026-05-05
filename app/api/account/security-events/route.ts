// Customer-facing security activity feed.
//
// Returns the logged-in user's own audit_log entries filtered to actions
// that matter for personal security awareness: login attempts (success +
// failure + lockout), password resets, data exports, and delete attempts.
// Admin actions and system events are not included - customers shouldn't
// see them and the audit_log table is service-role only anyway.
//
// Powers /dashboard/account/security.
import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

const SECURITY_ACTIONS = [
  "auth.login.success",
  "auth.login.failed",
  "auth.login.locked",
  "auth.reset_password.success",
  "auth.reset_password.failed",
  "auth.forgot_password.requested",
  "auth.forgot_password.throttled",
  "account.delete.attempt",
  "account.deleted",
  "data.exported",
]

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // audit_log is service-role-only by RLS; customer reads go through this
  // server route which scopes by the authenticated user's id + email.
  const service = createServiceClient()
  const { data, error } = await service
    .from("audit_log")
    .select("id, action, status, ip_address, user_agent, details, created_at")
    .or(`user_id.eq.${user.id}${user.email ? `,user_email.eq.${user.email.toLowerCase()}` : ""}`)
    .in("action", SECURITY_ACTIONS)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[security-events] fetch error:", error)
    return NextResponse.json({ error: "Failed to load activity" }, { status: 500 })
  }

  return NextResponse.json({ events: data ?? [] })
}
