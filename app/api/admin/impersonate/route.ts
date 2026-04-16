import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { startImpersonation, stopImpersonation, getActiveImpersonation } from "@/lib/impersonation"
import { isValidUUID } from "@/lib/validations"
import { logAudit, getRequestMeta } from "@/lib/audit-log"

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

  const body = await request.json().catch(() => null)
  if (!body || !isValidUUID(body.target_user_id)) {
    return NextResponse.json({ error: "target_user_id required" }, { status: 400 })
  }

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
    details: { mode: requestedMode, target_email: targetUser.user.email },
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

  await stopImpersonation()

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.impersonate.stop",
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true })
}
