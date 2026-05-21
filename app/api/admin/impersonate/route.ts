import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { startImpersonation, stopImpersonation, getActiveImpersonation } from "@/lib/impersonation"
import { isValidUUID } from "@/lib/validations"
import { logAudit, getRequestMeta } from "@/lib/audit-log"
import { hasFreshStepUp, stepUpRequired } from "@/lib/admin/step-up"
import { extractJustification } from "@/lib/admin/justification"

export async function GET() {
  const auth = await verifyAdmin()
  if ("error" in auth) {
    return NextResponse.json({ active: null })
  }
  const active = await getActiveImpersonation()
  if (!active || active.admin_user_id !== auth.user.id) {
    return NextResponse.json({ active: null })
  }
  return NextResponse.json({
    active: {
      target_email: active.target_email,
      mode: active.mode,
      expires_at: active.expires_at,
    },
  })
}

export async function POST(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  const { user, serviceClient, role } = auth

  // Step-up gate: impersonate-start is destructive (creates a session that
  // can mutate another user's data). Require a fresh re-auth cookie that was
  // issued for THIS admin (prevents cookie reuse across admins).
  if (!(await hasFreshStepUp(request, user.id))) {
    const r = stepUpRequired()
    return NextResponse.json(r.body, { status: r.status })
  }

  const body = await request.json().catch(() => null)
  if (!body || !isValidUUID(body.target_user_id)) {
    return NextResponse.json({ error: "target_user_id required" }, { status: 400 })
  }

  // Justification gate: every impersonation must carry a 10-500 char
  // explanation that lands in audit_log.details for the operator to review.
  const justCheck = extractJustification(body)
  if (!justCheck.ok) {
    return NextResponse.json(justCheck.error!.body, { status: justCheck.error!.status })
  }
  const justification = justCheck.justification!

  const requestedMode = body.mode === "write" ? "write" : "read"
  if (requestedMode === "write" && role !== "developer") {
    return NextResponse.json(
      { error: "Write impersonation requires developer role" },
      { status: 403 },
    )
  }

  const { data: targetUser, error: targetErr } =
    await serviceClient.auth.admin.getUserById(body.target_user_id)

  if (targetErr || !targetUser?.user) {
    return NextResponse.json({ error: "Target user not found" }, { status: 404 })
  }

  const session = await startImpersonation({
    adminUserId: user.id,
    adminEmail: user.email ?? "unknown",
    targetUserId: body.target_user_id,
    targetEmail: targetUser.user.email ?? null,
    mode: requestedMode,
  })

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.impersonate.start",
    resource_type: "user",
    resource_id: body.target_user_id,
    details: {
      mode: requestedMode,
      target_email: targetUser.user.email,
      justification,
    },
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({
    session_id: session.session_id,
    target_email: session.target_email,
    mode: session.mode,
    expires_at: session.expires_at,
  })
}

export async function DELETE(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  const { user } = auth

  const stopped = await stopImpersonation()

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.impersonate.stop",
    resource_type: stopped.target_user_id ? "user" : undefined,
    resource_id: stopped.target_user_id ?? undefined,
    details: stopped.mode
      ? { mode: stopped.mode, target_email: stopped.target_email }
      : undefined,
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true })
}
