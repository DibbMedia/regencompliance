import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest"

// Wave 2C contract: POST /api/tickets must encrypt subject before insert.
// The DB-level insert payload should carry subject_enc (v1u. envelope) and
// must NOT contain a "subject" plaintext property.

const VALID_KEY = "a".repeat(64)

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

type User = { id: string; email: string } | null

const state: {
  user: User
  inserts: Array<{ table: string; payload: Record<string, unknown> }>
} = {
  user: { id: "11111111-1111-4111-8111-111111111111", email: "tester@example.com" },
  inserts: [],
}

// --- mock supabase server clients -----------------------------------------

function makeMockSupabase() {
  return {
    auth: {
      getUser: async () => ({ data: { user: state.user } }),
    },
    from(table: string) {
      const builder: Record<string, unknown> = {}
      const single = async () => ({ data: null, error: null })
      builder.select = () => builder
      builder.eq = () => builder
      builder.order = () => builder
      builder.range = () => builder
      builder.limit = () => builder
      builder.single = single
      builder.maybeSingle = single
      // Awaitable result for terminal selects (returns empty)
      ;(builder as { then?: (r: (v: { data: unknown[]; error: null }) => void) => void }).then = (
        resolve,
      ) => {
        resolve({ data: [], error: null })
      }
      builder.insert = (payload: Record<string, unknown>) => {
        state.inserts.push({ table, payload })
        return {
          select: () => ({
            single: async () => {
              // Echo back something resembling the encrypted row so the repo
              // can decrypt it. Pad missing plain cols.
              const echoed: Record<string, unknown> = {
                ...payload,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
              return { data: echoed, error: null }
            },
          }),
        }
      }
      builder.update = () => ({
        eq: () => ({
          select: () => ({ single: async () => ({ data: null, error: null }) }),
        }),
      })
      builder.delete = () => ({
        eq: async () => ({ error: null }),
      })
      return builder
    },
  }
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => makeMockSupabase(),
  createServiceClient: () => makeMockSupabase(),
}))

vi.mock("@/lib/supabase/resolve-profile", () => ({
  effectiveProfileId: async (userId: string) => userId,
}))

vi.mock("@/lib/impersonation", () => ({
  requireWriteMode: async () => null,
}))

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: true, remaining: 999 }),
}))

function req(body: unknown): Request {
  return new Request("http://localhost/api/tickets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/tickets/route")
}

describe("POST /api/tickets - encryption contract (Wave 2C)", () => {
  beforeEach(() => {
    state.inserts.length = 0
    state.user = { id: "11111111-1111-4111-8111-111111111111", email: "tester@example.com" }
  })

  it("inserts subject as subject_enc envelope; no plaintext subject column", async () => {
    const { POST } = await loadRoute()
    const res = await POST(
      req({
        subject: "DO_NOT_LEAK_SUBJECT_42",
        message: "This is the body of the new ticket.",
        priority: "normal",
      }),
    )
    expect(res.status).toBe(201)

    // Two inserts: support_tickets, then ticket_messages.
    expect(state.inserts.length).toBe(2)

    const ticketInsert = state.inserts.find((i) => i.table === "support_tickets")
    expect(ticketInsert).toBeDefined()
    const tp = ticketInsert!.payload as Record<string, unknown>

    expect(typeof tp.subject_enc).toBe("string")
    expect((tp.subject_enc as string).startsWith("v1u.")).toBe(true)
    expect(tp.subject).toBeUndefined()
    // Plaintext must not appear anywhere in the serialized payload.
    expect(JSON.stringify(tp)).not.toContain("DO_NOT_LEAK_SUBJECT_42")

    const messageInsert = state.inserts.find((i) => i.table === "ticket_messages")
    expect(messageInsert).toBeDefined()
    const mp = messageInsert!.payload as Record<string, unknown>
    expect(typeof mp.message_enc).toBe("string")
    expect((mp.message_enc as string).startsWith("v1u.")).toBe(true)
    expect(mp.message).toBeUndefined()
    // profile_id must be denormalized onto the message row (post-mig-037).
    expect(mp.profile_id).toBe(state.user!.id)
  })

  it("401 when no user is authenticated", async () => {
    state.user = null
    const { POST } = await loadRoute()
    const res = await POST(
      req({
        subject: "hello",
        message: "hi there",
      }),
    )
    expect(res.status).toBe(401)
    expect(state.inserts.length).toBe(0)
  })
})
