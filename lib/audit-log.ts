import { createServiceClient } from "@/lib/supabase/server"
import { getClientIp } from "@/lib/ip"

export interface AuditEntry {
  user_id?: string
  user_email?: string
  action: string
  resource_type?: string
  resource_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  status?: "success" | "failure" | "error"
}

/**
 * Log an audit event. Non-blocking - never throws.
 */
export function logAudit(entry: AuditEntry): void {
  try {
    const supabase = createServiceClient()
    supabase
      .from("audit_log")
      .insert({
        user_id: entry.user_id || null,
        user_email: entry.user_email || null,
        action: entry.action,
        resource_type: entry.resource_type || null,
        resource_id: entry.resource_id || null,
        details: entry.details || {},
        ip_address: entry.ip_address || null,
        user_agent: entry.user_agent || null,
        status: entry.status || "success",
      })
      .then(({ error }) => {
        if (error) console.error("[Audit] Failed to log:", error)
      })
  } catch {
    // Never throw from audit logging
  }
}

/**
 * Extract IP and user-agent from a request.
 */
export function getRequestMeta(request: Request): { ip: string; userAgent: string } {
  return {
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent") || "unknown",
  }
}
