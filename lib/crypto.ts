// Application-layer crypto helpers keyed off ENCRYPTION_KEY_V1.
//
// Key format: 64-char lowercase hex string (32 bytes / 256 bits of entropy).
// Generate with `openssl rand -hex 32` and add to Vercel as Sensitive.
//
// Algorithms:
//   - Symmetric encryption: AES-256-GCM with a 12-byte random IV per message.
//     Output envelope = base64url(iv || ciphertext || tag). Optional AAD binds
//     the ciphertext to a context string (recommend: table name + row id).
//   - HMAC: HMAC-SHA-256, output base64url, 32 bytes of tag.
//
// Versioning: every envelope is prefixed with "v1." so a future key rotation
// can produce "v2." envelopes while `decrypt` dispatches to the right key.
// For now there is only one version.
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"

const KEY_ENV = "ENCRYPTION_KEY_V1"
const VERSION = "v1"
const IV_BYTES = 12
const TAG_BYTES = 16

function loadKey(): Buffer {
  const raw = process.env[KEY_ENV]?.trim()
  if (!raw) {
    throw new Error(
      `Missing ${KEY_ENV}. Generate with \`openssl rand -hex 32\` and set in Vercel as Sensitive.`,
    )
  }
  if (!/^[0-9a-f]{64}$/i.test(raw)) {
    throw new Error(`${KEY_ENV} must be 64 lowercase hex chars (32 bytes / 256 bits).`)
  }
  return Buffer.from(raw, "hex")
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4))
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64")
}

export function encrypt(plaintext: string, aad?: string): string {
  const key = loadKey()
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  if (aad) cipher.setAAD(Buffer.from(aad, "utf8"))
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${VERSION}.${b64url(Buffer.concat([iv, ct, tag]))}`
}

export function decrypt(envelope: string, aad?: string): string {
  const [version, body] = envelope.split(".", 2)
  if (version !== VERSION || !body) {
    throw new Error(`Unknown envelope version: ${version}`)
  }
  const key = loadKey()
  const raw = fromB64url(body)
  if (raw.length < IV_BYTES + TAG_BYTES) {
    throw new Error("Envelope too short")
  }
  const iv = raw.subarray(0, IV_BYTES)
  const tag = raw.subarray(raw.length - TAG_BYTES)
  const ct = raw.subarray(IV_BYTES, raw.length - TAG_BYTES)
  const decipher = createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(tag)
  if (aad) decipher.setAAD(Buffer.from(aad, "utf8"))
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8")
}

export function hmac(data: string): string {
  const key = loadKey()
  return b64url(createHmac("sha256", key).update(data, "utf8").digest())
}

export function verifyHmac(data: string, expected: string): boolean {
  const actual = hmac(data)
  if (actual.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
}
