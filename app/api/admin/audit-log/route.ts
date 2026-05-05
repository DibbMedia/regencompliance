// Admin audit-log surface.
//
// Paginated read of the audit_log table for admin oversight + SOC 2 evidence
// collection. Filters: action prefix, user email substring, status. The
// audit_log table is service-role-only by RLS (migration 024), so this route
// is the only customer-facing or admin-facing read path.
import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { z } from "zod"

const filterSchema = z.object({
  page: z.coerce.number().int().positive().max(1000).default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  action: z.string().trim().max(100).optional().default(""),
  user_email: z.string().trim().toLowerCase().max(200).optional().default(""),
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
    user_email: searchParams.get("user_email") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    resource_type: searchParams.get("resource_type") ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid filters" },
      { status: 400 },
    )
  }

  const { page, limit, action, user_email, status, resource_type } = parsed.data

  let query = serviceClient
    .from("audit_log")
    .select(
      "id, user_id, user_email, action, resource_type, resource_id, details, ip_address, user_agent, status, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (action) {
    // Substring on action so an admin can type "auth.login" and see all
    // login.success/failed/locked entries in one filter.
    const escaped = action.replace(/%/g, "\\%").replace(/_/g, "\\_")
    query = query.ilike("action", `%${escaped}%`)
  }
  if (user_email) {
    const escaped = user_email.replace(/%/g, "\\%").replace(/_/g, "\\_")
    query = query.ilike("user_email", `%${escaped}%`)
  }
  if (status) {
    query = query.eq("status", status)
  }
  if (resource_type) {
    query = query.eq("resource_type", resource_type)
  }

  const { data: events, count, error } = await query

  if (error) {
    console.error("[admin/audit-log] fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 })
  }

  return NextResponse.json({
    events: events ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  })
}
