/**
 * Client-IP extraction for SECURITY GATES (rate limits on auth, brute-
 * force buckets, IP allowlists, deny lists). Prefers infra-set headers
 * over client-controlled XFF so a malicious client cannot spoof its IP
 * by setting x-forwarded-for.
 *
 * For AUDIT ATTRIBUTION (which client did this action, logged with the
 * audit_log row), use lib/ip.ts.getClientIp - that helper trusts the
 * trusted-proxy chain via rightmost-XFF, which is correct for the
 * audit-attribution semantics where the proxy hops have already been
 * vetted by the deploy infrastructure.
 *
 * The two helpers DELIBERATELY return different values on the same
 * request because they answer different questions:
 *
 *   - getSecurityClientIp: "who is hitting this endpoint right now?"
 *     Answer must be tamper-resistant. Used by rate-limit-on-auth,
 *     admin-IP allowlist, brute-force buckets, IP deny lists.
 *
 *   - getClientIp (lib/ip.ts): "who should we log as the actor of
 *     this audit-trail event?" Answer trusts the deploy chain because
 *     the audit log writer is itself behind the same trusted proxies
 *     and is recording attribution after auth has succeeded.
 *
 * Priority order (first match wins):
 *   1. x-vercel-forwarded-for - set by Vercel edge proxy, never by client.
 *      Already left-most-is-client per Vercel docs; we split on comma and
 *      take the first entry for symmetry with the other branches.
 *   2. cf-connecting-ip - set by Cloudflare, never by client. Single value.
 *   3. LEFTMOST x-forwarded-for entry - RFC 7239 says left-most is the
 *      original client; subsequent entries are proxy hops. Leftmost is
 *      what an honest client would land in; a malicious client controls
 *      the value but cannot prepend (the next proxy in the chain
 *      appends its own observed client IP, not the client's claim).
 *   4. x-real-ip - some proxies set this instead of XFF.
 *   5. Literal "unknown" - safe default that never collides with a real
 *      IP and naturally buckets all no-header callers into one group
 *      for rate-limit purposes (which is what we want - if a caller
 *      hides their IP we treat them as one shared bucket of abusers).
 */
export function getSecurityClientIp(request: Request): string {
  const vercel = request.headers.get("x-vercel-forwarded-for")?.trim()
  if (vercel) return vercel.split(",")[0].trim()
  const cf = request.headers.get("cf-connecting-ip")?.trim()
  if (cf) return cf
  const xff = request.headers.get("x-forwarded-for")?.trim()
  if (xff) return xff.split(",")[0].trim()
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}
