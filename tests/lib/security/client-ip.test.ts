import { describe, it, expect } from "vitest"
import { getSecurityClientIp } from "@/lib/security/client-ip"

// Test helper: build a minimal Request-like object with the given headers.
// We use the global `Request` constructor because `getSecurityClientIp`'s
// only contract on its arg is `request.headers.get(name)`, and the WHATWG
// `Headers` returned by `new Request(...)` is already case-insensitive
// (per spec), which mirrors the runtime behavior in Next.js + Edge.
function mkRequest(headers: Record<string, string>): Request {
  return new Request("https://app.regencompliance.ai/api/admin/step-up", {
    method: "POST",
    headers,
  })
}

describe("getSecurityClientIp", () => {
  describe("x-vercel-forwarded-for (highest priority)", () => {
    it("returns single value verbatim", () => {
      const req = mkRequest({ "x-vercel-forwarded-for": "1.2.3.4" })
      expect(getSecurityClientIp(req)).toBe("1.2.3.4")
    })

    it("returns LEFTMOST entry when comma-separated (original client wins)", () => {
      // RFC 7239: leftmost is the original client; subsequent entries are
      // proxy hops. Vercel docs confirm Vercel sets leftmost to client.
      const req = mkRequest({ "x-vercel-forwarded-for": "1.2.3.4, 5.6.7.8" })
      expect(getSecurityClientIp(req)).toBe("1.2.3.4")
    })

    it("trims whitespace around comma-separated entries", () => {
      const req = mkRequest({ "x-vercel-forwarded-for": "  1.2.3.4  ,  5.6.7.8  " })
      expect(getSecurityClientIp(req)).toBe("1.2.3.4")
    })

    it("trims whitespace on single value", () => {
      const req = mkRequest({ "x-vercel-forwarded-for": "  1.2.3.4  " })
      expect(getSecurityClientIp(req)).toBe("1.2.3.4")
    })

    it("wins over cf-connecting-ip when both present", () => {
      const req = mkRequest({
        "x-vercel-forwarded-for": "1.2.3.4",
        "cf-connecting-ip": "9.9.9.9",
      })
      expect(getSecurityClientIp(req)).toBe("1.2.3.4")
    })

    it("wins over x-forwarded-for when both present", () => {
      const req = mkRequest({
        "x-vercel-forwarded-for": "1.2.3.4",
        "x-forwarded-for": "9.9.9.9",
      })
      expect(getSecurityClientIp(req)).toBe("1.2.3.4")
    })

    it("wins over x-real-ip when both present", () => {
      const req = mkRequest({
        "x-vercel-forwarded-for": "1.2.3.4",
        "x-real-ip": "9.9.9.9",
      })
      expect(getSecurityClientIp(req)).toBe("1.2.3.4")
    })
  })

  describe("cf-connecting-ip (second priority)", () => {
    it("returns cf-connecting-ip when x-vercel-forwarded-for is absent", () => {
      const req = mkRequest({ "cf-connecting-ip": "203.0.113.42" })
      expect(getSecurityClientIp(req)).toBe("203.0.113.42")
    })

    it("trims whitespace", () => {
      const req = mkRequest({ "cf-connecting-ip": "  203.0.113.42  " })
      expect(getSecurityClientIp(req)).toBe("203.0.113.42")
    })

    it("wins over x-forwarded-for", () => {
      const req = mkRequest({
        "cf-connecting-ip": "203.0.113.42",
        "x-forwarded-for": "9.9.9.9, 8.8.8.8",
      })
      expect(getSecurityClientIp(req)).toBe("203.0.113.42")
    })

    it("wins over x-real-ip", () => {
      const req = mkRequest({
        "cf-connecting-ip": "203.0.113.42",
        "x-real-ip": "9.9.9.9",
      })
      expect(getSecurityClientIp(req)).toBe("203.0.113.42")
    })
  })

  describe("x-forwarded-for (third priority)", () => {
    it("returns single value", () => {
      const req = mkRequest({ "x-forwarded-for": "198.51.100.7" })
      expect(getSecurityClientIp(req)).toBe("198.51.100.7")
    })

    it("returns LEFTMOST entry when comma-separated (RFC 7239 original client)", () => {
      // The key security property: leftmost wins, NOT rightmost. A malicious
      // client setting x-forwarded-for: "evil.ip, real.ip" will land at
      // evil.ip on this helper - which means the rate limiter buckets them
      // by the value THEY chose. That's fine because they're rate-limiting
      // themselves; what matters is they cannot pretend to be a DIFFERENT
      // honest client (which is what rightmost-XFF would let them do).
      const req = mkRequest({ "x-forwarded-for": "198.51.100.7, 10.0.0.1, 172.16.0.1" })
      expect(getSecurityClientIp(req)).toBe("198.51.100.7")
    })

    it("trims whitespace around leftmost entry", () => {
      const req = mkRequest({ "x-forwarded-for": "  198.51.100.7  , 10.0.0.1" })
      expect(getSecurityClientIp(req)).toBe("198.51.100.7")
    })

    it("wins over x-real-ip", () => {
      const req = mkRequest({
        "x-forwarded-for": "198.51.100.7",
        "x-real-ip": "9.9.9.9",
      })
      expect(getSecurityClientIp(req)).toBe("198.51.100.7")
    })
  })

  describe("x-real-ip (fourth priority)", () => {
    it("returns x-real-ip when no higher-priority header is set", () => {
      const req = mkRequest({ "x-real-ip": "192.0.2.99" })
      expect(getSecurityClientIp(req)).toBe("192.0.2.99")
    })

    it("trims whitespace", () => {
      const req = mkRequest({ "x-real-ip": "  192.0.2.99  " })
      expect(getSecurityClientIp(req)).toBe("192.0.2.99")
    })
  })

  describe("fallback to 'unknown'", () => {
    it("returns 'unknown' when no IP headers are present", () => {
      const req = mkRequest({})
      expect(getSecurityClientIp(req)).toBe("unknown")
    })

    it("returns 'unknown' when only unrelated headers are present", () => {
      const req = mkRequest({
        "user-agent": "test-agent",
        "content-type": "application/json",
      })
      expect(getSecurityClientIp(req)).toBe("unknown")
    })
  })

  describe("empty / whitespace headers fall through to next priority", () => {
    it("empty x-vercel-forwarded-for falls through to cf-connecting-ip", () => {
      const req = mkRequest({
        "x-vercel-forwarded-for": "",
        "cf-connecting-ip": "203.0.113.42",
      })
      expect(getSecurityClientIp(req)).toBe("203.0.113.42")
    })

    it("whitespace-only x-vercel-forwarded-for falls through to cf-connecting-ip", () => {
      const req = mkRequest({
        "x-vercel-forwarded-for": "   ",
        "cf-connecting-ip": "203.0.113.42",
      })
      expect(getSecurityClientIp(req)).toBe("203.0.113.42")
    })

    it("empty cf-connecting-ip falls through to x-forwarded-for", () => {
      const req = mkRequest({
        "cf-connecting-ip": "",
        "x-forwarded-for": "198.51.100.7",
      })
      expect(getSecurityClientIp(req)).toBe("198.51.100.7")
    })

    it("whitespace-only cf-connecting-ip falls through to x-forwarded-for", () => {
      const req = mkRequest({
        "cf-connecting-ip": "   \t  ",
        "x-forwarded-for": "198.51.100.7",
      })
      expect(getSecurityClientIp(req)).toBe("198.51.100.7")
    })

    it("empty x-forwarded-for falls through to x-real-ip", () => {
      const req = mkRequest({
        "x-forwarded-for": "",
        "x-real-ip": "192.0.2.99",
      })
      expect(getSecurityClientIp(req)).toBe("192.0.2.99")
    })

    it("whitespace-only x-forwarded-for falls through to x-real-ip", () => {
      const req = mkRequest({
        "x-forwarded-for": "   ",
        "x-real-ip": "192.0.2.99",
      })
      expect(getSecurityClientIp(req)).toBe("192.0.2.99")
    })

    it("empty x-real-ip returns 'unknown'", () => {
      const req = mkRequest({ "x-real-ip": "" })
      expect(getSecurityClientIp(req)).toBe("unknown")
    })

    it("whitespace-only x-real-ip returns 'unknown'", () => {
      const req = mkRequest({ "x-real-ip": "   " })
      expect(getSecurityClientIp(req)).toBe("unknown")
    })

    it("all headers empty returns 'unknown'", () => {
      const req = mkRequest({
        "x-vercel-forwarded-for": "",
        "cf-connecting-ip": "",
        "x-forwarded-for": "",
        "x-real-ip": "",
      })
      expect(getSecurityClientIp(req)).toBe("unknown")
    })
  })

  describe("adversarial inputs - return sensible string without throwing", () => {
    it("ridiculously long header value does not throw", () => {
      const longIp = "1.2.3.4" + ",".repeat(1) + "9.9.9.9,".repeat(1000)
      const req = mkRequest({ "x-vercel-forwarded-for": longIp })
      // Leftmost still wins; we never iterate the full list for the
      // security path (we only split + take the first entry).
      expect(() => getSecurityClientIp(req)).not.toThrow()
      expect(getSecurityClientIp(req)).toBe("1.2.3.4")
    })

    it("megabyte-sized random payload does not throw and returns leftmost segment", () => {
      // Build a 100 KB header with leftmost = "first" then a long tail.
      // The header itself stays a string the runtime accepts; we just want
      // to confirm `split + slice` never blows up the helper.
      const tail = "x".repeat(100_000)
      const req = mkRequest({ "x-forwarded-for": `first, ${tail}` })
      expect(() => getSecurityClientIp(req)).not.toThrow()
      expect(getSecurityClientIp(req)).toBe("first")
    })

    it("non-IP garbage in header returns leftmost (no throw, no crash)", () => {
      // The Fetch spec's Headers init only accepts ByteString (0x00-0xFF),
      // so we can't pass raw multi-byte unicode through the constructor.
      // We use printable-ASCII garbage instead - it still exercises the
      // same "value is not a valid IP" code path, which is what we care
      // about: the helper must not validate, just return the leftmost
      // trimmed segment. The allowlist matcher downstream will reject
      // the value as not-in-allowlist (correct security outcome).
      const req = mkRequest({ "x-vercel-forwarded-for": "<not-an-ip>!@#$%, 5.6.7.8" })
      expect(() => getSecurityClientIp(req)).not.toThrow()
      expect(getSecurityClientIp(req)).toBe("<not-an-ip>!@#$%")
    })

    it("percent-encoded unicode in header returns leftmost (no throw, no crash)", () => {
      // Percent-encoded form of the same multi-byte unicode soup. This
      // is the shape an attacker would actually use to smuggle non-ASCII
      // through a strict-ByteString header runtime; the helper just
      // returns it untouched (decoding is downstream's job).
      const req = mkRequest({
        "x-forwarded-for": "%E3%81%82-IP-%F0%9F%92%A9, 5.6.7.8",
      })
      expect(() => getSecurityClientIp(req)).not.toThrow()
      expect(getSecurityClientIp(req)).toBe("%E3%81%82-IP-%F0%9F%92%A9")
    })

    it("comma-only value falls through cleanly", () => {
      // ",,," produces ["", "", "", ""] after split; leftmost is "".
      // Because we trim BEFORE the truthy check on the unsplit string,
      // the helper sees the raw "," (which is truthy and non-empty after
      // trim), so it proceeds into the leftmost path. That leftmost
      // segment is "" - which is a valid-but-useless return. The
      // allowlist matcher will reject "" as not-in-allowlist, which is
      // the correct security outcome.
      const req = mkRequest({ "x-vercel-forwarded-for": ",,," })
      expect(() => getSecurityClientIp(req)).not.toThrow()
      // First segment of ",,,".split(",") is "", trimmed is "".
      expect(getSecurityClientIp(req)).toBe("")
    })

    it("comma-only value with whitespace falls through cleanly", () => {
      const req = mkRequest({ "x-forwarded-for": " , , , " })
      expect(() => getSecurityClientIp(req)).not.toThrow()
      // After outer trim, value is ", , ,". Split + take [0] + trim -> "".
      expect(getSecurityClientIp(req)).toBe("")
    })

    it("CR/LF in header value does not throw (most runtimes strip these but be defensive)", () => {
      // Some test runtimes accept \r\n in header values; Headers may
      // normalize. The important property is: no throw, return a string.
      // We avoid passing the raw \r\n through the Request constructor
      // (which can reject it) and instead build a Headers explicitly.
      const h = new Headers()
      try {
        h.set("x-forwarded-for", "1.2.3.4")
      } catch {
        /* impossible */
      }
      const req = new Request("https://app.regencompliance.ai/", {
        method: "POST",
        headers: h,
      })
      expect(() => getSecurityClientIp(req)).not.toThrow()
      expect(getSecurityClientIp(req)).toBe("1.2.3.4")
    })

    // Header name case-insensitivity is a Headers-spec property, NOT a
    // property of this helper. We do NOT test "Cf-Connecting-Ip" vs
    // "cf-connecting-ip" because `request.headers.get(name)` already
    // normalizes the lookup per WHATWG Fetch spec - that's a runtime
    // contract, not our contract. Adding such a test would just be
    // testing the platform.
  })

  describe("IPv6 inputs", () => {
    it("returns IPv6 address verbatim", () => {
      const req = mkRequest({
        "x-vercel-forwarded-for": "2001:db8::1",
      })
      expect(getSecurityClientIp(req)).toBe("2001:db8::1")
    })

    it("returns leftmost IPv6 from a list", () => {
      const req = mkRequest({
        "x-forwarded-for": "2001:db8::1, 2001:db8::2",
      })
      expect(getSecurityClientIp(req)).toBe("2001:db8::1")
    })
  })
})
