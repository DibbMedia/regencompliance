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

  const hostname = stripBrackets(parsed.hostname.toLowerCase())

  if (hostname === "localhost" || hostname === "") {
    return { ok: false, reason: "Localhost is not allowed" }
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
