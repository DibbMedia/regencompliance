import { NextResponse } from "next/server"
import { verifyDeveloperAdmin } from "@/lib/admin"
import { isValidUUID } from "@/lib/validations"
import { logAudit, getRequestMeta } from "@/lib/audit-log"
import { updateProfile, type ProfileWrite } from "@/lib/repos/profiles"
import { hasFreshStepUp, stepUpRequired } from "@/lib/admin/step-up"
import { extractJustification } from "@/lib/admin/justification"

const ALLOWED_STATUSES = ["active", "inactive", "past_due", "cancelled"] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyDeveloperAdmin()
  if ("error" in auth) return auth.error
  const { user, serviceClient } = auth

  // Step-up gate: PATCH modifies billing/subscription state
  // (subscription_status, is_beta_subscriber) — same threat surface as DELETE.
  // Require a fresh re-auth cookie that was issued for THIS admin, regardless
  // of how recent the normal session is.
  if (!(await hasFreshStepUp(request, user.id))) {
    const r = stepUpRequired()
    return NextResponse.json(r.body, { status: r.status })
  }

  const { id } = await params
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  // Justification gate. The admin UI sends `{ justification, ...updates }` as
  // JSON. Missing/short/long justification fails closed with the standard 400
  // before any DB mutation runs.
  const justCheck = extractJustification(body)
  if (!justCheck.ok) {
    return NextResponse.json(justCheck.error!.body, { status: justCheck.error!.status })
  }
  const justification = justCheck.justification!

  // Route through the profiles repo so the (unrelated) crypto columns stay
  // intact even though this endpoint only touches plaintext pass-through
  // fields (subscription_status, is_beta_subscriber).
  const updates: ProfileWrite = {}
  if (body.subscription_status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.subscription_status)) {
      return NextResponse.json({ error: "Invalid subscription_status" }, { status: 400 })
    }
    updates.subscription_status = body.subscription_status
  }
  if (body.is_beta_subscriber !== undefined) {
    updates.is_beta_subscriber = !!body.is_beta_subscriber
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 })
  }

  try {
    await updateProfile(serviceClient, id, updates)
  } catch (error) {
    console.error("[admin/users PATCH] database error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }

  const { ip, userAgent } = getRequestMeta(request)
  // Audit-log entry captures intent (justification) + scope (which fields
  // were touched), NOT the values. subscription_status is not PII but we
  // hold the line principled-ly so future PATCH-able fields don't bleed
  // into the audit log.
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.user.update",
    resource_type: "user",
    resource_id: id,
    details: {
      target_user_id: id,
      justification,
      patched_fields: Object.keys(updates),
    },
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true, updates })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyDeveloperAdmin()
  if ("error" in auth) return auth.error
  const { user, serviceClient } = auth

  // Step-up gate: deletion is the most destructive admin op. Require a
  // fresh re-auth cookie that was issued for THIS admin (prevents cookie
  // reuse across admins), regardless of how recent the normal session is.
  if (!(await hasFreshStepUp(request, user.id))) {
    const r = stepUpRequired()
    return NextResponse.json(r.body, { status: r.status })
  }

  const { id } = await params
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
  }

  // Justification gate. DELETE traditionally carries no body, but Next.js
  // permits one and the admin UI sends `{ justification }` as JSON. If the
  // body is missing or unparseable we fail closed with the standard 400.
  const body = await request.json().catch(() => null)
  const justCheck = extractJustification(body)
  if (!justCheck.ok) {
    return NextResponse.json(justCheck.error!.body, { status: justCheck.error!.status })
  }
  const justification = justCheck.justification!

  const { error } = await serviceClient.auth.admin.deleteUser(id)
  if (error) {
    console.error("[admin/users DELETE] auth error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.user.delete",
    resource_type: "user",
    resource_id: id,
    details: { target_user_id: id, justification },
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true })
}
