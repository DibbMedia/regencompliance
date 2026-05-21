import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  parseAllowedIps,
  validateAllowedIpsString,
} from "@/lib/security/ip-allowlist"

describe("parseAllowedIps", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  describe("empty input handling", () => {
    it("returns isEmpty()=true for empty string", () => {
      const m = parseAllowedIps("")
      expect(m.isEmpty()).toBe(true)
      expect(m.matches("203.0.113.42")).toBe(false)
    })

    it("returns isEmpty()=true for null", () => {
      const m = parseAllowedIps(null)
      expect(m.isEmpty()).toBe(true)
    })

    it("returns isEmpty()=true for undefined", () => {
      const m = parseAllowedIps(undefined)
      expect(m.isEmpty()).toBe(true)
    })

    it("returns isEmpty()=true for whitespace-only string", () => {
      const m = parseAllowedIps("   \t  \n  ")
      expect(m.isEmpty()).toBe(true)
    })

    it("returns isEmpty()=true for all-empty comma list", () => {
      const m = parseAllowedIps("  , , ,   ")
      expect(m.isEmpty()).toBe(true)
    })
  })

  describe("exact IPv4 matching", () => {
    it("matches the exact IP and only the exact IP", () => {
      const m = parseAllowedIps("203.0.113.42")
      expect(m.isEmpty()).toBe(false)
      expect(m.matches("203.0.113.42")).toBe(true)
      expect(m.matches("203.0.113.43")).toBe(false)
      expect(m.matches("203.0.113.41")).toBe(false)
      expect(m.matches("203.0.114.42")).toBe(false)
    })

    it("tolerates whitespace around entries", () => {
      const m = parseAllowedIps("   203.0.113.42   ")
      expect(m.matches("203.0.113.42")).toBe(true)
    })

    it("tolerates whitespace inside multi-entry list", () => {
      const m = parseAllowedIps(" 203.0.113.42 , 198.51.100.1 ")
      expect(m.matches("203.0.113.42")).toBe(true)
      expect(m.matches("198.51.100.1")).toBe(true)
      expect(m.matches("203.0.113.43")).toBe(false)
    })
  })

  describe("IPv4 CIDR matching", () => {
    it("matches all IPs in a /24 block", () => {
      const m = parseAllowedIps("203.0.113.0/24")
      expect(m.matches("203.0.113.0")).toBe(true)
      expect(m.matches("203.0.113.1")).toBe(true)
      expect(m.matches("203.0.113.42")).toBe(true)
      expect(m.matches("203.0.113.255")).toBe(true)
      expect(m.matches("203.0.114.0")).toBe(false)
      expect(m.matches("203.0.112.255")).toBe(false)
    })

    it("handles /32 as exact match", () => {
      const m = parseAllowedIps("203.0.113.42/32")
      expect(m.matches("203.0.113.42")).toBe(true)
      expect(m.matches("203.0.113.43")).toBe(false)
    })

    it("handles /0 as match-everything", () => {
      const m = parseAllowedIps("0.0.0.0/0")
      expect(m.isEmpty()).toBe(false)
      expect(m.matches("203.0.113.42")).toBe(true)
      expect(m.matches("8.8.8.8")).toBe(true)
      expect(m.matches("1.2.3.4")).toBe(true)
    })

    it("normalizes the base by masking off host bits", () => {
      // 203.0.113.42/24 is equivalent to 203.0.113.0/24
      const m = parseAllowedIps("203.0.113.42/24")
      expect(m.matches("203.0.113.0")).toBe(true)
      expect(m.matches("203.0.113.255")).toBe(true)
      expect(m.matches("203.0.114.0")).toBe(false)
    })
  })

  describe("exact IPv6 matching", () => {
    it("matches the exact IPv6 address", () => {
      const m = parseAllowedIps("2001:db8::1")
      expect(m.matches("2001:db8::1")).toBe(true)
      expect(m.matches("2001:db8::2")).toBe(false)
    })

    it("normalizes equivalent IPv6 representations", () => {
      const m = parseAllowedIps("2001:db8::1")
      // Same address, different textual form (no `::` compression)
      expect(m.matches("2001:0db8:0000:0000:0000:0000:0000:0001")).toBe(true)
    })

    it("is case-insensitive on hex digits", () => {
      const m = parseAllowedIps("2001:DB8::ABCD")
      expect(m.matches("2001:db8::abcd")).toBe(true)
      expect(m.matches("2001:Db8::AbCd")).toBe(true)
    })
  })

  describe("IPv6 CIDR matching", () => {
    it("matches IPs inside a /32 IPv6 block", () => {
      const m = parseAllowedIps("2001:db8::/32")
      expect(m.matches("2001:db8::1")).toBe(true)
      expect(m.matches("2001:db8:abcd::1")).toBe(true)
      expect(m.matches("2001:db8:ffff:ffff:ffff:ffff:ffff:ffff")).toBe(true)
      expect(m.matches("2001:db9::1")).toBe(false)
      expect(m.matches("2001:db7::1")).toBe(false)
    })

    it("handles /128 as exact match", () => {
      const m = parseAllowedIps("2001:db8::1/128")
      expect(m.matches("2001:db8::1")).toBe(true)
      expect(m.matches("2001:db8::2")).toBe(false)
    })

    it("handles /0 as match-everything", () => {
      const m = parseAllowedIps("::/0")
      expect(m.matches("2001:db8::1")).toBe(true)
      expect(m.matches("fe80::1")).toBe(true)
    })
  })

  describe("mixed allowlist", () => {
    it("matches across multiple entry types", () => {
      const m = parseAllowedIps(
        "203.0.113.42, 198.51.100.0/24, 2001:db8::/32",
      )
      expect(m.matches("203.0.113.42")).toBe(true)
      expect(m.matches("198.51.100.5")).toBe(true)
      expect(m.matches("198.51.100.255")).toBe(true)
      expect(m.matches("2001:db8::abcd")).toBe(true)
      expect(m.matches("203.0.113.43")).toBe(false)
      expect(m.matches("198.51.101.1")).toBe(false)
      expect(m.matches("2001:db9::1")).toBe(false)
    })
  })

  describe("IPv4-mapped IPv6 (::ffff:1.2.3.4) - standard Vercel proxy form", () => {
    it("matches against a plain IPv4 allowlist entry", () => {
      const m = parseAllowedIps("203.0.113.42")
      expect(m.matches("::ffff:203.0.113.42")).toBe(true)
      expect(m.matches("::FFFF:203.0.113.42")).toBe(true)
      expect(m.matches("::ffff:203.0.113.43")).toBe(false)
    })

    it("matches against an IPv4 CIDR entry", () => {
      const m = parseAllowedIps("203.0.113.0/24")
      expect(m.matches("::ffff:203.0.113.42")).toBe(true)
      expect(m.matches("::ffff:203.0.113.255")).toBe(true)
      expect(m.matches("::ffff:203.0.114.0")).toBe(false)
    })

    it("accepts an IPv4-mapped entry in the allowlist itself", () => {
      const m = parseAllowedIps("::ffff:203.0.113.42")
      expect(m.matches("203.0.113.42")).toBe(true)
      expect(m.matches("::ffff:203.0.113.42")).toBe(true)
    })
  })

  describe("malformed input handling", () => {
    it("skips a malformed CIDR prefix (>32 for IPv4) and warns", () => {
      const m = parseAllowedIps("203.0.113.0/33")
      expect(m.isEmpty()).toBe(true)
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("malformed entry"),
      )
    })

    it("skips a malformed CIDR prefix (>128 for IPv6) and warns", () => {
      const m = parseAllowedIps("2001:db8::/129")
      expect(m.isEmpty()).toBe(true)
      expect(warnSpy).toHaveBeenCalled()
    })

    it("skips a negative CIDR prefix", () => {
      const m = parseAllowedIps("203.0.113.0/-1")
      expect(m.isEmpty()).toBe(true)
    })

    it("skips an out-of-range IPv4 octet", () => {
      const m = parseAllowedIps("203.0.113.256")
      expect(m.isEmpty()).toBe(true)
      expect(warnSpy).toHaveBeenCalled()
    })

    it("skips garbage text", () => {
      const m = parseAllowedIps("not-an-ip-at-all")
      expect(m.isEmpty()).toBe(true)
    })

    it("preserves valid entries when one is malformed", () => {
      const m = parseAllowedIps("203.0.113.42, garbage, 198.51.100.1")
      expect(m.isEmpty()).toBe(false)
      expect(m.matches("203.0.113.42")).toBe(true)
      expect(m.matches("198.51.100.1")).toBe(true)
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("garbage"),
      )
    })

    it("rejects IPv4 with leading zeros (ambiguous octal-style)", () => {
      const m = parseAllowedIps("203.0.113.042")
      expect(m.isEmpty()).toBe(true)
    })

    it("rejects non-numeric CIDR prefix", () => {
      const m = parseAllowedIps("203.0.113.0/abc")
      expect(m.isEmpty()).toBe(true)
    })
  })

  describe("isEmpty() semantics for middleware", () => {
    it("a matcher built from valid entries is not empty", () => {
      const m = parseAllowedIps("203.0.113.42")
      expect(m.isEmpty()).toBe(false)
    })

    it("matches() always returns false on an empty matcher", () => {
      const m = parseAllowedIps("")
      expect(m.matches("203.0.113.42")).toBe(false)
      expect(m.matches("2001:db8::1")).toBe(false)
      expect(m.matches("::ffff:203.0.113.42")).toBe(false)
    })

    it("matches() returns false for an unparseable IP even with a populated allowlist", () => {
      const m = parseAllowedIps("203.0.113.42")
      expect(m.matches("not-an-ip")).toBe(false)
      expect(m.matches("")).toBe(false)
      expect(m.matches("unknown")).toBe(false)
    })
  })
})

describe("validateAllowedIpsString (boot-time validator)", () => {
  describe("valid input", () => {
    it("accepts a single IPv4 address", () => {
      expect(validateAllowedIpsString("203.0.113.42")).toEqual({ ok: true })
    })

    it("accepts a single IPv4 CIDR block", () => {
      expect(validateAllowedIpsString("203.0.113.0/24")).toEqual({ ok: true })
    })

    it("accepts a single IPv6 address", () => {
      expect(validateAllowedIpsString("2001:db8::1")).toEqual({ ok: true })
    })

    it("accepts a single IPv6 CIDR block", () => {
      expect(validateAllowedIpsString("2001:db8::/32")).toEqual({ ok: true })
    })

    it("accepts a mixed comma-separated list", () => {
      expect(
        validateAllowedIpsString("203.0.113.42, 198.51.100.0/24"),
      ).toEqual({ ok: true })
    })

    it("accepts a mixed v4 + v6 list", () => {
      expect(
        validateAllowedIpsString("203.0.113.42, 2001:db8::/32, 198.51.100.0/24"),
      ).toEqual({ ok: true })
    })

    it("tolerates whitespace around entries", () => {
      expect(
        validateAllowedIpsString("  203.0.113.42 , 198.51.100.0/24  "),
      ).toEqual({ ok: true })
    })

    it("accepts /0 and /32 as valid IPv4 prefixes", () => {
      expect(validateAllowedIpsString("0.0.0.0/0")).toEqual({ ok: true })
      expect(validateAllowedIpsString("203.0.113.42/32")).toEqual({ ok: true })
    })

    it("accepts /0 and /128 as valid IPv6 prefixes", () => {
      expect(validateAllowedIpsString("::/0")).toEqual({ ok: true })
      expect(validateAllowedIpsString("2001:db8::1/128")).toEqual({ ok: true })
    })
  })

  describe("empty / whitespace input (feature off)", () => {
    it("returns ok for empty string", () => {
      expect(validateAllowedIpsString("")).toEqual({ ok: true })
    })

    it("returns ok for whitespace-only string", () => {
      expect(validateAllowedIpsString("   \t \n  ")).toEqual({ ok: true })
    })

    it("returns ok for all-empty comma list", () => {
      expect(validateAllowedIpsString(" , , ")).toEqual({ ok: true })
    })

    it("returns ok when entries are all whitespace-only", () => {
      expect(validateAllowedIpsString("   ,   ,   ")).toEqual({ ok: true })
    })

    it("returns ok when comma list has trailing/leading commas around valid entries", () => {
      expect(validateAllowedIpsString(", 203.0.113.42 ,")).toEqual({ ok: true })
    })
  })

  describe("invalid input - returns structured errors", () => {
    it("rejects an out-of-range IPv4 octet", () => {
      const result = validateAllowedIpsString("203.0.113.300")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toContain("203.0.113.300")
      }
    })

    it("rejects an IPv4 CIDR with prefix > 32", () => {
      const result = validateAllowedIpsString("203.0.113.0/33")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toContain("203.0.113.0/33")
      }
    })

    it("rejects an IPv6 CIDR with prefix > 128", () => {
      const result = validateAllowedIpsString("2001:db8::/129")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toContain("2001:db8::/129")
      }
    })

    it("rejects malformed IPv6 with non-hex characters", () => {
      const result = validateAllowedIpsString("gg::1")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toContain("gg::1")
      }
    })

    it("rejects garbage text as an entry name", () => {
      const result = validateAllowedIpsString("203.0.113.42, bad-entry")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toContain("bad-entry")
        // Valid entry should NOT be in errors
        expect(result.errors).not.toContain("203.0.113.42")
      }
    })

    it("accumulates multiple errors from a single string", () => {
      const result = validateAllowedIpsString(
        "203.0.113.300, gg::1, 198.51.100.0/40",
      )
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toHaveLength(3)
        expect(result.errors).toContain("203.0.113.300")
        expect(result.errors).toContain("gg::1")
        expect(result.errors).toContain("198.51.100.0/40")
      }
    })

    it("preserves valid entries while reporting only the invalid one", () => {
      const result = validateAllowedIpsString(
        "203.0.113.42, garbage, 198.51.100.1",
      )
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toEqual(["garbage"])
      }
    })

    it("rejects negative CIDR prefix", () => {
      const result = validateAllowedIpsString("203.0.113.0/-1")
      expect(result.ok).toBe(false)
    })

    it("rejects non-numeric CIDR prefix", () => {
      const result = validateAllowedIpsString("203.0.113.0/abc")
      expect(result.ok).toBe(false)
    })

    it("rejects IPv4 with leading zeros (ambiguous octal)", () => {
      const result = validateAllowedIpsString("203.0.113.042")
      expect(result.ok).toBe(false)
    })
  })

  describe("interaction with parseAllowedIps (defense in depth)", () => {
    it("validator rejects what parseAllowedIps would silently skip", () => {
      // Same bad input: validator fails at boot, parser soft-fails at runtime.
      const bad = "203.0.113.0/33"
      const validation = validateAllowedIpsString(bad)
      expect(validation.ok).toBe(false)

      // parseAllowedIps still produces an empty matcher (feature off) for the
      // same input. This is the documented defense-in-depth contract.
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
      try {
        const matcher = parseAllowedIps(bad)
        expect(matcher.isEmpty()).toBe(true)
      } finally {
        warnSpy.mockRestore()
      }
    })
  })
})
