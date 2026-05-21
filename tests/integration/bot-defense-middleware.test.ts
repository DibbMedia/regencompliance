// Bot-defense middleware wiring lock.
//
// This file locks the *integration* between the bot-defense classifier
// (`lib/security/bot-defense.ts`) and the Edge middleware (`proxy.ts`).
// Unit tests for the classifier itself live in
// `tests/lib/security/bot-defense.test.ts`. Here we assert two things:
//
//   1. **Source-level wiring** - that `proxy.ts` imports `classifyRequest`,
//      calls it before any other middleware action, hard-403's on "deny",
//      tarpits "attacker-probe-path" for ~2s, and logs each non-normal
//      verdict via console.warn / console.info.
//
//   2. **End-to-end classification through the real import** - that for a
//      curated set of crafted Request objects, `classifyRequest` returns the
//      verdict + reason the rest of the system expects. If BOT-A ever ships
//      a classifier change that flips one of these well-known signatures,
//      this suite fails before it reaches prod.
//
// Why source-level for the wiring half: `proxy.ts` runs inside the Next.js
// Edge runtime, which we don't have a standalone harness for. The CSP suite
// (csp-headers.test.ts) uses the same approach. Regex-asserting against the
// canonical source string catches the regressions we care about (someone
// reorders the gate behind the auth roundtrip, removes the 403, drops the
// tarpit). Whitespace and comment churn are tolerated.
//
// Robustness coverage: the last block bombards `classifyRequest` with 10
// adversarial payloads (10 KB UA, unicode-soup paths, nested encoded
// payloads, missing headers, weird method strings) and asserts none throw
// and each returns one of the four documented verdicts.

import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { classifyRequest } from "@/lib/security/bot-defense"

const REPO_ROOT = process.cwd()
const PROXY_PATH = join(REPO_ROOT, "proxy.ts")
const PROXY_SRC = readFileSync(PROXY_PATH, "utf8")
const PROXY_LINES = PROXY_SRC.split("\n")

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Build a synthetic Request. We default to a stable host so URL parsing
// doesn't blow up on relative paths, and we let callers omit headers for the
// "missing UA" cases. Method defaults to GET to keep the table compact.
function req(opts: {
  ua?: string | null
  path?: string
  method?: string
  query?: string
  host?: string
}): Request {
  const host = opts.host ?? "example.com"
  const path = opts.path ?? "/"
  const query = opts.query ? (opts.query.startsWith("?") ? opts.query : "?" + opts.query) : ""
  const url = `https://${host}${path}${query}`
  const headers = new Headers()
  // `ua === null` means "explicitly omit the header" (different from "set to
  // empty string"). Tests below cover both shapes.
  if (opts.ua !== undefined && opts.ua !== null) {
    headers.set("user-agent", opts.ua)
  }
  return new Request(url, { method: opts.method ?? "GET", headers })
}

// Return the 1-based line number of the FIRST line in `proxy.ts` that
// matches the supplied regex. Returns -1 if nothing matches (which will
// cause the assertion to fail with a readable message).
function findLine(pattern: RegExp): number {
  for (let i = 0; i < PROXY_LINES.length; i++) {
    if (pattern.test(PROXY_LINES[i])) return i + 1
  }
  return -1
}

// ===========================================================================
// 1. proxy.ts source-level wiring assertions
// ===========================================================================

describe("bot-defense / proxy.ts source-level wiring", () => {
  it("imports classifyRequest from @/lib/security/bot-defense", () => {
    // Tolerate any import-list shape (single named import, multi-line list,
    // surrounding type imports). The canonical line today is:
    //   import { classifyRequest } from "@/lib/security/bot-defense"
    expect(PROXY_SRC).toMatch(
      /import\s+\{[^}]*\bclassifyRequest\b[^}]*\}\s+from\s+["']@\/lib\/security\/bot-defense["']/,
    )
  })

  it("calls classifyRequest(request) inside the proxy function body", () => {
    // We want the call to live *inside* the `proxy` exported function, not
    // at module scope. A simple way to assert that without parsing TS: find
    // the line number of the call, then assert it comes after the
    // `export async function proxy` declaration.
    const callLine = findLine(/\bclassifyRequest\s*\(\s*request\s*\)/)
    const fnDeclLine = findLine(/export\s+async\s+function\s+proxy\s*\(/)
    expect(callLine).toBeGreaterThan(0)
    expect(fnDeclLine).toBeGreaterThan(0)
    expect(callLine).toBeGreaterThan(fnDeclLine)
  })

  it("returns a 403 NextResponse for the deny verdict", () => {
    // Find the deny branch and assert a 403 response lives within a few
    // lines of it. Tolerate both the `if (classification.verdict === "deny")`
    // and switch/case shapes - currently the file uses the `if` form.
    const denyLine = findLine(
      /classification\.verdict\s*===\s*["']deny["']|case\s+["']deny["']/,
    )
    expect(
      denyLine,
      "Could not find a deny-verdict branch in proxy.ts. The bot-defense " +
        "gate may have been removed or refactored beyond what this regex " +
        "recognises.",
    ).toBeGreaterThan(0)
    // Scan a generous window (40 lines) after the deny branch for a 403
    // response. We don't pin to a tighter window because the branch also
    // does counter-bumping and logging before the response.
    const windowEnd = Math.min(PROXY_LINES.length, denyLine + 40)
    const windowText = PROXY_LINES.slice(denyLine - 1, windowEnd).join("\n")
    expect(windowText).toMatch(/NextResponse[\s\S]{0,200}\bstatus\s*:\s*403\b/)
  })

  it("the classifyRequest call is positioned BEFORE buildCsp() and the admin-IP allowlist", () => {
    // STAGE 0 contract: bot defense runs FIRST. If a refactor moves it
    // behind CSP construction or the admin allowlist, downstream cost is
    // paid on every scanner hit. Lock the order.
    const classifyLine = findLine(/\bclassifyRequest\s*\(\s*request\s*\)/)
    const buildCspCallLine = findLine(/\bconst\s+csp\s*=\s*buildCsp\s*\(/)
    const adminAllowlistLine = findLine(/adminIpAllowlist\.isEmpty\s*\(\s*\)\s*&&/)
    expect(classifyLine).toBeGreaterThan(0)
    expect(buildCspCallLine).toBeGreaterThan(0)
    expect(adminAllowlistLine).toBeGreaterThan(0)
    expect(
      classifyLine,
      `classifyRequest at line ${classifyLine} must precede buildCsp() call at line ${buildCspCallLine}`,
    ).toBeLessThan(buildCspCallLine)
    expect(
      classifyLine,
      `classifyRequest at line ${classifyLine} must precede admin-IP allowlist at line ${adminAllowlistLine}`,
    ).toBeLessThan(adminAllowlistLine)
  })

  it("logs the deny verdict via console.warn within a few lines of the deny branch", () => {
    const denyLine = findLine(/classification\.verdict\s*===\s*["']deny["']/)
    expect(denyLine).toBeGreaterThan(0)
    // Scan 30 lines forward from the deny branch for a console.warn /
    // console.error / console.info call. The current code uses warn.
    const windowEnd = Math.min(PROXY_LINES.length, denyLine + 30)
    const windowText = PROXY_LINES.slice(denyLine - 1, windowEnd).join("\n")
    expect(windowText).toMatch(/console\.(warn|info|error)\s*\(/)
  })

  it("logs the rate-limit-strict verdict via console.warn", () => {
    // Same shape as the deny log assertion - the rate-limit branch should
    // emit at least an observability line so ops can see when unknown bots
    // hit the gate. Scan 30 lines forward.
    const rateLimitLine = findLine(
      /classification\.verdict\s*===\s*["']rate-limit-strict["']/,
    )
    expect(rateLimitLine).toBeGreaterThan(0)
    const windowEnd = Math.min(PROXY_LINES.length, rateLimitLine + 30)
    const windowText = PROXY_LINES.slice(rateLimitLine - 1, windowEnd).join("\n")
    expect(windowText).toMatch(/console\.(warn|info|error)\s*\(/)
  })

  it("logs the allow verdict via console.info (first-hit dedup)", () => {
    const allowLine = findLine(
      /classification\.verdict\s*===\s*["']allow["']/,
    )
    expect(allowLine).toBeGreaterThan(0)
    const windowEnd = Math.min(PROXY_LINES.length, allowLine + 30)
    const windowText = PROXY_LINES.slice(allowLine - 1, windowEnd).join("\n")
    // We accept any console method - the spec says "logs each non-normal
    // verdict", not specifically which level.
    expect(windowText).toMatch(/console\.(warn|info|error|log)\s*\(/)
  })
})

// ===========================================================================
// 2. Tarpit assertion for attacker-probe-path
// ===========================================================================

describe("bot-defense / proxy.ts attacker-probe-path tarpit", () => {
  it("contains a ~2 second delay for the attacker-probe-path reason", () => {
    // We tolerate either the setTimeout-in-Promise pattern (current shape)
    // or a bare `setTimeout(..., 2000)` callsite. The duration must be 2000
    // ms (the locked spec) - we don't accept 1000 / 5000 / etc., that would
    // be a silent behavioral change.
    //
    // Locate the `attacker-probe-path` reason guard and scan the 10-line
    // window after it for the delay primitive.
    const reasonLine = findLine(
      /classification\.reason\s*===\s*["']attacker-probe-path["']/,
    )
    expect(
      reasonLine,
      "Could not find the attacker-probe-path reason guard in proxy.ts. " +
        "The tarpit may have been removed.",
    ).toBeGreaterThan(0)
    const windowEnd = Math.min(PROXY_LINES.length, reasonLine + 10)
    const windowText = PROXY_LINES.slice(reasonLine - 1, windowEnd).join("\n")
    // Accept either:
    //   new Promise((r) => setTimeout(r, 2000))
    //   setTimeout(() => ..., 2000)
    //   await sleep(2000)
    const hasPromiseSetTimeout = /new\s+Promise\s*\([^)]*\)\s*=>\s*setTimeout\s*\([^,]+,\s*2000\s*\)/.test(
      windowText,
    )
    const hasBareSetTimeout = /\bsetTimeout\s*\([^,]+,\s*2000\s*\)/.test(windowText)
    const hasSleep2000 = /\bsleep\s*\(\s*2000\s*\)/.test(windowText)
    expect(
      hasPromiseSetTimeout || hasBareSetTimeout || hasSleep2000,
      `Expected a 2000ms delay primitive within 10 lines of the ` +
        `attacker-probe-path reason guard. Window scanned:\n${windowText}`,
    ).toBe(true)
  })
})

// ===========================================================================
// 3. End-to-end classification through the actual import
// ===========================================================================

describe("bot-defense / classifyRequest end-to-end behavior", () => {
  // ---- AI crawler allow ----
  it("GPTBot UA on / returns allow / ai-crawler", () => {
    const r = classifyRequest(req({ ua: "GPTBot", path: "/" }))
    expect(r.verdict).toBe("allow")
    expect(r.reason).toBe("ai-crawler")
    expect(r.matchedSignature).toBe("GPTBot")
  })

  it("Googlebot substring match on /blog/post-x returns allow / ai-crawler", () => {
    const r = classifyRequest(
      req({
        ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        path: "/blog/post-x",
      }),
    )
    expect(r.verdict).toBe("allow")
    expect(r.reason).toBe("ai-crawler")
    expect(r.matchedSignature).toBe("Googlebot")
  })

  // ---- Vuln scanner UA ----
  it("nikto UA returns deny / vuln-scanner-ua", () => {
    const r = classifyRequest(req({ ua: "nikto/2.1.6", path: "/" }))
    expect(r.verdict).toBe("deny")
    expect(r.reason).toBe("vuln-scanner-ua")
    expect(r.matchedSignature).toBe("nikto")
  })

  // ---- Attacker probe paths ----
  it("/.env returns deny / attacker-probe-path", () => {
    const r = classifyRequest(req({ ua: "Mozilla/5.0", path: "/.env" }))
    expect(r.verdict).toBe("deny")
    expect(r.reason).toBe("attacker-probe-path")
  })

  it("/wp-admin returns deny / attacker-probe-path", () => {
    const r = classifyRequest(req({ ua: "Mozilla/5.0", path: "/wp-admin" }))
    expect(r.verdict).toBe("deny")
    expect(r.reason).toBe("attacker-probe-path")
  })

  it("/api/admin/users/123 is OUR admin surface and returns normal", () => {
    // Critical contract: the classifier must NOT confuse our own
    // /api/admin/* with the wp-admin / phpmyadmin probe pattern. If this
    // ever flips to "deny", every authenticated admin operation breaks.
    const r = classifyRequest(
      req({ ua: "Mozilla/5.0", path: "/api/admin/users/123" }),
    )
    expect(r.verdict).toBe("normal")
    expect(r.reason).toBe("no-match")
  })

  // ---- Injection patterns ----
  it("SQLi-style query string returns deny / injection-pattern", () => {
    const r = classifyRequest(
      req({ ua: "Mozilla/5.0", path: "/api/scan", query: "q=' OR 1=1" }),
    )
    expect(r.verdict).toBe("deny")
    expect(r.reason).toBe("injection-pattern")
  })

  // ---- Bad scraper UAs ----
  it("bytespider UA returns deny / bad-scraper-ua", () => {
    const r = classifyRequest(req({ ua: "bytespider", path: "/" }))
    expect(r.verdict).toBe("deny")
    expect(r.reason).toBe("bad-scraper-ua")
  })

  it("Diffbot UA returns deny / bad-scraper-ua", () => {
    const r = classifyRequest(req({ ua: "Diffbot", path: "/" }))
    expect(r.verdict).toBe("deny")
    expect(r.reason).toBe("bad-scraper-ua")
    expect(r.matchedSignature).toBe("Diffbot")
  })

  // ---- Missing UA on POST ----
  it("empty UA on POST /api/waitlist returns deny / missing-ua-on-post", () => {
    const r = classifyRequest(
      req({ ua: "", method: "POST", path: "/api/waitlist" }),
    )
    expect(r.verdict).toBe("deny")
    expect(r.reason).toBe("missing-ua-on-post")
  })

  it("missing UA header on POST /api/waitlist returns deny / missing-ua-on-post", () => {
    // Note: `req({ ua: null })` omits the header entirely (vs. setting it
    // to ""). The classifier should treat both the same on a write method.
    const r = classifyRequest(
      req({ ua: null, method: "POST", path: "/api/waitlist" }),
    )
    expect(r.verdict).toBe("deny")
    expect(r.reason).toBe("missing-ua-on-post")
  })

  it("empty UA on GET / returns normal (empty UA OK on GET)", () => {
    const r = classifyRequest(req({ ua: "", method: "GET", path: "/" }))
    expect(r.verdict).toBe("normal")
    expect(r.reason).toBe("no-match")
  })

  it("curl UA on POST /api/scan returns deny / missing-ua-on-post (CLI tool on write)", () => {
    const r = classifyRequest(
      req({ ua: "curl/8.0", method: "POST", path: "/api/scan" }),
    )
    expect(r.verdict).toBe("deny")
    expect(r.reason).toBe("missing-ua-on-post")
  })

  // ---- Unknown bot heuristic ----
  it("unknown bot UA returns rate-limit-strict / unknown-bot-ua", () => {
    const r = classifyRequest(req({ ua: "MyCustomBot/1.0", path: "/" }))
    expect(r.verdict).toBe("rate-limit-strict")
    expect(r.reason).toBe("unknown-bot-ua")
  })

  // ---- Human Chrome ----
  it("realistic Chrome UA on / returns normal", () => {
    const chromeUa =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    const r = classifyRequest(req({ ua: chromeUa, path: "/" }))
    expect(r.verdict).toBe("normal")
    expect(r.reason).toBe("no-match")
  })
})

// ===========================================================================
// 4. Robustness - malformed / adversarial inputs must not throw
// ===========================================================================

describe("bot-defense / classifyRequest robustness", () => {
  // Acceptable verdicts (for the "must return one of these" assertion below).
  const VALID_VERDICTS = new Set([
    "allow",
    "deny",
    "rate-limit-strict",
    "normal",
  ])

  it("does not throw on a missing UA header", () => {
    // No user-agent set at all - distinct from empty string.
    const r = new Request("https://example.com/", { method: "GET" })
    expect(() => classifyRequest(r)).not.toThrow()
    expect(VALID_VERDICTS.has(classifyRequest(r).verdict)).toBe(true)
  })

  it("does not throw on a path with unicode soup", () => {
    // URL constructor URL-encodes most of this; the classifier sees the
    // encoded form (which is what the real Edge runtime passes). The point
    // is: encoded payloads must NOT throw.
    const path = "/" + encodeURIComponent("\u{1F4A9}\u{1F525}‮​ ")
    const r = new Request(`https://example.com${path}`, {
      method: "GET",
      headers: { "user-agent": "Mozilla/5.0" },
    })
    expect(() => classifyRequest(r)).not.toThrow()
    expect(VALID_VERDICTS.has(classifyRequest(r).verdict)).toBe(true)
  })

  it("does not throw on a 10KB user-agent string", () => {
    const huge = "A".repeat(10240)
    const r = new Request("https://example.com/", {
      method: "GET",
      headers: { "user-agent": huge },
    })
    expect(() => classifyRequest(r)).not.toThrow()
    expect(VALID_VERDICTS.has(classifyRequest(r).verdict)).toBe(true)
  })

  it("does not throw on nested-encoded query payloads", () => {
    // Double + triple URL encoding is a classic WAF-bypass shape. The
    // classifier doesn't decode beyond what URL parses for us; the test
    // here is "does not throw + returns a verdict", not "catches the
    // bypass". The standalone injection patterns cover known shapes.
    const query =
      "q=" + encodeURIComponent(encodeURIComponent("' OR 1=1 -- ")) +
      "&n=" + encodeURIComponent("%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd")
    const r = new Request(`https://example.com/x?${query}`, {
      method: "GET",
      headers: { "user-agent": "Mozilla/5.0" },
    })
    expect(() => classifyRequest(r)).not.toThrow()
    expect(VALID_VERDICTS.has(classifyRequest(r).verdict)).toBe(true)
  })

  it("does not throw on weird method strings", () => {
    // PROPFIND is a real but uncommon WebDAV verb; classifier should treat
    // it like any other write method (deny on missing UA, otherwise pass).
    // The valid HTTP token character set excludes most weird chars; we
    // stick to RFC-7230-valid tokens here to avoid the Request constructor
    // itself throwing before we get to classifyRequest.
    for (const method of ["PROPFIND", "PATCH", "COPY", "M-SEARCH"]) {
      const r = new Request("https://example.com/api/x", {
        method,
        headers: { "user-agent": "Mozilla/5.0" },
      })
      expect(() => classifyRequest(r)).not.toThrow()
      expect(VALID_VERDICTS.has(classifyRequest(r).verdict)).toBe(true)
    }
  })

  it("does not throw on a long pathname full of slashes", () => {
    const path = "/" + "a/".repeat(2000) + "z"
    const r = new Request(`https://example.com${path}`, {
      method: "GET",
      headers: { "user-agent": "Mozilla/5.0" },
    })
    expect(() => classifyRequest(r)).not.toThrow()
    expect(VALID_VERDICTS.has(classifyRequest(r).verdict)).toBe(true)
  })

  it("does not throw on a path containing many %00 null bytes", () => {
    // Null-byte injection is one of the locked patterns; this should
    // classify as deny / injection-pattern and certainly not throw.
    const r = new Request(
      "https://example.com/file%00.txt?x=%00%00%00",
      {
        method: "GET",
        headers: { "user-agent": "Mozilla/5.0" },
      },
    )
    expect(() => classifyRequest(r)).not.toThrow()
    expect(VALID_VERDICTS.has(classifyRequest(r).verdict)).toBe(true)
  })

  it("does not throw on a path with a literal CR/LF (header-injection shape)", () => {
    // The URL constructor URL-encodes %0D / %0A so this is safe to embed.
    const r = new Request(
      "https://example.com/x%0d%0aSet-Cookie:%20evil=1",
      {
        method: "GET",
        headers: { "user-agent": "Mozilla/5.0" },
      },
    )
    expect(() => classifyRequest(r)).not.toThrow()
    expect(VALID_VERDICTS.has(classifyRequest(r).verdict)).toBe(true)
  })

  it("does not throw on a UA composed of high-byte Latin-1 chars", () => {
    // HTTP header values are ByteStrings (Latin-1, codepoints <= 0xFF), so
    // we stay in that range here. Codepoints > 0xFF are rejected by the
    // Headers constructor itself in the real runtime, so the classifier
    // would never see them - the only robustness contract that applies is
    // "high-bit Latin-1 should not throw or wedge the regexes".
    const ua = "ÿéÅª»".repeat(100)
    const r = new Request("https://example.com/", {
      method: "GET",
      headers: { "user-agent": ua },
    })
    expect(() => classifyRequest(r)).not.toThrow()
    expect(VALID_VERDICTS.has(classifyRequest(r).verdict)).toBe(true)
  })

  it("does not throw on an empty-host-style URL (root only)", () => {
    // Smallest legal Request - host required, but root path / no query.
    const r = new Request("https://h.example/")
    expect(() => classifyRequest(r)).not.toThrow()
    const v = classifyRequest(r)
    expect(VALID_VERDICTS.has(v.verdict)).toBe(true)
  })
})
