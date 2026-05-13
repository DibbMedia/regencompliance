import { describe, it, expect, beforeEach } from "vitest"
import {
  encrypt,
  decrypt,
  hmac,
  verifyHmac,
  deriveUserKey,
  deriveRowKey,
  encryptForUser,
  decryptForUser,
  encryptForRow,
  decryptForRow,
  encryptForSystem,
  decryptForSystem,
  encryptJSONForUser,
  decryptJSONForUser,
  encryptJSONForRow,
  decryptJSONForRow,
  encryptJSONForSystem,
  decryptJSONForSystem,
  decryptAny,
  withCryptoRequestScope,
} from "@/lib/crypto"

const VALID_KEY = "a".repeat(64)
const OTHER_KEY = "b".repeat(64)

const UUID_A = "11111111-1111-4111-8111-111111111111"
const UUID_B = "22222222-2222-4222-8222-222222222222"
const UUID_ROW_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const UUID_ROW_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

beforeEach(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

describe("lib/crypto - key loading", () => {
  it("throws when ENCRYPTION_KEY_V1 is unset", () => {
    delete process.env.ENCRYPTION_KEY_V1
    expect(() => encrypt("hello")).toThrow(/Missing ENCRYPTION_KEY_V1/)
  })

  it("throws on wrong length", () => {
    process.env.ENCRYPTION_KEY_V1 = "deadbeef"
    expect(() => encrypt("hello")).toThrow(/64 lowercase hex/)
  })

  it("throws on non-hex chars", () => {
    process.env.ENCRYPTION_KEY_V1 = "z".repeat(64)
    expect(() => encrypt("hello")).toThrow(/64 lowercase hex/)
  })
})

describe("lib/crypto - encrypt/decrypt roundtrip", () => {
  it("round-trips ASCII", () => {
    const envelope = encrypt("hello world")
    expect(envelope).toMatch(/^v1\./)
    expect(decrypt(envelope)).toBe("hello world")
  })

  it("round-trips unicode", () => {
    const plain = "FDA rules é ✓ 👍"
    expect(decrypt(encrypt(plain))).toBe(plain)
  })

  it("produces fresh IV on every call (non-deterministic ciphertext)", () => {
    const a = encrypt("same-input")
    const b = encrypt("same-input")
    expect(a).not.toBe(b)
  })

  it("AAD binds ciphertext to context", () => {
    const envelope = encrypt("secret", "scans:42")
    expect(decrypt(envelope, "scans:42")).toBe("secret")
    expect(() => decrypt(envelope, "scans:99")).toThrow()
    expect(() => decrypt(envelope)).toThrow()
  })

  it("rejects ciphertext encrypted under a different key", () => {
    const envelope = encrypt("secret")
    process.env.ENCRYPTION_KEY_V1 = OTHER_KEY
    expect(() => decrypt(envelope)).toThrow()
  })

  it("rejects tampered ciphertext", () => {
    const envelope = encrypt("secret")
    const parts = envelope.split(".")
    // Flip one character in the body
    const tampered = parts[0] + "." + (parts[1].startsWith("A") ? "B" : "A") + parts[1].slice(1)
    expect(() => decrypt(tampered)).toThrow()
  })

  it("rejects unknown envelope version", () => {
    expect(() => decrypt("v9.notreal")).toThrow(/Unknown envelope version/)
  })
})

describe("lib/crypto - hmac", () => {
  it("is deterministic for the same input + key", () => {
    expect(hmac("hello")).toBe(hmac("hello"))
  })

  it("differs across inputs", () => {
    expect(hmac("hello")).not.toBe(hmac("hello!"))
  })

  it("differs across keys", () => {
    const a = hmac("hello")
    process.env.ENCRYPTION_KEY_V1 = OTHER_KEY
    const b = hmac("hello")
    expect(a).not.toBe(b)
  })

  it("verifyHmac accepts correct tag", () => {
    const tag = hmac("payload")
    expect(verifyHmac("payload", tag)).toBe(true)
  })

  it("verifyHmac rejects wrong tag", () => {
    const tag = hmac("payload")
    expect(verifyHmac("payload", tag.slice(0, -1) + (tag.endsWith("a") ? "b" : "a"))).toBe(false)
  })

  it("verifyHmac rejects wrong-length input without crashing", () => {
    expect(verifyHmac("payload", "short")).toBe(false)
  })
})

describe("lib/crypto - per-user DEK roundtrip", () => {
  const baseOpts = {
    userId: UUID_A,
    table: "profiles",
    column: "clinic_name",
    rowId: UUID_ROW_A,
  }

  it("round-trips plaintext", () => {
    const env = encryptForUser({ ...baseOpts, plaintext: "Regen Clinic" })
    expect(env).toMatch(/^v1u\./)
    expect(decryptForUser({ ...baseOpts, envelope: env })).toBe("Regen Clinic")
  })

  it("AAD rowId binding fails on mismatch", () => {
    const env = encryptForUser({ ...baseOpts, plaintext: "secret" })
    expect(() =>
      decryptForUser({ ...baseOpts, envelope: env, rowId: UUID_ROW_B }),
    ).toThrow(/Decrypt failed/)
  })

  it("AAD column binding fails on mismatch", () => {
    const env = encryptForUser({ ...baseOpts, plaintext: "secret" })
    expect(() =>
      decryptForUser({ ...baseOpts, envelope: env, column: "other_column" }),
    ).toThrow(/Decrypt failed/)
  })

  it("AAD table binding fails on mismatch", () => {
    const env = encryptForUser({ ...baseOpts, plaintext: "secret" })
    expect(() =>
      decryptForUser({ ...baseOpts, envelope: env, table: "other_table" }),
    ).toThrow(/Decrypt failed/)
  })

  it("cross-user decrypt fails", () => {
    const env = encryptForUser({ ...baseOpts, plaintext: "secret" })
    expect(() =>
      decryptForUser({ ...baseOpts, envelope: env, userId: UUID_B }),
    ).toThrow(/Decrypt failed/)
  })

  it("rejects tampered ciphertext", () => {
    const env = encryptForUser({ ...baseOpts, plaintext: "secret" })
    const [v, body] = env.split(".")
    const flipped = body[0] === "A" ? "B" + body.slice(1) : "A" + body.slice(1)
    expect(() => decryptForUser({ ...baseOpts, envelope: `${v}.${flipped}` })).toThrow()
  })

  it("rejects wrong version prefix", () => {
    const env = encryptForUser({ ...baseOpts, plaintext: "secret" })
    const swapped = env.replace(/^v1u\./, "v2u.")
    expect(() => decryptForUser({ ...baseOpts, envelope: swapped })).toThrow(
      /Unknown envelope version/,
    )
  })
})

describe("lib/crypto - per-row DEK roundtrip", () => {
  const baseOpts = {
    rowId: UUID_ROW_A,
    table: "free_audit_leads",
    column: "email",
  }

  it("round-trips plaintext", () => {
    const env = encryptForRow({ ...baseOpts, plaintext: "lead@example.com" })
    expect(env).toMatch(/^v1r\./)
    expect(decryptForRow({ ...baseOpts, envelope: env })).toBe("lead@example.com")
  })

  it("cross-row decrypt fails", () => {
    const env = encryptForRow({ ...baseOpts, plaintext: "lead@example.com" })
    expect(() =>
      decryptForRow({ ...baseOpts, envelope: env, rowId: UUID_ROW_B }),
    ).toThrow(/Decrypt failed/)
  })

  it("AAD column binding fails on mismatch", () => {
    const env = encryptForRow({ ...baseOpts, plaintext: "lead@example.com" })
    expect(() =>
      decryptForRow({ ...baseOpts, envelope: env, column: "phone" }),
    ).toThrow(/Decrypt failed/)
  })
})

describe("lib/crypto - per-system roundtrip", () => {
  const baseOpts = {
    table: "platform_admins",
    column: "notes",
    rowId: UUID_ROW_A,
  }

  it("round-trips plaintext", () => {
    const env = encryptForSystem({ ...baseOpts, plaintext: "broadcast payload" })
    expect(env).toMatch(/^v1s\./)
    expect(decryptForSystem({ ...baseOpts, envelope: env })).toBe("broadcast payload")
  })

  it("AAD rowId binding fails on mismatch", () => {
    const env = encryptForSystem({ ...baseOpts, plaintext: "broadcast payload" })
    expect(() =>
      decryptForSystem({ ...baseOpts, envelope: env, rowId: UUID_ROW_B }),
    ).toThrow(/Decrypt failed/)
  })
})

describe("lib/crypto - legacy v1. envelope", () => {
  it("legacy v1. envelope still decrypts via decrypt()", () => {
    const env = encrypt("legacy payload")
    expect(env).toMatch(/^v1\./)
    expect(decrypt(env)).toBe("legacy payload")
  })

  it("legacy v1. envelope with AAD still works", () => {
    const env = encrypt("legacy payload", "scans:42")
    expect(decrypt(env, "scans:42")).toBe("legacy payload")
  })
})

describe("lib/crypto - JSON wrappers", () => {
  const complexPayload = {
    flags: [
      { id: "F1", severity: "high", offsets: [12, 34, 56] },
      { id: "F2", severity: "low", offsets: [] },
    ],
    metadata: { ai: { model: "claude-opus-4-7", scored: true }, tokens: 1234 },
    notes: null as string | null,
  }

  it("user JSON wrapper round-trips a complex object", () => {
    const env = encryptJSONForUser({
      userId: UUID_A,
      payload: complexPayload,
      table: "scans",
      column: "flags",
      rowId: UUID_ROW_A,
    })
    const decoded = decryptJSONForUser<typeof complexPayload>({
      userId: UUID_A,
      envelope: env,
      table: "scans",
      column: "flags",
      rowId: UUID_ROW_A,
    })
    expect(decoded).toEqual(complexPayload)
  })

  it("row JSON wrapper round-trips", () => {
    const env = encryptJSONForRow({
      rowId: UUID_ROW_A,
      payload: complexPayload,
      table: "free_audit_leads",
      column: "snapshot",
    })
    const decoded = decryptJSONForRow<typeof complexPayload>({
      rowId: UUID_ROW_A,
      envelope: env,
      table: "free_audit_leads",
      column: "snapshot",
    })
    expect(decoded).toEqual(complexPayload)
  })

  it("system JSON wrapper round-trips", () => {
    const env = encryptJSONForSystem({
      payload: complexPayload,
      table: "audit_log",
      column: "details",
      rowId: UUID_ROW_A,
    })
    const decoded = decryptJSONForSystem<typeof complexPayload>({
      envelope: env,
      table: "audit_log",
      column: "details",
      rowId: UUID_ROW_A,
    })
    expect(decoded).toEqual(complexPayload)
  })
})

describe("lib/crypto - HKDF derivation", () => {
  it("deriveUserKey is deterministic for the same input", () => {
    const a = deriveUserKey(UUID_A)
    const b = deriveUserKey(UUID_A)
    expect(Buffer.compare(a, b)).toBe(0)
    expect(a.length).toBe(32)
  })

  it("deriveUserKey and deriveRowKey produce different keys for the same id", () => {
    const u = deriveUserKey(UUID_A)
    const r = deriveRowKey(UUID_A)
    expect(Buffer.compare(u, r)).not.toBe(0)
  })

  it("different userIds yield different keys", () => {
    expect(Buffer.compare(deriveUserKey(UUID_A), deriveUserKey(UUID_B))).not.toBe(0)
  })

  it("malformed userId throws", () => {
    expect(() => deriveUserKey("not-a-uuid")).toThrow(/Invalid UUID/)
  })

  it("malformed rowId throws", () => {
    expect(() => deriveRowKey("garbage")).toThrow(/Invalid UUID/)
  })
})

describe("lib/crypto - request-scoped cache", () => {
  it("returns the same Buffer reference within a scope", () => {
    withCryptoRequestScope(() => {
      const a = deriveUserKey(UUID_A)
      const b = deriveUserKey(UUID_A)
      // Same cached reference => same underlying memory.
      expect(a).toBe(b)
    })
  })

  it("separates cache keys for user vs row spaces with the same UUID", () => {
    withCryptoRequestScope(() => {
      const u1 = deriveUserKey(UUID_A)
      const r1 = deriveRowKey(UUID_A)
      const u2 = deriveUserKey(UUID_A)
      const r2 = deriveRowKey(UUID_A)
      expect(u1).toBe(u2)
      expect(r1).toBe(r2)
      expect(u1).not.toBe(r1)
      // Bytes must still differ (different info strings).
      expect(Buffer.compare(u1, r1)).not.toBe(0)
    })
  })

  it("does not cache outside the scope (fresh Buffer per call)", () => {
    const a = deriveUserKey(UUID_A)
    const b = deriveUserKey(UUID_A)
    expect(a).not.toBe(b)
    // Bytes match (deterministic HKDF) even though references differ.
    expect(Buffer.compare(a, b)).toBe(0)
  })

  it("caches derive across many encrypt calls within a scope", () => {
    let lastKey: Buffer | null = null
    let sameRefHits = 0
    let totalCalls = 0
    withCryptoRequestScope(() => {
      for (let i = 0; i < 50; i++) {
        const k = deriveUserKey(UUID_A)
        totalCalls++
        if (lastKey && k === lastKey) sameRefHits++
        lastKey = k
      }
    })
    // First call seeds the cache; the rest must all be reference-equal hits.
    expect(totalCalls).toBe(50)
    expect(sameRefHits).toBe(49)
  })

  it("supports async work inside the scope", async () => {
    await withCryptoRequestScope(async () => {
      const a = deriveUserKey(UUID_A)
      await Promise.resolve()
      const b = deriveUserKey(UUID_A)
      expect(a).toBe(b)
    })
  })

  it("nested scopes get fresh caches", () => {
    withCryptoRequestScope(() => {
      const outer = deriveUserKey(UUID_A)
      withCryptoRequestScope(() => {
        const inner = deriveUserKey(UUID_A)
        // Different scope => different cached Buffer reference.
        expect(inner).not.toBe(outer)
        expect(Buffer.compare(inner, outer)).toBe(0)
      })
    })
  })
})

describe("lib/crypto - decryptAny dispatch", () => {
  const aad = {
    table: "profiles",
    column: "clinic_name",
    rowId: UUID_ROW_A,
  }

  it("routes v1u. envelopes through user path", () => {
    const env = encryptForUser({ ...aad, userId: UUID_A, plaintext: "user payload" })
    expect(decryptAny({ ...aad, envelope: env, userId: UUID_A })).toBe("user payload")
  })

  it("v1u. without userId throws", () => {
    const env = encryptForUser({ ...aad, userId: UUID_A, plaintext: "user payload" })
    expect(() => decryptAny({ ...aad, envelope: env })).toThrow(/userId required/)
  })

  it("routes v1r. envelopes through row path", () => {
    const env = encryptForRow({
      rowId: UUID_ROW_A,
      plaintext: "row payload",
      table: aad.table,
      column: aad.column,
    })
    expect(decryptAny({ ...aad, envelope: env })).toBe("row payload")
  })

  it("routes v1s. envelopes through system path", () => {
    const env = encryptForSystem({ ...aad, plaintext: "system payload" })
    expect(decryptAny({ ...aad, envelope: env })).toBe("system payload")
  })

  it("routes legacy v1. envelopes through master path (no AAD)", () => {
    const env = encrypt("legacy payload")
    expect(decryptAny({ ...aad, envelope: env })).toBe("legacy payload")
  })

  it("throws on unknown version", () => {
    expect(() =>
      decryptAny({ ...aad, envelope: "v9.bogus", userId: UUID_A }),
    ).toThrow(/Unknown envelope version/)
  })
})
