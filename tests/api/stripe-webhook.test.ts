import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Stripe SDK mock ───────────────────────────────────────────
type WebhookEvent = {
  id: string
  type: string
  created: number
  data: { object: Record<string, unknown> }
}

const stripeCtx: {
  constructResult: WebhookEvent | Error
  retrieveSession?: unknown
  retrieveCustomer?: unknown
} = {
  constructResult: {
    id: "evt_test",
    type: "checkout.session.completed",
    created: Math.floor(Date.now() / 1000),
    data: { object: { customer: null, subscription: null } },
  },
}

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: (_body: string, _sig: string, _secret: string) => {
        if (stripeCtx.constructResult instanceof Error) throw stripeCtx.constructResult
        return stripeCtx.constructResult
      },
    },
    checkout: {
      sessions: {
        retrieve: async () => stripeCtx.retrieveSession ?? { customer: null, customer_details: {} },
      },
    },
    customers: {
      retrieve: async () => stripeCtx.retrieveCustomer ?? { deleted: true },
    },
  },
}))

// ─── Supabase mock ─────────────────────────────────────────────
type DedupRow = { event_id: string } | null
const dbState: {
  existingEvent: DedupRow
  insertEventError: { code: string } | null
  profile: { id: string } | null
} = {
  existingEvent: null,
  insertEventError: null,
  profile: null,
}

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: (_table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: dbState.existingEvent, error: null }),
        }),
      }),
      insert: async () => ({ error: dbState.insertEventError }),
      update: () => ({
        eq: async () => ({ error: null }),
      }),
      delete: () => ({
        eq: async () => ({ error: null }),
      }),
    }),
    auth: {
      admin: {
        listUsers: async () => ({ data: { users: [] }, error: null }),
      },
    },
  }),
}))

vi.mock("@/lib/email", () => ({
  sendEmail: async () => ({ ok: true }),
}))

vi.mock("@/lib/audit-log", () => ({
  logAudit: () => {},
}))

vi.mock("@/lib/email-templates", () => ({
  welcomeEmail: () => ({ subject: "w", html: "w" }),
  betaWelcomeEmail: () => ({ subject: "bw", html: "bw" }),
  paymentFailedEmail: () => ({ subject: "pf", html: "pf" }),
  subscriptionCancelledEmail: () => ({ subject: "sc", html: "sc" }),
}))

process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_fake"

function webhookReq(body = "{}"): Request {
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: {
      "stripe-signature": "t=1,v1=fake",
      "content-type": "application/json",
    },
    body,
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/stripe/webhook/route")
}

describe("POST /api/stripe/webhook - security contract", () => {
  beforeEach(() => {
    stripeCtx.constructResult = {
      id: "evt_test_" + Math.random().toString(36).slice(2),
      type: "customer.subscription.updated",
      created: Math.floor(Date.now() / 1000),
      data: { object: { customer: null } },
    }
    dbState.existingEvent = null
    dbState.insertEventError = null
  })

  it("rejects requests with invalid signature (400)", async () => {
    stripeCtx.constructResult = new Error("No signatures found matching the expected signature")
    const { POST } = await loadRoute()
    const res = await POST(webhookReq())
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/invalid signature/i)
  })

  it("rejects events older than 60 minutes (replay window)", async () => {
    const oneHourPlusOneMinAgo = Math.floor(Date.now() / 1000) - 61 * 60
    stripeCtx.constructResult = {
      id: "evt_old",
      type: "customer.subscription.updated",
      created: oneHourPlusOneMinAgo,
      data: { object: { customer: null } },
    }
    const { POST } = await loadRoute()
    const res = await POST(webhookReq())
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/too old/i)
  })

  it("accepts events right at the replay window edge", async () => {
    const justInsideWindow = Math.floor(Date.now() / 1000) - 59 * 60
    stripeCtx.constructResult = {
      id: "evt_fresh",
      type: "customer.subscription.updated",
      created: justInsideWindow,
      data: { object: { customer: null } },
    }
    const { POST } = await loadRoute()
    const res = await POST(webhookReq())
    expect(res.status).toBe(200)
  })

  it("returns duplicate=true for previously-seen event IDs (idempotency)", async () => {
    dbState.existingEvent = { event_id: "evt_dup" }
    stripeCtx.constructResult = {
      id: "evt_dup",
      type: "customer.subscription.updated",
      created: Math.floor(Date.now() / 1000),
      data: { object: { customer: null } },
    }
    const { POST } = await loadRoute()
    const res = await POST(webhookReq())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.duplicate).toBe(true)
  })

  it("handles race-condition duplicate (23505 on insert) as duplicate", async () => {
    dbState.insertEventError = { code: "23505" }
    const { POST } = await loadRoute()
    const res = await POST(webhookReq())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.duplicate).toBe(true)
  })
})
