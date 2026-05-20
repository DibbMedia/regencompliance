import { describe, it, expect } from "vitest"
import {
  UTM_COOKIE_NAME,
  parseUtmCookie,
  parseUtmCookieFromRequest,
  parseUtmFromUrl,
  sanitizeUtmValue,
  serializeUtmCookie,
  hasAnyUtm,
} from "@/lib/utm"

describe("UTM_COOKIE_NAME", () => {
  it("is the stable contract value", () => {
    // Routes, tests, and the client tracker all key off this name; if
    // anyone changes it, every consumer must move in the same commit.
    expect(UTM_COOKIE_NAME).toBe("rc_utm")
  })
})

describe("sanitizeUtmValue", () => {
  it("returns null for nullish input", () => {
    expect(sanitizeUtmValue(null)).toBeNull()
    expect(sanitizeUtmValue(undefined)).toBeNull()
  })

  it("returns null for empty / whitespace-only strings", () => {
    expect(sanitizeUtmValue("")).toBeNull()
    expect(sanitizeUtmValue("   ")).toBeNull()
    expect(sanitizeUtmValue("\n\r\t")).toBeNull()
  })

  it("trims surrounding whitespace", () => {
    expect(sanitizeUtmValue("  hello  ")).toBe("hello")
  })

  it("strips CR/LF/TAB to single spaces", () => {
    const out = sanitizeUtmValue("  hello\r\nworld  ")
    // Contract: trimmed, no CR or LF in output.
    expect(out).not.toBeNull()
    expect(out).not.toMatch(/[\r\n]/)
    // Trim happens after strip so leading/trailing whitespace is gone.
    expect(out!.startsWith(" ")).toBe(false)
    expect(out!.endsWith(" ")).toBe(false)
    // Inner separator preserved as a single space.
    expect(out).toContain("hello")
    expect(out).toContain("world")
  })

  it("caps length at 500 characters", () => {
    expect(sanitizeUtmValue("a".repeat(600))).toHaveLength(500)
    expect(sanitizeUtmValue("a".repeat(500))).toHaveLength(500)
    expect(sanitizeUtmValue("a".repeat(499))).toHaveLength(499)
  })

  it("rejects non-string inputs defensively", () => {
    // The signature is string|null|undefined but parseUtmCookie hands
    // unsanitized JSON-decoded values through, so the impl must be
    // defensive against numbers/objects.
    expect(sanitizeUtmValue(123 as unknown as string)).toBeNull()
    expect(sanitizeUtmValue({} as unknown as string)).toBeNull()
  })
})

describe("parseUtmFromUrl", () => {
  it("extracts all utm_* params + landing_path", () => {
    const url = new URL(
      "https://example.com/foo?utm_source=fb&utm_medium=cpc&utm_term=peptides",
    )
    const result = parseUtmFromUrl(url)
    expect(result.utm_source).toBe("fb")
    expect(result.utm_medium).toBe("cpc")
    expect(result.utm_term).toBe("peptides")
    expect(result.utm_campaign).toBeNull()
    expect(result.utm_content).toBeNull()
    expect(result.landing_path).toBe("/foo")
    expect(result.captured_at).toBeTruthy()
    // ISO 8601 timestamp
    expect(result.captured_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    )
  })

  it("returns null utm_* fields when no params present + still populates landing_path", () => {
    const url = new URL("https://example.com/about")
    const result = parseUtmFromUrl(url)
    expect(result.utm_source).toBeNull()
    expect(result.utm_medium).toBeNull()
    expect(result.utm_campaign).toBeNull()
    expect(result.utm_term).toBeNull()
    expect(result.utm_content).toBeNull()
    expect(result.landing_path).toBe("/about")
    expect(result.captured_at).toBeTruthy()
  })

  it("propagates referrer through sanitizeUtmValue", () => {
    const url = new URL("https://example.com/?utm_source=g")
    const result = parseUtmFromUrl(url, "https://google.com/search")
    expect(result.referrer).toBe("https://google.com/search")
  })

  it("nulls out referrer when blank", () => {
    const url = new URL("https://example.com/?utm_source=g")
    expect(parseUtmFromUrl(url, "").referrer).toBeNull()
    expect(parseUtmFromUrl(url, null).referrer).toBeNull()
    expect(parseUtmFromUrl(url, undefined).referrer).toBeNull()
  })

  it("defaults landing_path to / for root paths", () => {
    const url = new URL("https://example.com/?utm_source=g")
    expect(parseUtmFromUrl(url).landing_path).toBe("/")
  })

  it("caps oversized utm values via sanitizeUtmValue", () => {
    const long = "x".repeat(600)
    const url = new URL(`https://example.com/?utm_source=${long}`)
    expect(parseUtmFromUrl(url).utm_source).toHaveLength(500)
  })
})

describe("serializeUtmCookie / parseUtmCookie roundtrip", () => {
  it("roundtrips a basic payload", () => {
    const payload = { utm_source: "google", utm_campaign: "q4" }
    const cookie = serializeUtmCookie(payload)
    const out = parseUtmCookie(cookie)
    expect(out.utm_source).toBe("google")
    expect(out.utm_campaign).toBe("q4")
  })

  it("roundtrips the full payload shape", () => {
    const url = new URL(
      "https://example.com/landing?utm_source=fb&utm_medium=cpc&utm_campaign=q4&utm_term=peptides&utm_content=cta1",
    )
    const payload = parseUtmFromUrl(url, "https://t.co/abc")
    const out = parseUtmCookie(serializeUtmCookie(payload))
    expect(out.utm_source).toBe("fb")
    expect(out.utm_medium).toBe("cpc")
    expect(out.utm_campaign).toBe("q4")
    expect(out.utm_term).toBe("peptides")
    expect(out.utm_content).toBe("cta1")
    expect(out.referrer).toBe("https://t.co/abc")
    expect(out.landing_path).toBe("/landing")
    expect(out.captured_at).toBe(payload.captured_at)
  })

  it("emits a base64url-safe string (no +, /, or =)", () => {
    // base64url uses -, _ instead of +, /, and omits padding. The output
    // must survive cookie + URL contexts.
    const cookie = serializeUtmCookie({
      utm_source: "x",
      utm_campaign: "test",
    })
    expect(cookie).not.toMatch(/[+/=]/)
  })
})

describe("parseUtmCookie defensive behavior", () => {
  it("returns {} for undefined", () => {
    expect(parseUtmCookie(undefined)).toEqual({})
  })

  it("returns {} for null", () => {
    expect(parseUtmCookie(null)).toEqual({})
  })

  it("returns {} for empty string", () => {
    expect(parseUtmCookie("")).toEqual({})
  })

  it("returns {} for not-base64 garbage", () => {
    // The base64url decoder is permissive, but JSON.parse on "not base64"
    // bytes still fails. Either way the catch must produce {}.
    expect(parseUtmCookie("not base64!@#$%")).toEqual({})
  })

  it("returns {} when base64 decodes to non-JSON", () => {
    // "ZWg=" -> "eh" which JSON.parse rejects.
    expect(parseUtmCookie("ZWg=")).toEqual({})
  })

  it("returns {} when JSON parses to a non-object (array, number, string)", () => {
    expect(parseUtmCookie(Buffer.from("[]").toString("base64url"))).toEqual({})
    expect(parseUtmCookie(Buffer.from("42").toString("base64url"))).toEqual({})
    expect(
      parseUtmCookie(Buffer.from('"hello"').toString("base64url")),
    ).toEqual({})
    expect(parseUtmCookie(Buffer.from("null").toString("base64url"))).toEqual(
      {},
    )
  })

  it("strips oversized values from a tampered cookie", () => {
    const tampered = Buffer.from(
      JSON.stringify({ utm_source: "y".repeat(2000) }),
    ).toString("base64url")
    const parsed = parseUtmCookie(tampered)
    expect(parsed.utm_source).toHaveLength(500)
  })

  it("retrieves the source field set by a serialized roundtrip", () => {
    expect(
      parseUtmCookie(serializeUtmCookie({ utm_source: "x" })).utm_source,
    ).toBe("x")
  })
})

describe("hasAnyUtm", () => {
  it("returns false when all utm_* fields are null/missing", () => {
    expect(hasAnyUtm({})).toBe(false)
    expect(hasAnyUtm({ utm_source: null, referrer: "x" })).toBe(false)
    expect(hasAnyUtm({ landing_path: "/foo" })).toBe(false)
  })

  it("returns true when at least one utm_* field is set", () => {
    expect(hasAnyUtm({ utm_source: "g" })).toBe(true)
    expect(hasAnyUtm({ utm_campaign: "q4" })).toBe(true)
    expect(hasAnyUtm({ utm_content: "cta1" })).toBe(true)
  })
})

describe("parseUtmCookieFromRequest", () => {
  function reqWithCookie(cookieHeader?: string): Request {
    const headers = new Headers()
    if (cookieHeader) headers.set("cookie", cookieHeader)
    return new Request("https://example.com/x", { headers })
  }

  it("returns {} when there is no Cookie header", () => {
    expect(parseUtmCookieFromRequest(reqWithCookie())).toEqual({})
  })

  it("returns {} when Cookie header has other cookies but not rc_utm", () => {
    expect(
      parseUtmCookieFromRequest(reqWithCookie("session=abc; theme=dark")),
    ).toEqual({})
  })

  it("parses rc_utm when it's the only cookie", () => {
    const cookie = `${UTM_COOKIE_NAME}=${serializeUtmCookie({ utm_source: "google", utm_medium: "cpc" })}`
    const parsed = parseUtmCookieFromRequest(reqWithCookie(cookie))
    expect(parsed.utm_source).toBe("google")
    expect(parsed.utm_medium).toBe("cpc")
  })

  it("parses rc_utm when it's surrounded by other cookies", () => {
    const value = serializeUtmCookie({ utm_campaign: "q4" })
    const cookie = `session=xyz; ${UTM_COOKIE_NAME}=${value}; theme=light`
    const parsed = parseUtmCookieFromRequest(reqWithCookie(cookie))
    expect(parsed.utm_campaign).toBe("q4")
  })

  it("returns {} when rc_utm value is malformed", () => {
    expect(
      parseUtmCookieFromRequest(
        reqWithCookie(`${UTM_COOKIE_NAME}=not-base64!@#`),
      ),
    ).toEqual({})
  })
})
