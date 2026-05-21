import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  STEP_UP_COOKIE,
  STEP_UP_TTL_SECONDS,
  hasFreshStepUp,
  signStepUpCookie,
  stepUpRequired,
} from "@/lib/admin/step-up"

// Tests pin a fixed secret so HMAC output is deterministic across runs.
// The fallback path (ENCRYPTION_KEY_V1.slice(0, 32)) is exercised in the
// last describe block below.
const FIXED_SECRET = "test-step-up-secret-fixed-for-vitest"
const USER_A = "11111111-1111-4111-8111-111111111111"
const USER_B = "22222222-2222-4222-8222-222222222222"

function reqWithCookie(cookieValue: string | null): Request {
  const headers: Record<string, string> = {}
  if (cookieValue !== null) {
    headers.cookie = `${STEP_UP_COOKIE}=${cookieValue}`
  }
  return new Request("http://localhost/api/admin/impersonate", {
    method: "POST",
    headers,
  })
}

function reqWithRawCookieHeader(header: string): Request {
  return new Request("http://localhost/api/admin/impersonate", {
    method: "POST",
    headers: { cookie: header },
  })
}

describe("hasFreshStepUp / signStepUpCookie", () => {
  beforeEach(() => {
    process.env.ADMIN_STEP_UP_SECRET = FIXED_SECRET
    delete process.env.ENCRYPTION_KEY_V1
  })

  it("returns false when no cookie is present", async () => {
    expect(await hasFreshStepUp(reqWithCookie(null), USER_A)).toBe(false)
  })

  it("returns false when the cookie value is empty", async () => {
    expect(await hasFreshStepUp(reqWithCookie(""), USER_A)).toBe(false)
  })

  it("returns false when the cookie is not valid base64url", async () => {
    expect(await hasFreshStepUp(reqWithCookie("!!! not base64 !!!"), USER_A)).toBe(
      false,
    )
  })

  it("returns false when the cookie decodes but has wrong shape", async () => {
    // base64url("hello.world") has only 2 dot-separated parts after decode
    const bad = Buffer.from("hello.world").toString("base64").replace(/=+$/, "")
    expect(await hasFreshStepUp(reqWithCookie(bad), USER_A)).toBe(false)
  })

  it("returns false when the signature is forged", async () => {
    const ts = Date.now()
    const forged = Buffer.from(`${USER_A}.${ts}.totally-fake-sig`)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
    expect(await hasFreshStepUp(reqWithCookie(forged), USER_A)).toBe(false)
  })

  it("returns false when the timestamp is in the future", async () => {
    // sign a cookie, then poke a future timestamp into it - re-signing isn't
    // possible without knowing the secret derivation, so we verify our
    // bound check by signing then advancing system time BACKWARDS so the
    // existing valid cookie reads as future.
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    const { value } = signStepUpCookie(USER_A)
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"))
    expect(await hasFreshStepUp(reqWithCookie(value), USER_A)).toBe(false)
    vi.useRealTimers()
  })

  it("returns false when the cookie is older than STEP_UP_TTL_SECONDS", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    const { value } = signStepUpCookie(USER_A)

    // 1 ms past the TTL window
    vi.advanceTimersByTime(STEP_UP_TTL_SECONDS * 1000 + 1)
    expect(await hasFreshStepUp(reqWithCookie(value), USER_A)).toBe(false)
    vi.useRealTimers()
  })

  it("returns true for a freshly minted cookie", async () => {
    const { value, maxAge } = signStepUpCookie(USER_A)
    expect(maxAge).toBe(STEP_UP_TTL_SECONDS)
    expect(await hasFreshStepUp(reqWithCookie(value), USER_A)).toBe(true)
  })

  it("returns true at the edge of the TTL window (just inside)", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    const { value } = signStepUpCookie(USER_A)

    // 1 ms before TTL expires
    vi.advanceTimersByTime(STEP_UP_TTL_SECONDS * 1000 - 1)
    expect(await hasFreshStepUp(reqWithCookie(value), USER_A)).toBe(true)
    vi.useRealTimers()
  })

  it("roundtrips with different users (no cross-user leak)", async () => {
    const a = signStepUpCookie(USER_A)
    const b = signStepUpCookie(USER_B)
    expect(a.value).not.toBe(b.value)
    expect(await hasFreshStepUp(reqWithCookie(a.value), USER_A)).toBe(true)
    expect(await hasFreshStepUp(reqWithCookie(b.value), USER_B)).toBe(true)
  })

  it("returns false when a cookie minted for USER_A is presented with USER_B's id", async () => {
    // This is the load-bearing test for the userId-binding hardening.
    // Without it, admin A's stolen step-up cookie could be replayed by admin B
    // (or by an attacker who has admin B's session) and pass the freshness
    // gate. With the userId bind in place, the mismatch must fail closed.
    const { value } = signStepUpCookie(USER_A)
    expect(await hasFreshStepUp(reqWithCookie(value), USER_B)).toBe(false)
  })

  it("returns false in both directions for the userId mismatch (symmetry check)", async () => {
    // Symmetric: cookie for B presented with A's id must also fail. Catches
    // any accidental asymmetric comparison in the impl (e.g. only one side
    // length-checked).
    const { value } = signStepUpCookie(USER_B)
    expect(await hasFreshStepUp(reqWithCookie(value), USER_A)).toBe(false)
  })

  it("returns false when the supplied userId is empty", async () => {
    // Defensive: passing a falsy userId from a buggy caller must fail
    // closed, not accidentally accept whatever's in the cookie.
    const { value } = signStepUpCookie(USER_A)
    expect(await hasFreshStepUp(reqWithCookie(value), "")).toBe(false)
  })

  it("returns false when the supplied userId differs by only one character", async () => {
    // Length-equal but byte-different - this is the primary path through the
    // timingSafeEqual comparison. The shorter `slice(0, -1) + "Z"` variant
    // preserves UUID length so we don't short-circuit on the length check.
    const { value } = signStepUpCookie(USER_A)
    const oneCharOff = USER_A.slice(0, -1) + (USER_A.endsWith("1") ? "2" : "1")
    expect(oneCharOff.length).toBe(USER_A.length)
    expect(await hasFreshStepUp(reqWithCookie(value), oneCharOff)).toBe(false)
  })

  it("returns false when the secret changes after the cookie was minted", async () => {
    const { value } = signStepUpCookie(USER_A)
    process.env.ADMIN_STEP_UP_SECRET = "rotated-secret-different-value"
    expect(await hasFreshStepUp(reqWithCookie(value), USER_A)).toBe(false)
  })

  it("ignores other cookies in the header", async () => {
    const { value } = signStepUpCookie(USER_A)
    const header = `session=abc123; ${STEP_UP_COOKIE}=${value}; other=def`
    expect(await hasFreshStepUp(reqWithRawCookieHeader(header), USER_A)).toBe(true)
  })

  it("handles cookie header with whitespace around values", async () => {
    const { value } = signStepUpCookie(USER_A)
    const header = `  session=abc;   ${STEP_UP_COOKIE}=${value}  ;  other=x  `
    expect(await hasFreshStepUp(reqWithRawCookieHeader(header), USER_A)).toBe(true)
  })

  it("rejects empty userId in signStepUpCookie", () => {
    expect(() => signStepUpCookie("")).toThrow(/userId/)
  })

  it("rejects non-string userId in signStepUpCookie", () => {
    expect(() => signStepUpCookie(undefined as unknown as string)).toThrow(/userId/)
  })
})

describe("stepUpRequired", () => {
  it("returns the canonical 401 / step_up_required shape", () => {
    const r = stepUpRequired()
    expect(r.status).toBe(401)
    expect(r.body).toEqual({ error: "step_up_required" })
  })
})

describe("hasFreshStepUp - ENCRYPTION_KEY_V1 fallback", () => {
  beforeEach(() => {
    delete process.env.ADMIN_STEP_UP_SECRET
    // Set a 64-char hex master key; the step-up secret slices the first 32.
    process.env.ENCRYPTION_KEY_V1 = "a".repeat(64)
  })

  afterEach(() => {
    process.env.ADMIN_STEP_UP_SECRET = FIXED_SECRET
    delete process.env.ENCRYPTION_KEY_V1
  })

  it("falls back to ENCRYPTION_KEY_V1.slice(0,32) when ADMIN_STEP_UP_SECRET is unset", async () => {
    const { value } = signStepUpCookie(USER_A)
    expect(await hasFreshStepUp(reqWithCookie(value), USER_A)).toBe(true)
  })

  it("returns false when both env vars are unset (defensive)", async () => {
    delete process.env.ENCRYPTION_KEY_V1
    // No secret available - hasFreshStepUp must NOT throw; it returns false.
    const fakeCookie = Buffer.from(`${USER_A}.${Date.now()}.fake`)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
    expect(await hasFreshStepUp(reqWithCookie(fakeCookie), USER_A)).toBe(false)
  })
})

describe("hasFreshStepUp - implementation hardening checks", () => {
  // These are not behavior tests in the strict sense - they're guardrails
  // against future refactors that would silently weaken the security
  // guarantees of hasFreshStepUp. If the implementation file is renamed or
  // refactored away from node:crypto, update the assertions here so the
  // hardening invariants stay explicit.
  const here = path.dirname(fileURLToPath(import.meta.url))
  const stepUpSrc = readFileSync(
    path.resolve(here, "../../../lib/admin/step-up.ts"),
    "utf8",
  )

  it("imports timingSafeEqual from node:crypto (not raw === for userId compare)", () => {
    // Constant-time comparison is required for the cookie userId vs current
    // user comparison; raw === leaks the legitimate userId byte-by-byte via
    // response timing under a Bleichenbacher-style adaptive attack.
    expect(stepUpSrc).toMatch(/from\s+["']node:crypto["']/)
    expect(stepUpSrc).toMatch(/timingSafeEqual/)
  })

  it("calls timingSafeEqual at least twice (once for HMAC, once for userId bind)", () => {
    // The signature compare AND the userId compare must both go through
    // timingSafeEqual. If a refactor inlines an === check for the userId
    // compare, this assertion fails.
    const matches = stepUpSrc.match(/timingSafeEqual/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })
})
