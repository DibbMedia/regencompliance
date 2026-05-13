// Integration test for the post-Phase-6 reservation_token claim flow.
// Verifies that POST /api/beta/claim:
//   - reads { reservation_token } from the body (not email)
//   - calls the repo's claimByReservationToken (token-based UPDATE)
//   - issues exactly one UPDATE filtered by reservation_token + claimed=false
//     and NO email filter ever (encryption made email opaque)
//
// Per plan §12.2: the path that used to read by email is dead.
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = "a".repeat(64)
})

interface FilterCall {
  col: string
  val: unknown
}

interface RecordedCall {
  op: "update" | "select"
  table: string
  payload?: Record<string, unknown>
  filters: FilterCall[]
}

const recorded: RecordedCall[] = []

const SEED_ROW_ID = "11111111-1111-4111-8111-111111111111"
const SEED_RESERVATION_TOKEN = "22222222-2222-4222-8222-222222222222"
const USER_ID = "33333333-3333-4333-8333-333333333333"

// In-memory beta_purchases row, plaintext mirror for assertions.
let seedRow: {
  id: string
  email_enc: string | null
  stripe_customer_id: string | null
  stripe_payment_intent_id: string | null
  claimed: boolean
  claimed_by: string | null
  reservation_token: string | null
  reserved_at: string | null
  reservation_expires_at: string | null
  created_at: string
} | null = null

function makeQueryChain(op: "update" | "select", table: string, payload?: Record<string, unknown>) {
  const call: RecordedCall = { op, table, payload, filters: [] }
  recorded.push(call)

  const chain = {
    eq(col: string, val: unknown) {
      call.filters.push({ col, val })
      return chain
    },
    select() {
      return chain
    },
    async maybeSingle() {
      // Apply filters to the seed row in-memory.
      if (!seedRow) return { data: null, error: null }
      for (const f of call.filters) {
        const rowVal = (seedRow as Record<string, unknown>)[f.col]
        if (rowVal !== f.val) {
          return { data: null, error: null }
        }
      }
      if (op === "update" && payload) {
        Object.assign(seedRow, payload)
      }
      return { data: { ...seedRow }, error: null }
    },
  }
  return chain
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: USER_ID, email: "buyer@example.com" } } }),
    },
  }),
  createServiceClient: () => ({
    from: (table: string) => ({
      update: (payload: Record<string, unknown>) => makeQueryChain("update", table, payload),
      select: () => makeQueryChain("select", table),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  }),
}))

vi.mock("@/lib/impersonation", () => ({
  requireWriteMode: async () => null,
}))

vi.mock("@/lib/ghl", () => ({
  sendToGhl: async () => {},
}))

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/beta/claim/route")
}

function req(body: unknown): Request {
  return new Request("http://localhost/api/beta/claim", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/beta/claim (reservation_token flow)", () => {
  beforeEach(async () => {
    recorded.length = 0
    const { encryptForRow } = await import("@/lib/crypto")
    const email_enc = encryptForRow({
      rowId: SEED_ROW_ID,
      plaintext: "buyer@example.com",
      table: "beta_purchases",
      column: "email",
    })
    seedRow = {
      id: SEED_ROW_ID,
      email_enc,
      stripe_customer_id: "cus_test",
      stripe_payment_intent_id: null,
      claimed: false,
      claimed_by: null,
      reservation_token: SEED_RESERVATION_TOKEN,
      reserved_at: new Date().toISOString(),
      reservation_expires_at: null,
      created_at: new Date().toISOString(),
    }
  })

  it("400 on missing reservation_token", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({}))
    expect(res.status).toBe(400)
  })

  it("400 on non-UUID reservation_token", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ reservation_token: "not-a-uuid" }))
    expect(res.status).toBe(400)
  })

  it("UPDATE filters on reservation_token + claimed=false, never on email", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ reservation_token: SEED_RESERVATION_TOKEN }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.claimed).toBe(true)

    // Find the UPDATE on beta_purchases.
    const upd = recorded.find(
      (c) => c.op === "update" && c.table === "beta_purchases",
    )
    expect(upd).toBeDefined()
    expect(upd!.payload?.claimed).toBe(true)
    expect(upd!.payload?.claimed_by).toBe(USER_ID)
    // Filters: reservation_token + claimed=false ONLY.
    const filterCols = upd!.filters.map((f) => f.col).sort()
    expect(filterCols).toEqual(["claimed", "reservation_token"])
    // No filter references email under any name.
    for (const call of recorded) {
      for (const f of call.filters) {
        expect(f.col).not.toBe("email")
        expect(f.col).not.toBe("email_enc")
      }
    }
  })

  it("seed row flipped to claimed=true after success", async () => {
    const { POST } = await loadRoute()
    await POST(req({ reservation_token: SEED_RESERVATION_TOKEN }))
    expect(seedRow?.claimed).toBe(true)
    expect(seedRow?.claimed_by).toBe(USER_ID)
  })

  it("returns claimed:false when token doesn't match any row", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ reservation_token: "44444444-4444-4444-8444-444444444444" }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.claimed).toBe(false)
  })
})
