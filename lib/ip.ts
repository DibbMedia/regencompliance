/**
 * Client-IP extraction for AUDIT ATTRIBUTION. Returns the RIGHTMOST entry
 * in x-forwarded-for, which is correct when the deployment has trusted
 * proxies that prepend their own entries (Vercel + Cloudflare both do
 * this) - the rightmost entry is the IP observed by the last trusted hop
 * before our app, which is what we want to log alongside an audit_log row.
 *
 * For SECURITY GATES (rate-limit-on-auth, IP-allowlist-on-admin, IP
 * deny lists, brute-force buckets), use lib/security/client-ip.ts's
 * getSecurityClientIp instead - that helper prefers infra-set headers
 * (x-vercel-forwarded-for, cf-connecting-ip) and uses LEFTMOST-XFF, which
 * prevents a malicious client from spoofing its IP by setting XFF.
 *
 * The two helpers DELIBERATELY return different values on the same request
 * because they answer different questions. See lib/security/client-ip.ts
 * for the full design note.
 */
export function getClientIp(request: Request): string {
  const vercel = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
  if (vercel) return vercel
  const xff = request.headers.get("x-forwarded-for")
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]
  }
  const real = request.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}
