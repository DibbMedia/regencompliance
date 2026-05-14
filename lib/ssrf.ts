import { isIP } from "node:net"

export interface SsrfCheckResult {
  ok: boolean
  reason?: string
  resolvedIps?: string[]
}

function stripBrackets(host: string): string {
  if (host.startsWith("[") && host.endsWith("]")) return host.slice(1, -1)
  return host
}

function isPrivateIPv4(ip: string): boolean {
  if (/^127\./.test(ip)) return true
  if (/^10\./.test(ip)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true
  if (/^192\.168\./.test(ip)) return true
  if (/^169\.254\./.test(ip)) return true
  if (/^0\./.test(ip)) return true
  if (ip === "0.0.0.0") return true
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(ip)) return true
  return false
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  if (lower === "::1") return true
  if (lower === "::") return true
  if (lower.startsWith("fe80:")) return true
  if (/^f[cd][0-9a-f]{2}:/.test(lower)) return true
  if (lower.startsWith("::ffff:")) {
    const tail = lower.slice(7)
    if (isIP(tail) === 4 && isPrivateIPv4(tail)) return true
  }
  return false
}

export function isPrivateIp(ip: string): boolean {
  const kind = isIP(ip)
  if (kind === 4) return isPrivateIPv4(ip)
  if (kind === 6) return isPrivateIPv6(ip)
  return false
}

// Cloud provider + service-mesh metadata endpoints. Most of these resolve to
// 169.254.169.254 (already in the IPv4 link-local blocklist) but an explicit
// hostname check is belt-and-suspenders in case DNS resolution returns an
// unexpected IP (e.g., split-horizon DNS, malicious resolver).
const METADATA_HOSTS: ReadonlySet<string> = new Set([
  "metadata.google.internal",
  "metadata.service.consul",
  "metadata",
])

// https:// is enforced above, so the only valid port is 443 (default) or
// explicitly "443". Block everything else to prevent reaching internal
// services on non-standard ports via a public-IP hostname.
const ALLOWED_PORTS: ReadonlySet<string> = new Set(["", "443"])

export async function assertSafeUrl(url: string): Promise<SsrfCheckResult> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { ok: false, reason: "Invalid URL format" }
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "Only https:// URLs are allowed" }
  }

  if (!ALLOWED_PORTS.has(parsed.port)) {
    return { ok: false, reason: "Only port 443 is allowed" }
  }

  const hostname = stripBrackets(parsed.hostname.toLowerCase())

  if (hostname === "localhost" || hostname === "") {
    return { ok: false, reason: "Localhost is not allowed" }
  }

  if (METADATA_HOSTS.has(hostname)) {
    return { ok: false, reason: "Cloud metadata endpoints are blocked" }
  }

  if (isIP(hostname) && isPrivateIp(hostname)) {
    return { ok: false, reason: "URLs pointing to private networks are not allowed" }
  }

  try {
    const { resolve4, resolve6 } = await import("node:dns/promises")
    const ips: string[] = []
    try { ips.push(...(await resolve4(hostname))) } catch { /* no A */ }
    try { ips.push(...(await resolve6(hostname))) } catch { /* no AAAA */ }

    if (ips.length === 0) {
      return { ok: false, reason: "URL hostname does not resolve" }
    }

    if (ips.some(isPrivateIp)) {
      return { ok: false, reason: "URL resolves to a private network address" }
    }

    return { ok: true, resolvedIps: ips }
  } catch {
    return { ok: false, reason: "DNS resolution failed" }
  }
}
