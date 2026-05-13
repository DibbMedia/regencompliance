// Admin audit-log surface.
//
// Paginated read of the audit_log table for admin oversight + SOC 2 evidence
// collection. Filters: action prefix, status, resource_type. The audit_log
// table is service-role-only by RLS (migration 024), so this route is the
// only admin-facing read path.
//
// Post-Phase-5 (migration 040): the plaintext `user_email`, `details`,
// `ip_address`, `user_agent` columns are dropped. Reads go through
// `listAuditLogForAdmin` which decrypts each row under the correct key (user
// DEK or system master key) with the request-scoped derive cache. Admin
// search by email substring is no longer supported (per plan §12.6) - the
// admin pivots to `user_id` lookup via the `find_auth_user_id_by_email`
// RPC (migration 030) before searching the audit log.
import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { z } from "zod"
import { listAuditLogForAdmin } from "@/lib/repos/audit-log"

const filterSchema = z.object({
  page: z.coerce.number().int().positive().max(1000).default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  action: z.string().trim().max(100).optional().default(""),
  user_id: z.string().trim().max(100).optional().default(""),
  status: z.enum(["success", "failure", "error", ""]).optional().default(""),
  resource_type: z.string().trim().max(50).optional().default(""),
})

export async function GET(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  const { serviceClient } = auth

  const { searchParams } = new URL(request.url)
  const parsed = filterSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    action: searchParams.get("action") ?? undefined,
    user_id: searchParams.get("user_id") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    resource_type: searchParams.get("resource_type") ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid filters" },
      { status: 400 },
    )
  }

  const { page, limit, action, user_id, status, resource_type } = parsed.data

  try {
    const events = await listAuditLogForAdmin(serviceClient, {
      // `action` here is a substring filter to preserve the pre-encryption
      // admin UX where typing "auth.login" matched login.success/failed/
      // locked entries. The repo escapes the `%` / `_` wildcards.
      action_substring: action || undefined,
      user_id: user_id || undefined,
      status: status || undefined,
      resource_type: resource_type || undefined,
      limit,
      offset: (page - 1) * limit,
    })

    // Total count for pagination. Plaintext columns are gone, so we count
    // by the same filter set the repo applies. Admin email substring is
    // not in the filter set per plan §12.6.
    let countQuery = serviceClient
      .from("audit_log")
      .select("*", { count: "exact", head: true })
    if (action) {
      const escaped = action.replace(/%/g, "\\%").replace(/_/g, "\\_")
      countQuery = countQuery.ilike("action", `%${escaped}%`)
    }
    if (user_id) countQuery = countQuery.eq("user_id", user_id)
    if (status) countQuery = countQuery.eq("status", status)
    if (resource_type) countQuery = countQuery.eq("resource_type", resource_type)
    const { count } = await countQuery

    return NextResponse.json({
      events,
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    })
  } catch (error) {
    console.error("[admin/audit-log] fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 })
  }
}
