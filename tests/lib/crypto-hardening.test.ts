// Phase 7 hardening tests: production-only refusal of fallback / weak / test
// master keys. The Wave 1 crypto fixture (`"a".repeat(64)`) is rejected in
// production but still accepted in test mode (NODE_ENV=test), so the existing
// crypto.test.ts suite keeps passing.

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { deriveUserKey } from "@/lib/crypto"

const VALID_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
const TEST_FIXTURE_KEY = "a".repeat(64)
const ALL_ZERO_KEY = "0".repeat(64)
const UUID_A = "11111111-1111-4111-8111-111111111111"

const COLLISION_ENVS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXTAUTH_SECRET",
  "DEMO_COOKIE_SECRET",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_RESTRICTED_KEY",
  "CRON_SECRET",
  "LOOKUP_HMAC_KEY",
] as const

const ORIGINAL_NODE_ENV = process.env.NODE_ENV
const SAVED_COLLISION: Record<string, string | undefined> = {}

beforeEach(() => {
  for (const k of COLLISION_ENVS) {
    SAVED_COLLISION[k] = process.env[k]
    delete process.env[k]
  }
})

afterEach(() => {
  // Restore NODE_ENV via defineProperty because Node treats it as a getter
  // in some environments.
  Object.defineProperty(process.env, "NODE_ENV", {
    value: ORIGINAL_NODE_ENV,
    configurable: true,
    writable: true,
    enumerable: true,
  })
  for (const k of COLLISION_ENVS) {
    if (SAVED_COLLISION[k] === undefined) delete process.env[k]
    else process.env[k] = SAVED_COLLISION[k]
  }
})

function setProduction() {
  Object.defineProperty(process.env, "NODE_ENV", {
    value: "production",
    configurable: true,
    writable: true,
    enumerable: true,
  })
}

describe("lib/crypto - production hardening (Phase 7)", () => {
  it("refuses when ENCRYPTION_KEY_V1 collides with SUPABASE_SERVICE_ROLE_KEY in production", () => {
    setProduction()
    process.env.ENCRYPTION_KEY_V1 = VALID_KEY
    process.env.SUPABASE_SERVICE_ROLE_KEY = VALID_KEY
    expect(() => deriveUserKey(UUID_A)).toThrow(
      /Refusing to derive DEK.*SUPABASE_SERVICE_ROLE_KEY.*production/,
    )
  })

  it.each(COLLISION_ENVS)(
    "refuses when ENCRYPTION_KEY_V1 collides with %s in production",
    (envName) => {
      setProduction()
      process.env.ENCRYPTION_KEY_V1 = VALID_KEY
      process.env[envName] = VALID_KEY
      expect(() => deriveUserKey(UUID_A)).toThrow(
        new RegExp(`Refusing to derive DEK.*${envName}.*production`),
      )
    },
  )

  it("refuses the Wave 1 test-fixture key in production", () => {
    setProduction()
    process.env.ENCRYPTION_KEY_V1 = TEST_FIXTURE_KEY
    // "a".repeat(64) hits the all-same-char degenerate check first; either
    // refusal reason is acceptable as long as it's a hard error.
    expect(() => deriveUserKey(UUID_A)).toThrow(
      /Refusing to derive DEK.*(degenerate|test fixture)/,
    )
  })

  it("refuses a non-degenerate test fixture (deadbeef pattern) in production", () => {
    setProduction()
    process.env.ENCRYPTION_KEY_V1 = "deadbeef".repeat(8)
    expect(() => deriveUserKey(UUID_A)).toThrow(/Refusing to derive DEK.*test fixture/)
  })

  it("refuses an all-zero key in production", () => {
    setProduction()
    process.env.ENCRYPTION_KEY_V1 = ALL_ZERO_KEY
    expect(() => deriveUserKey(UUID_A)).toThrow(
      /Refusing to derive DEK.*(degenerate|test fixture)/,
    )
  })

  it("error message points at the openssl rotation command", () => {
    setProduction()
    process.env.ENCRYPTION_KEY_V1 = TEST_FIXTURE_KEY
    expect(() => deriveUserKey(UUID_A)).toThrow(/openssl rand -hex 32/)
  })

  it("accepts the existing Wave 1 fixture key in test mode (NODE_ENV=test)", () => {
    // Vitest sets NODE_ENV=test by default; this is the baseline.
    process.env.ENCRYPTION_KEY_V1 = TEST_FIXTURE_KEY
    // Should not throw — the Wave 1 crypto tests rely on this.
    expect(() => deriveUserKey(UUID_A)).not.toThrow()
  })

  it("accepts a fresh random key in production with no collisions", () => {
    setProduction()
    process.env.ENCRYPTION_KEY_V1 = VALID_KEY
    // None of the COLLISION_ENVS set; not a weak fixture; not degenerate.
    expect(() => deriveUserKey(UUID_A)).not.toThrow()
  })
})
