// Customer-facing security activity feed.
//
// Returns the logged-in user's own audit_log entries filtered to actions
// that matter for personal security awareness: login attempts (success +
// failure + lockout), password resets, data exports, and delete attempts.
// Admin actions and system events are not included - customers shouldn't
// see them and the audit_log table is service-role only anyway.
//
// Post-Phase-5 (migration 040) the plaintext `user_email`, `details`,
// `ip_address`, `user_agent` columns are gone. The read goes through the
// repo's `listAuditLogForAdmin` (service-role context) scoped by user_id;
// the legacy `or(user_email.eq.<email>)` fallback is dropped - user_id is
// the canonical link and the email column no longer exists.
//
// Powers /dashboard/account/security.
import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { listAuditLogForAdmin } from "@/lib/repos/audit-log"

const SECURITY_ACTIONS = new Set([
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
])

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // audit_log is service-role-only by RLS; customer reads go through this
  // server route which scopes by the authenticated user's id.
  const service = createServiceClient()
  try {
    // Pull a wider window then filter to security actions in-memory. The
    // repo's filter is exact-match on action; we need a multi-action OR so
    // we fetch the last 200 rows for this user and slice down to 50.
    const rows = await listAuditLogForAdmin(service, {
      user_id: user.id,
      limit: 200,
      offset: 0,
    })

    const events = rows
      .filter((r) => SECURITY_ACTIONS.has(r.action))
      .slice(0, 50)
      .map((r) => ({
        id: r.id,
        action: r.action,
        status: r.status,
        ip_address: r.ip_address,
        user_agent: r.user_agent,
        details: r.details,
        created_at: r.created_at,
      }))

    return NextResponse.json({ events })
  } catch (error) {
    console.error("[security-events] fetch error:", error)
    return NextResponse.json({ error: "Failed to load activity" }, { status: 500 })
  }
}
