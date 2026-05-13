// Integration test: /api/auth/login's audit writes go through the
// encryption-aware repo and produce a v1u. envelope (per-user DEK) bound to
// the user's id.
//
// This verifies the Phase 5 wiring: lib/audit-log.ts:logAudit now routes
// through lib/repos/audit-log.ts:createAuditLogEntry, which encrypts every
// sensitive column with AAD = `audit_log:{column}:{rowId}`.
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest"
import { decryptAuditLogRow, type AuditLogEncryptedRow } from "@/lib/repos/audit-log"

const FIXED_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = FIXED_KEY
})

// --- mock supabase client used by both `createServiceClient` (repo writes)
//     and `createClient` (auth.signInWithPassword) ---------------------------

interface MockState {
  rows: AuditLogEncryptedRow[]
}
const state: MockState = { rows: [] }

function makeServiceClient() {
  return {
    from() {
      return {
        insert(payload: AuditLogEncryptedRow) {
          // Repo allocates row id client-side, so payload carries it.
          const row: AuditLogEncryptedRow = {
            ...payload,
            created_at: "2026-05-13T00:00:00.000Z",
          }
          state.rows.push(row)
          return {
            select() {
              return {
                single() {
                  return Promise.resolve({ data: row, error: null })
                },
              }
            },
          }
        },
      }
    },
  }
}

vi.mock("@/lib/supabase/server", () => ({
  // logAudit (via createAuditLogEntry) calls createServiceClient
  createServiceClient: () => makeServiceClient(),
  // login route calls createClient for the auth proxy
  createClient: async () => ({
    auth: {
      signInWithPassword: async () => ({
        data: { user: { id: "11111111-1111-4111-8111-111111111111" }, session: { access_token: "fake" } },
        error: null,
      }),
    },
  }),
}))

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: true, remaining: 30 }),
}))

vi.mock("@/lib/ip", () => ({ getClientIp: () => "203.0.113.7" }))

vi.mock("@/lib/login-protection", () => ({
  checkLoginAllowed: async () => ({ allowed: true, remainingAttempts: 5 }),
  recordFailedLogin: async () => {},
  clearLoginAttempts: async () => {},
}))

// IMPORTANT: do NOT mock @/lib/audit-log here — we want the real logAudit so
// it routes through the real createAuditLogEntry from the repo.

function loginReq(body: unknown): Request {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "vitest/1.0" },
    body: JSON.stringify(body),
  })
}

describe("/api/auth/login -> audit_log encryption pipeline", () => {
  beforeEach(() => {
    state.rows = []
    vi.resetModules()
  })

  it("writes a v1u. envelope bound to the user's DEK on success", async () => {
    const { POST } = await import("@/app/api/auth/login/route")
    const res = await POST(loginReq({ email: "alice@example.com", password: "correct-pass" }))
    expect(res.status).toBe(200)

    // logAudit is fire-and-forget (void + .catch). Yield the microtask queue
    // a couple of times so the insert completes before assertions.
    await Promise.resolve()
    await Promise.resolve()
    await new Promise((r) => setTimeout(r, 0))

    // At least the success audit row should have landed.
    const successRow = state.rows.find((r) => r.action === "auth.login.success")
    expect(successRow).toBeDefined()
    if (!successRow) return

    // Envelope columns must be v1u. (per-user DEK) since user_id is set.
    expect(successRow.user_id).toBe("11111111-1111-4111-8111-111111111111")
    expect(successRow.user_email_enc).toMatch(/^v1u\./)
    expect(successRow.details_enc).toMatch(/^v1u\./)
    expect(successRow.ip_address_enc).toMatch(/^v1u\./)
    expect(successRow.user_agent_enc).toMatch(/^v1u\./)

    // Roundtrip decrypts back to plaintext.
    const decrypted = decryptAuditLogRow(successRow)
    expect(decrypted.user_email).toBe("alice@example.com")
    expect(decrypted.ip_address).toBe("203.0.113.7")
    expect(decrypted.user_agent).toBe("vitest/1.0")
    expect(decrypted.action).toBe("auth.login.success")
    expect(decrypted.status).toBe("success")
  })
})
