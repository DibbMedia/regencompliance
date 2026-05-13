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
//   - Per-user / per-row DEKs: HKDF-SHA256 from the master key with the
//     subject's UUID raw bytes as salt and a domain-separated info string.
//
// Envelope versions:
//   v1.   legacy single-key envelope (master key, optional AAD).
//   v1u.  per-user DEK envelope (HKDF info "regen:user-dek:v1"), AAD required.
//   v1r.  per-row DEK envelope (HKDF info "regen:row-dek:v1"), AAD required.
//   v1s.  system master-key envelope, AAD required (NULL-user/broadcast rows).
//
// AAD format for all v1u./v1r./v1s. envelopes: `${table}:${column}:${rowId}`.
import {
  AsyncLocalStorage,
} from "node:async_hooks"
import * as nodeCrypto from "node:crypto"
const {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} = nodeCrypto

const KEY_ENV = "ENCRYPTION_KEY_V1"
const VERSION = "v1"
const VERSION_USER = "v1u"
const VERSION_ROW = "v1r"
const VERSION_SYSTEM = "v1s"
const IV_BYTES = 12
const TAG_BYTES = 16
const DEK_BYTES = 32

const INFO_USER = "regen:user-dek:v1"
const INFO_ROW = "regen:row-dek:v1"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// --- Production fallback refusal (Phase 7 hardening) -----------------------
//
// In production we refuse to derive a DEK if the master key looks like a
// fallback (collides with another secret), is the all-zero / single-char
// degenerate, or matches a well-known test fixture. These checks are skipped
// outside production so the Wave 1 crypto test fixture keeps working.

// Env vars whose value the master key MUST NOT equal in production. If the
// operator pasted, e.g., SUPABASE_SERVICE_ROLE_KEY into ENCRYPTION_KEY_V1 by
// mistake, derivation halts at first use rather than silently working.
const FALLBACK_COLLISION_ENVS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXTAUTH_SECRET",
  "DEMO_COOKIE_SECRET",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_RESTRICTED_KEY",
  "CRON_SECRET",
  "LOOKUP_HMAC_KEY",
] as const

// Test fixtures used in tests/lib/crypto.test.ts. Hex strings only — anything
// matching one of these in production indicates an unset / placeholder key.
const WEAK_TEST_KEYS: ReadonlyArray<string> = [
  "a".repeat(64),
  "b".repeat(64),
  "0".repeat(64),
  "1".repeat(64),
  "f".repeat(64),
  "deadbeef".repeat(8),
  "cafebabe".repeat(8),
]

function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

function isAllSameChar(s: string): boolean {
  if (s.length === 0) return false
  const first = s[0]
  for (let i = 1; i < s.length; i++) if (s[i] !== first) return false
  return true
}

function refuseFallback(reason: string): never {
  throw new Error(
    `Refusing to derive DEK: ${reason}. Generate a fresh key with \`openssl rand -hex 32\` and set it in Vercel as Sensitive.`,
  )
}

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

  if (isProduction()) {
    const normalized = raw.toLowerCase()

    // 1. Reject degenerate keys (all-zero, all-same-char).
    if (isAllSameChar(normalized)) {
      refuseFallback(`${KEY_ENV} is a degenerate single-character key`)
    }

    // 2. Reject keys that match Wave 1 / common test fixtures.
    for (const weak of WEAK_TEST_KEYS) {
      if (normalized === weak.toLowerCase()) {
        refuseFallback(`${KEY_ENV} matches a known test fixture`)
      }
    }

    // 3. Reject collisions with other env vars. We compare the trimmed raw
    //    string (not just normalized hex), because a colliding secret like
    //    SUPABASE_SERVICE_ROLE_KEY will not be hex but would still indicate
    //    the operator mis-typed the env var name.
    for (const otherEnv of FALLBACK_COLLISION_ENVS) {
      const other = process.env[otherEnv]?.trim()
      if (!other) continue
      if (other === raw) {
        refuseFallback(
          `${KEY_ENV} collides with ${otherEnv} in production`,
        )
      }
    }
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

function uuidToBytes(uuid: string, label: string): Buffer {
  if (typeof uuid !== "string" || !UUID_RE.test(uuid)) {
    throw new Error(`Invalid UUID for ${label}: expected canonical 8-4-4-4-12 hex form`)
  }
  return Buffer.from(uuid.replace(/-/g, ""), "hex")
}

function buildAad(table: string, column: string, rowId: string): Buffer {
  if (!table || !column || !rowId) {
    throw new Error("AAD requires non-empty table, column, and rowId")
  }
  return Buffer.from(`${table}:${column}:${rowId}`, "utf8")
}

// --- Request-scoped derive cache -------------------------------------------

type DeriveCache = Map<string, Buffer>
const cacheStorage = new AsyncLocalStorage<DeriveCache>()

export function withCryptoRequestScope<T>(fn: () => T): T
export function withCryptoRequestScope<T>(fn: () => Promise<T>): Promise<T>
export function withCryptoRequestScope<T>(fn: () => T | Promise<T>): T | Promise<T> {
  const cache: DeriveCache = new Map()
  return cacheStorage.run(cache, fn)
}

function derive(salt: Buffer, info: string, cacheKey: string): Buffer {
  const cache = cacheStorage.getStore()
  if (cache) {
    const hit = cache.get(cacheKey)
    if (hit) return hit
  }
  const master = loadKey()
  // hkdfSync returns ArrayBuffer; wrap in Buffer for ergonomic API.
  const dek = Buffer.from(
    nodeCrypto.hkdfSync("sha256", master, salt, Buffer.from(info, "utf8"), DEK_BYTES),
  )
  if (cache) cache.set(cacheKey, dek)
  return dek
}

// --- Key derivation --------------------------------------------------------

export function deriveUserKey(userId: string): Buffer {
  const salt = uuidToBytes(userId, "userId")
  return derive(salt, INFO_USER, `user:${userId.toLowerCase()}`)
}

export function deriveRowKey(rowId: string): Buffer {
  const salt = uuidToBytes(rowId, "rowId")
  return derive(salt, INFO_ROW, `row:${rowId.toLowerCase()}`)
}

// --- Low-level encrypt/decrypt with explicit key + AAD ---------------------

function encryptWithKey(version: string, key: Buffer, plaintext: string, aad: Buffer): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  cipher.setAAD(aad)
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${version}.${b64url(Buffer.concat([iv, ct, tag]))}`
}

function decryptWithKey(expectedVersion: string, key: Buffer, envelope: string, aad: Buffer): string {
  const dot = envelope.indexOf(".")
  if (dot < 0) {
    throw new Error("Malformed envelope: missing version separator")
  }
  const version = envelope.slice(0, dot)
  const body = envelope.slice(dot + 1)
  if (version !== expectedVersion || !body) {
    throw new Error(`Unknown envelope version: ${version}`)
  }
  const raw = fromB64url(body)
  if (raw.length < IV_BYTES + TAG_BYTES) {
    throw new Error("Envelope too short")
  }
  const iv = raw.subarray(0, IV_BYTES)
  const tag = raw.subarray(raw.length - TAG_BYTES)
  const ct = raw.subarray(IV_BYTES, raw.length - TAG_BYTES)
  const decipher = createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(tag)
  decipher.setAAD(aad)
  try {
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8")
  } catch (err) {
    throw new Error(
      `Decrypt failed (auth tag mismatch or corrupt ciphertext): ${(err as Error).message}`,
    )
  }
}

// --- Legacy v1. envelope (master key, optional AAD) ------------------------

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
  const dot = envelope.indexOf(".")
  if (dot < 0) {
    throw new Error("Malformed envelope: missing version separator")
  }
  const version = envelope.slice(0, dot)
  const body = envelope.slice(dot + 1)
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
  try {
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8")
  } catch (err) {
    throw new Error(
      `Decrypt failed (auth tag mismatch or corrupt ciphertext): ${(err as Error).message}`,
    )
  }
}

// --- Per-user DEK encrypt/decrypt ------------------------------------------

export function encryptForUser(opts: {
  userId: string
  plaintext: string
  table: string
  column: string
  rowId: string
}): string {
  const key = deriveUserKey(opts.userId)
  const aad = buildAad(opts.table, opts.column, opts.rowId)
  return encryptWithKey(VERSION_USER, key, opts.plaintext, aad)
}

export function decryptForUser(opts: {
  userId: string
  envelope: string
  table: string
  column: string
  rowId: string
}): string {
  const key = deriveUserKey(opts.userId)
  const aad = buildAad(opts.table, opts.column, opts.rowId)
  return decryptWithKey(VERSION_USER, key, opts.envelope, aad)
}

// --- Per-row DEK encrypt/decrypt -------------------------------------------

export function encryptForRow(opts: {
  rowId: string
  plaintext: string
  table: string
  column: string
}): string {
  const key = deriveRowKey(opts.rowId)
  const aad = buildAad(opts.table, opts.column, opts.rowId)
  return encryptWithKey(VERSION_ROW, key, opts.plaintext, aad)
}

export function decryptForRow(opts: {
  rowId: string
  envelope: string
  table: string
  column: string
}): string {
  const key = deriveRowKey(opts.rowId)
  const aad = buildAad(opts.table, opts.column, opts.rowId)
  return decryptWithKey(VERSION_ROW, key, opts.envelope, aad)
}

// --- System master-key encrypt/decrypt -------------------------------------

export function encryptForSystem(opts: {
  plaintext: string
  table: string
  column: string
  rowId: string
}): string {
  const key = loadKey()
  const aad = buildAad(opts.table, opts.column, opts.rowId)
  return encryptWithKey(VERSION_SYSTEM, key, opts.plaintext, aad)
}

export function decryptForSystem(opts: {
  envelope: string
  table: string
  column: string
  rowId: string
}): string {
  const key = loadKey()
  const aad = buildAad(opts.table, opts.column, opts.rowId)
  return decryptWithKey(VERSION_SYSTEM, key, opts.envelope, aad)
}

// --- JSON wrappers ---------------------------------------------------------

export function encryptJSONForUser(opts: {
  userId: string
  payload: unknown
  table: string
  column: string
  rowId: string
}): string {
  return encryptForUser({
    userId: opts.userId,
    plaintext: JSON.stringify(opts.payload),
    table: opts.table,
    column: opts.column,
    rowId: opts.rowId,
  })
}

export function decryptJSONForUser<T = unknown>(opts: {
  userId: string
  envelope: string
  table: string
  column: string
  rowId: string
}): T {
  return JSON.parse(decryptForUser(opts)) as T
}

export function encryptJSONForRow(opts: {
  rowId: string
  payload: unknown
  table: string
  column: string
}): string {
  return encryptForRow({
    rowId: opts.rowId,
    plaintext: JSON.stringify(opts.payload),
    table: opts.table,
    column: opts.column,
  })
}

export function decryptJSONForRow<T = unknown>(opts: {
  rowId: string
  envelope: string
  table: string
  column: string
}): T {
  return JSON.parse(decryptForRow(opts)) as T
}

export function encryptJSONForSystem(opts: {
  payload: unknown
  table: string
  column: string
  rowId: string
}): string {
  return encryptForSystem({
    plaintext: JSON.stringify(opts.payload),
    table: opts.table,
    column: opts.column,
    rowId: opts.rowId,
  })
}

export function decryptJSONForSystem<T = unknown>(opts: {
  envelope: string
  table: string
  column: string
  rowId: string
}): T {
  return JSON.parse(decryptForSystem(opts)) as T
}

// --- Dispatching decrypt ---------------------------------------------------

export function decryptAny(opts: {
  envelope: string
  table: string
  column: string
  rowId: string
  userId?: string
}): string {
  const dot = opts.envelope.indexOf(".")
  if (dot < 0) {
    throw new Error("Malformed envelope: missing version separator")
  }
  const version = opts.envelope.slice(0, dot)
  switch (version) {
    case VERSION_USER: {
      if (!opts.userId) {
        throw new Error("decryptAny: userId required for v1u. envelopes")
      }
      return decryptForUser({
        userId: opts.userId,
        envelope: opts.envelope,
        table: opts.table,
        column: opts.column,
        rowId: opts.rowId,
      })
    }
    case VERSION_ROW:
      return decryptForRow({
        rowId: opts.rowId,
        envelope: opts.envelope,
        table: opts.table,
        column: opts.column,
      })
    case VERSION_SYSTEM:
      return decryptForSystem({
        envelope: opts.envelope,
        table: opts.table,
        column: opts.column,
        rowId: opts.rowId,
      })
    case VERSION:
      // Legacy single-key envelope; no AAD on the legacy path.
      return decrypt(opts.envelope)
    default:
      throw new Error(`Unknown envelope version: ${version}`)
  }
}

// --- HMAC ------------------------------------------------------------------

export function hmac(data: string): string {
  const key = loadKey()
  return b64url(createHmac("sha256", key).update(data, "utf8").digest())
}

export function verifyHmac(data: string, expected: string): boolean {
  const actual = hmac(data)
  if (actual.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
}
