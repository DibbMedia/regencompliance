// Thin fire-and-forget wrapper around the encryption-aware audit_log repo.
//
// Historically `logAudit` did a direct `from("audit_log").insert(...)`. Phase
// 5 of the user-level encryption plan moves writes through
// `lib/repos/audit-log.ts` so every column gets envelope-encrypted on the way
// in (per-user DEK when `user_id` is set, system master key otherwise).
//
// Public contract preserved:
//   - `logAudit(entry)` is sync, never throws, never blocks the caller.
//   - `getRequestMeta(request)` returns `{ ip, userAgent }` unchanged.
//
// All existing call-sites compile unchanged. New call-sites that prefer a
// typed/awaitable surface can import `createAuditLogEntry` from the repo
// directly.
import { createServiceClient } from "@/lib/supabase/server"
import { getClientIp } from "@/lib/ip"
import { createAuditLogEntry } from "@/lib/repos/audit-log"

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

// Module-level counter so transient Supabase outages (ECONNRESET / fetch
// failed) don't spam Vercel runtime logs. We log the first failure of the
// process and every 100th thereafter, with the running count attached.
let auditFailureCount = 0

// F-07: cache the service client across calls so undici can keep-alive
// sockets. Each createServiceClient() builds a fresh @supabase/ssr instance
// with its own connection pool; in a multi-page site scan this burst of
// fresh TLS handshakes was the source of the [Audit] fetch-failed /
// ECONNRESET noise. Reusing one client across the function-instance
// lifetime lets the SDK reuse warmed sockets. The client carries no
// per-request state (cookies are stubbed to return []), so it's safe to
// share. Lazily initialized so process.env (already trimmed by
// validateEnv in instrumentation) is set before first use.
let cachedServiceClient: ReturnType<typeof createServiceClient> | null = null
function getAuditServiceClient() {
  if (!cachedServiceClient) cachedServiceClient = createServiceClient()
  return cachedServiceClient
}

/**
 * Log an audit event. Non-blocking - never throws.
 *
 * Routes through the encryption-aware repo so the on-disk row carries
 * `*_enc` envelopes, not plaintext. The repo handles user-DEK vs
 * system-key dispatch by whether `user_id` is present.
 */
export function logAudit(entry: AuditEntry): void {
  try {
    const supabase = getAuditServiceClient()
    void createAuditLogEntry(supabase, {
      user_id: entry.user_id ?? null,
      user_email: entry.user_email ?? null,
      action: entry.action,
      resource_type: entry.resource_type ?? null,
      resource_id: entry.resource_id ?? null,
      details: entry.details ?? {},
      ip_address: entry.ip_address ?? null,
      user_agent: entry.user_agent ?? null,
      status: entry.status ?? "success",
    }).catch((err) => {
      auditFailureCount++
      if (auditFailureCount === 1 || auditFailureCount % 100 === 0) {
        console.warn(
          "[Audit] write failed (total since start: " + auditFailureCount + "): " +
          (err instanceof Error ? err.message : String(err))
        )
      }
    })
  } catch {
    // Never throw from audit logging.
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
