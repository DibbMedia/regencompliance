import { describe, it, expect, beforeEach } from "vitest"
import { encrypt, decrypt, hmac, verifyHmac } from "@/lib/crypto"

const VALID_KEY = "a".repeat(64)
const OTHER_KEY = "b".repeat(64)

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
