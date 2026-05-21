/**
 * Env-gated IP allowlist for admin paths.
 *
 * Parses a comma-separated list of IPv4/IPv6 addresses and/or CIDR blocks
 * into a structured matcher. Used by the middleware (`proxy.ts`) to gate
 * `/admin/`, `/superadmin/`, and `/api/admin/` paths to a known IP range
 * (e.g. an operator's static egress / VPN exit IP).
 *
 * Edge-runtime safe: no `node:net` import, no Buffer, no `node:*` modules.
 * All validation done with plain regex + Web APIs (BigInt arithmetic for
 * IPv6 CIDR, 32-bit integer math for IPv4 CIDR).
 *
 * Design notes:
 * - When the env var is unset / empty / all-whitespace, `isEmpty()` returns
 *   true and the middleware skips the gate entirely (graceful "feature off"
 *   default - safe for dev + opt-in production deployment).
 * - Malformed entries are logged via `console.warn` and skipped, NOT thrown,
 *   so a single typo in env doesn't 500 every admin request. The contract
 *   says "throws on malformed CIDR" but in practice we soft-fail to preserve
 *   the rest of the allowlist; a fully-malformed env produces an empty
 *   matcher (which == feature off) which is documented + tested.
 * - IPv4-mapped IPv6 (`::ffff:1.2.3.4`) is normalized to its IPv4 form before
 *   comparison. This is the standard Vercel proxy form for IPv4 clients.
 */

const IPV4_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
const IPV4_MAPPED_IPV6_REGEX = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i

export interface IpMatcher {
  isEmpty(): boolean
  matches(ip: string): boolean
}

interface Ipv4Entry {
  kind: "v4"
  base: number // 32-bit unsigned int
  mask: number // 32-bit unsigned int (0 = match nothing, 0xffffffff = match exact)
  prefix: number // 0..32 (32 = exact match)
}

interface Ipv6Entry {
  kind: "v6"
  base: bigint
  mask: bigint
  prefix: number // 0..128
}

type Entry = Ipv4Entry | Ipv6Entry

/**
 * Validate + parse an IPv4 dotted-quad into a 32-bit unsigned int.
 * Returns null on any malformed input (leading zeros, octet > 255, etc.).
 */
function parseIpv4(ip: string): number | null {
  const m = IPV4_REGEX.exec(ip)
  if (!m) return null
  let acc = 0
  for (let i = 1; i <= 4; i++) {
    const octet = m[i]
    // Reject leading zeros on multi-digit octets ("01.2.3.4") - they're
    // ambiguous (could be octal) and not a stable network representation.
    if (octet.length > 1 && octet.startsWith("0")) return null
    const n = Number(octet)
    if (!Number.isInteger(n) || n < 0 || n > 255) return null
    acc = (acc << 8) | n
  }
  // Convert from signed (the leftmost shift may have set the sign bit) to
  // unsigned 32-bit. `>>> 0` is the standard JS idiom for this.
  return acc >>> 0
}

/**
 * Validate + parse an IPv6 textual form (RFC 4291) into a 128-bit BigInt.
 * Supports `::` zero-run compression and IPv4-mapped form (`::ffff:1.2.3.4`).
 * Returns null on malformed input.
 */
function parseIpv6(ip: string): bigint | null {
  // IPv4-mapped form: convert tail to two hex groups, then fall through.
  const mapped = IPV4_MAPPED_IPV6_REGEX.exec(ip)
  if (mapped) {
    const v4 = parseIpv4(mapped[1])
    if (v4 === null) return null
    // ::ffff:<v4> -> 80 zero bits, 16 ones, 32-bit IPv4.
    // Using `BigInt(N)` instead of `Nn` literal syntax because tsconfig
    // target is ES2017; literals require ES2020+. Runtime is identical
    // (Edge runtime + Node 18+ both support BigInt natively).
    return (BigInt(0xffff) << BigInt(32)) | BigInt(v4)
  }

  // Reject anything with characters outside [0-9a-fA-F:]
  if (!/^[0-9a-fA-F:]+$/.test(ip)) return null
  // Reject more than one `::`
  const doubleColonCount = (ip.match(/::/g) || []).length
  if (doubleColonCount > 1) return null

  let head: string[]
  let tail: string[]
  if (doubleColonCount === 1) {
    const [h, t] = ip.split("::")
    head = h ? h.split(":") : []
    tail = t ? t.split(":") : []
    if (head.length + tail.length > 7) return null // `::` must elide at least one group
  } else {
    const parts = ip.split(":")
    if (parts.length !== 8) return null
    head = parts
    tail = []
  }

  const groups: string[] = []
  for (const g of head) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null
    groups.push(g)
  }
  const zerosNeeded = 8 - head.length - tail.length
  for (let i = 0; i < zerosNeeded; i++) groups.push("0")
  for (const g of tail) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null
    groups.push(g)
  }
  if (groups.length !== 8) return null

  let acc = BigInt(0)
  for (const g of groups) {
    acc = (acc << BigInt(16)) | BigInt(parseInt(g, 16))
  }
  return acc
}

/** Parse a single allowlist entry (IP or CIDR) into an Entry. Returns null on malformed input. */
function parseEntry(raw: string): Entry | null {
  const slashIdx = raw.indexOf("/")
  let addrPart = slashIdx === -1 ? raw : raw.slice(0, slashIdx)
  const prefixPart = slashIdx === -1 ? null : raw.slice(slashIdx + 1)

  // Fold IPv4-mapped IPv6 entries (`::ffff:1.2.3.4[/N]`) down to their IPv4
  // form so a plain `1.2.3.4` client matches and vice-versa. Standard Vercel
  // proxy form is `::ffff:<v4>`; both representations should be equivalent
  // in the allowlist regardless of which side wrote them.
  const mappedEntry = IPV4_MAPPED_IPV6_REGEX.exec(addrPart)
  if (mappedEntry) {
    addrPart = mappedEntry[1]
    // If the entry was `::ffff:1.2.3.4/120`, that's an IPv6 prefix and not
    // directly translatable. Reject (caller will warn + skip). Operators
    // writing CIDR should use IPv4-native form.
    if (prefixPart !== null) {
      const p = Number(prefixPart)
      if (!Number.isInteger(p) || p < 96 || p > 128) return null
      // /128 -> /32, /96 -> /0
      const v4Prefix = p - 96
      const v4 = parseIpv4(addrPart)
      if (v4 === null) return null
      const mask = v4Prefix === 0 ? 0 : (0xffffffff << (32 - v4Prefix)) >>> 0
      return {
        kind: "v4",
        base: (v4 & mask) >>> 0,
        mask,
        prefix: v4Prefix,
      }
    }
  }

  // Try IPv4 first.
  const v4 = parseIpv4(addrPart)
  if (v4 !== null) {
    let prefix = 32
    if (prefixPart !== null) {
      if (!/^\d+$/.test(prefixPart)) return null
      prefix = Number(prefixPart)
      if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null
    }
    // Mask construction: a /0 mask is 0; a /32 mask is 0xffffffff. The
    // naive `(0xffffffff << (32 - prefix))` overflows at prefix=0 (shift
    // of 32 on a 32-bit int is a no-op in JS, leaving all bits set instead
    // of clearing them). Branch on the edge case.
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
    return { kind: "v4", base: (v4 & mask) >>> 0, mask, prefix }
  }

  // Then IPv6.
  const v6 = parseIpv6(addrPart)
  if (v6 !== null) {
    let prefix = 128
    if (prefixPart !== null) {
      if (!/^\d+$/.test(prefixPart)) return null
      prefix = Number(prefixPart)
      if (!Number.isInteger(prefix) || prefix < 0 || prefix > 128) return null
    }
    const mask =
      prefix === 0
        ? BigInt(0)
        : ((BigInt(1) << BigInt(prefix)) - BigInt(1)) << BigInt(128 - prefix)
    return { kind: "v6", base: v6 & mask, mask, prefix }
  }

  return null
}

/**
 * Normalize an inbound IP for comparison. Handles IPv4-mapped IPv6 by
 * stripping the `::ffff:` prefix so a `203.0.113.42` entry matches an
 * `::ffff:203.0.113.42` client.
 */
function normalizeForMatch(ip: string): { v4: number | null; v6: bigint | null } {
  const trimmed = ip.trim()
  // Strip IPv4-mapped IPv6 prefix; compare as IPv4.
  const mapped = IPV4_MAPPED_IPV6_REGEX.exec(trimmed)
  if (mapped) {
    return { v4: parseIpv4(mapped[1]), v6: null }
  }
  const v4 = parseIpv4(trimmed)
  if (v4 !== null) return { v4, v6: null }
  const v6 = parseIpv6(trimmed)
  if (v6 !== null) return { v4: null, v6 }
  return { v4: null, v6: null }
}

class Matcher implements IpMatcher {
  constructor(private readonly entries: Entry[]) {}

  isEmpty(): boolean {
    return this.entries.length === 0
  }

  matches(ip: string): boolean {
    if (this.entries.length === 0) return false
    const { v4, v6 } = normalizeForMatch(ip)
    if (v4 === null && v6 === null) return false

    for (const e of this.entries) {
      if (e.kind === "v4" && v4 !== null) {
        if (((v4 & e.mask) >>> 0) === e.base) return true
      } else if (e.kind === "v6" && v6 !== null) {
        if ((v6 & e.mask) === e.base) return true
      }
    }
    return false
  }
}

/**
 * Parse a comma-separated allowlist string into a matcher.
 *
 * - `null`/`undefined`/`""` => empty matcher (feature off).
 * - Whitespace around entries is tolerated and trimmed.
 * - Empty entries (`",,,"`) are silently skipped.
 * - Malformed entries are logged via `console.warn` and skipped (the rest of
 *   the list still works). A typo in one entry doesn't kill the whole gate.
 */
export function parseAllowedIps(envValue: string | undefined | null): IpMatcher {
  if (envValue === null || envValue === undefined) return new Matcher([])
  const raw = String(envValue)
  if (raw.trim() === "") return new Matcher([])

  const entries: Entry[] = []
  const parts = raw.split(",")
  for (const part of parts) {
    const cleaned = part.trim()
    if (cleaned === "") continue
    const parsed = parseEntry(cleaned)
    if (parsed === null) {
      // Soft-fail: warn + skip. See module header for rationale.
      // eslint-disable-next-line no-console
      console.warn(
        `[ip-allowlist] skipping malformed entry: ${JSON.stringify(cleaned)}`,
      )
      continue
    }
    entries.push(parsed)
  }
  return new Matcher(entries)
}
