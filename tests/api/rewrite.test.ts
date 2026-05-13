/**
 * Integration test for POST /api/rewrite.
 *
 * Post-cutover (migration 036) the route must:
 *   1. Load the existing scan via the encrypted `getScan` repo so the
 *      original_text fed to Claude is the decrypted plaintext (not the v1u.
 *      envelope).
 *   2. Persist the rewrite via `updateScanRewrite` so the column written is
 *      `rewritten_text_enc` (a v1u. envelope), not the dropped plaintext
 *      `rewritten_text` column.
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import { encryptForUser, encryptJSONForUser } from "@/lib/crypto"

const VALID_KEY = "a".repeat(64)
const PROFILE_ID = "44444444-4444-4444-8444-444444444444"
const SCAN_ID = "55555555-5555-4555-8555-555555555555"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

interface RecordedTableState {
  selectCalls: Array<string>
  inserts: Array<Record<string, unknown>>
  updates: Array<Record<string, unknown>>
}

const tableState: Record<string, RecordedTableState> = {}
function tableFor(name: string): RecordedTableState {
  if (!tableState[name]) {
    tableState[name] = { selectCalls: [], inserts: [], updates: [] }
  }
  return tableState[name]
}

function resetState() {
  for (const k of Object.keys(tableState)) delete tableState[k]
  anthropicSeen.input = ""
}

const anthropicSeen = { input: "" }
const SCAN_PLAINTEXT = "Our therapy is FDA approved and cures arthritis."

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: true, remaining: 999 }),
}))

vi.mock("@/lib/impersonation", () => ({
  requireWriteMode: async () => null,
}))

vi.mock("@/lib/api-costs", () => ({
  trackApiUsage: () => undefined,
}))

vi.mock("@/lib/error-tracking", () => ({
  captureError: () => undefined,
}))

vi.mock("@/lib/compliance-bible", () => ({
  getComplianceBiblePrompt: () => "[bible-stub]",
  getComplianceBibleRewriteGuidance: () => "[guidance-stub]",
}))

vi.mock("@/lib/supabase/resolve-profile", () => ({
  effectiveProfileId: async () => PROFILE_ID,
}))

vi.mock("@/lib/anthropic", () => ({
  anthropic: {
    messages: {
      create: async (req: { messages: Array<{ role: string; content: string }> }) => {
        anthropicSeen.input = req.messages[0]?.content ?? ""
        return {
          content: [{ type: "text", text: "Compliant rewrite of the copy." }],
          usage: { input_tokens: 10, output_tokens: 5 },
        }
      },
    },
  },
}))

vi.mock("@/lib/supabase/server", () => {
  function makeClient() {
    return {
      auth: {
        getUser: async () => ({
          data: { user: { id: PROFILE_ID, email: "a@b.com" } },
          error: null,
        }),
      },
      from(table: string) {
        const t = tableFor(table)
        return makeBuilder(table, t)
      },
    }
  }
  return {
    createClient: async () => makeClient(),
    createServiceClient: () => makeClient(),
  }
})

interface QueryBuilder {
  select: (...args: unknown[]) => QueryBuilder
  insert: (payload: Record<string, unknown>) => QueryBuilder
  update: (payload: Record<string, unknown>) => QueryBuilder
  eq: () => QueryBuilder
  gte: () => QueryBuilder
  lte: () => QueryBuilder
  in: () => QueryBuilder
  order: () => QueryBuilder
  limit: () => QueryBuilder
  maybeSingle: () => Promise<{ data: unknown; error: null }>
  single: () => Promise<{ data: unknown; error: null }>
  then: (
    onFulfilled: (v: { data: unknown; error: null }) => unknown,
    onRejected?: (e: unknown) => unknown,
  ) => Promise<unknown>
}

function makeBuilder(table: string, state: RecordedTableState): QueryBuilder {
  let op: "select" | "insert" | "update" = "select"
  let lastInsert: Record<string, unknown> | null = null
  let lastUpdate: Record<string, unknown> | null = null

  const builder: QueryBuilder = {
    select(...args) {
      state.selectCalls.push(typeof args[0] === "string" ? (args[0] as string) : "*")
      return builder
    },
    insert(payload) {
      op = "insert"
      lastInsert = payload
      state.inserts.push(payload)
      return builder
    },
    update(payload) {
      op = "update"
      lastUpdate = payload
      state.updates.push(payload)
      return builder
    },
    eq: () => builder,
    gte: () => builder,
    lte: () => builder,
    in: () => builder,
    order: () => builder,
    limit: () => builder,
    maybeSingle: async () => resolve(),
    single: async () => resolve(),
    then(onFulfilled, onRejected) {
      return resolve().then(onFulfilled, onRejected)
    },
  }

  async function resolve(): Promise<{ data: unknown; error: null }> {
    if (op === "update") {
      // Echo back the encrypted update with all SELECT_COLUMNS the repo expects.
      return {
        data: {
          id: SCAN_ID,
          profile_id: PROFILE_ID,
          user_id: PROFILE_ID,
          content_type: "website_copy",
          original_text_enc: encryptForUser({
            userId: PROFILE_ID,
            plaintext: SCAN_PLAINTEXT,
            table: "scans",
            column: "original_text",
            rowId: SCAN_ID,
          }),
          rewritten_text_enc: (lastUpdate as Record<string, unknown>).rewritten_text_enc,
          flags_enc: null,
          source_url_enc: null,
          compliance_score: 30,
          flag_count: 0,
          high_risk_count: 0,
          medium_risk_count: 0,
          low_risk_count: 0,
          scan_duration_ms: 100,
          created_at: "2026-05-13T00:00:00Z",
        },
        error: null,
      }
    }
    if (op === "insert") {
      return { data: lastInsert, error: null }
    }
    // SELECT paths
    if (table === "profiles") {
      const clinic_name_enc = encryptForUser({
        userId: PROFILE_ID,
        plaintext: "Test Clinic",
        table: "profiles",
        column: "clinic_name",
        rowId: PROFILE_ID,
      })
      const treatments_enc = encryptJSONForUser({
        userId: PROFILE_ID,
        payload: ["PRP"],
        table: "profiles",
        column: "treatments",
        rowId: PROFILE_ID,
      })
      return {
        data: {
          id: PROFILE_ID,
          clinic_name_enc,
          treatments_enc,
          logo_url: null,
          subscription_status: "active",
          stripe_customer_id: null,
          stripe_subscription_id: null,
          is_beta_subscriber: false,
          beta_enrolled_at: null,
          cancelled_at: null,
          onboarding_complete: true,
          theme_preference: "light",
          created_at: "2026-05-13T00:00:00Z",
          updated_at: "2026-05-13T00:00:00Z",
        },
        error: null,
      }
    }
    if (table === "scans") {
      // getScan reads the encrypted row back. Return shape matches SELECT_COLUMNS.
      return {
        data: {
          id: SCAN_ID,
          profile_id: PROFILE_ID,
          user_id: PROFILE_ID,
          content_type: "website_copy",
          original_text_enc: encryptForUser({
            userId: PROFILE_ID,
            plaintext: SCAN_PLAINTEXT,
            table: "scans",
            column: "original_text",
            rowId: SCAN_ID,
          }),
          rewritten_text_enc: null,
          flags_enc: encryptJSONForUser({
            userId: PROFILE_ID,
            payload: [
              {
                banned_phrase: "FDA approved",
                alternative: "FDA-cleared",
                risk_level: "high",
              },
            ],
            table: "scans",
            column: "flags",
            rowId: SCAN_ID,
          }),
          source_url_enc: null,
          compliance_score: 30,
          flag_count: 1,
          high_risk_count: 1,
          medium_risk_count: 0,
          low_risk_count: 0,
          scan_duration_ms: 100,
          created_at: "2026-05-13T00:00:00Z",
        },
        error: null,
      }
    }
    return { data: null, error: null }
  }

  return builder
}

beforeEach(() => {
  resetState()
})

describe("POST /api/rewrite encryption round-trip", () => {
  it("reads encrypted scan, sends decrypted plaintext to Claude, writes rewritten_text_enc", async () => {
    const { POST } = await import("@/app/api/rewrite/route")
    const req = new Request("http://localhost/api/rewrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scan_id: SCAN_ID }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)

    // Claude saw decrypted plaintext, not a v1u. envelope.
    expect(anthropicSeen.input).toBe(SCAN_PLAINTEXT)
    expect(anthropicSeen.input).not.toMatch(/^v1u\./)

    // The DB write must be the encrypted envelope on `rewritten_text_enc`,
    // never the dropped plaintext `rewritten_text` column.
    const updates = tableState.scans?.updates ?? []
    expect(updates.length).toBeGreaterThanOrEqual(1)
    const update = updates[0] as Record<string, unknown>
    expect(update.rewritten_text_enc).toMatch(/^v1u\./)
    expect(update).not.toHaveProperty("rewritten_text")
  })
})
