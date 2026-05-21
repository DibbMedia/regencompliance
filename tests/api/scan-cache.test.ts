/**
 * Integration test for POST /api/scan cache hit + miss paths.
 *
 * Post-cutover (migration 036) the cache lookup must:
 *   1. Select only columns that still exist in `scans` (the *_enc set + the
 *      plaintext pass-throughs). Pre-fix the route asked for the dropped
 *      `original_text`/`rewritten_text`/`flags`/`source_url` columns and
 *      every authenticated scan returned PGRST204.
 *   2. Decrypt the cached row through the scans repo (decryptScanRow) so the
 *      response body carries plaintext fields, not v1u. envelopes.
 *   3. Skip the Anthropic call when a cache row exists, hit it otherwise.
 *
 * We exercise both branches with an in-memory recorder.
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import {
  encryptForUser,
  encryptJSONForUser,
} from "@/lib/crypto"

const VALID_KEY = "a".repeat(64)
const PROFILE_ID = "22222222-2222-4222-8222-222222222222"
const SCAN_ID = "33333333-3333-4333-8333-333333333333"

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
  cacheHit.value = false
  anthropicCalls.count = 0
}

const cacheHit = { value: false }
const anthropicCalls = { count: 0 }

// --- mocks ---------------------------------------------------------------

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: true, remaining: 999 }),
}))

vi.mock("@/lib/impersonation", () => ({
  requireWriteMode: async () => null,
}))

vi.mock("@/lib/phi-filter", () => ({
  detectPhi: () => ({ detected: false, patterns: [] }),
  PHI_ERROR_MESSAGE: "PHI detected",
  // Pass-through stub - this test doesn't exercise the output redactor.
  redactPhiInOutput: (input: {
    summary?: string | null
    flags?: Array<{ matched_text?: string;[k: string]: unknown }>
  }) => ({
    hadHits: false,
    hits: [],
    cleanedText: input.summary ?? "",
    cleanedFlags: input.flags,
  }),
}))

vi.mock("@/lib/api-costs", () => ({
  trackApiUsage: () => undefined,
}))

vi.mock("@/lib/error-tracking", () => ({
  captureError: () => undefined,
}))

vi.mock("@/lib/scan-cache", () => ({
  hashContent: (text: string) => `hash-${text.length}`,
}))

vi.mock("@/lib/compliance-bible", () => ({
  getComplianceBiblePrompt: () => "prompt",
}))

vi.mock("@/lib/compliance-rules-cache", () => ({
  getActiveComplianceRules: async () => [],
}))

vi.mock("@/lib/supabase/resolve-profile", () => ({
  effectiveProfileId: async () => PROFILE_ID,
}))

vi.mock("@/lib/anthropic", () => ({
  anthropic: {
    messages: {
      create: async () => {
        anthropicCalls.count++
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                compliance_score: 88,
                summary: "Mostly clean.",
                flags: [],
              }),
            },
          ],
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
  let lastSelectArg = ""

  const builder: QueryBuilder = {
    select(...args) {
      lastSelectArg = typeof args[0] === "string" ? (args[0] as string) : "*"
      state.selectCalls.push(lastSelectArg)
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

  function makeEncryptedScanRow() {
    return {
      id: SCAN_ID,
      profile_id: PROFILE_ID,
      user_id: PROFILE_ID,
      content_type: "website_copy",
      original_text_enc: encryptForUser({
        userId: PROFILE_ID,
        plaintext: "cached scan body",
        table: "scans",
        column: "original_text",
        rowId: SCAN_ID,
      }),
      rewritten_text_enc: null,
      flags_enc: encryptJSONForUser({
        userId: PROFILE_ID,
        payload: [],
        table: "scans",
        column: "flags",
        rowId: SCAN_ID,
      }),
      source_url_enc: null,
      compliance_score: 91,
      flag_count: 0,
      high_risk_count: 0,
      medium_risk_count: 0,
      low_risk_count: 0,
      scan_duration_ms: 1234,
      created_at: "2026-05-13T00:00:00Z",
    }
  }

  async function resolve(): Promise<{ data: unknown; error: null }> {
    if (op === "insert") {
      if (table === "scans" && lastInsert) {
        return {
          data: {
            ...lastInsert,
            id: (lastInsert.id as string | undefined) ?? SCAN_ID,
            created_at: "2026-05-13T00:00:00Z",
          },
          error: null,
        }
      }
      return { data: lastInsert, error: null }
    }
    if (op === "update") {
      return { data: lastUpdate, error: null }
    }
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
      return { data: cacheHit.value ? makeEncryptedScanRow() : null, error: null }
    }
    return { data: null, error: null }
  }

  return builder
}

beforeEach(() => {
  resetState()
})

describe("POST /api/scan cache lookup post-cutover", () => {
  it("cache miss: selects only existing columns, hits Claude, persists encrypted scan", async () => {
    cacheHit.value = false
    const { POST } = await import("@/app/api/scan/route")
    const req = new Request("http://localhost/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Some marketing copy.", content_type: "website_copy" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)

    // The select() arg for the cache lookup must NOT include any of the
    // plaintext columns dropped at cutover.
    const scanSelects = tableState.scans?.selectCalls ?? []
    expect(scanSelects.length).toBeGreaterThan(0)
    const cacheSelect = scanSelects[0]
    expect(cacheSelect).not.toMatch(/(^|,\s*|"\s*)original_text(\s*,|"|\s*$)/)
    expect(cacheSelect).not.toMatch(/(^|,\s*|"\s*)rewritten_text(\s*,|"|\s*$)/)
    expect(cacheSelect).not.toMatch(/(^|,\s*|"\s*)flags(\s*,|"|\s*$)/)
    expect(cacheSelect).not.toMatch(/(^|,\s*|"\s*)source_url(\s*,|"|\s*$)/)
    // But must include the *_enc set.
    expect(cacheSelect).toContain("original_text_enc")
    expect(cacheSelect).toContain("flags_enc")

    // Cache miss -> Claude ran.
    expect(anthropicCalls.count).toBe(1)

    // Insert came in encrypted.
    const insert = (tableState.scans?.inserts ?? [])[0]
    expect(insert).toBeDefined()
    expect((insert as Record<string, unknown>).original_text_enc).toMatch(/^v1u\./)
  })

  it("cache hit: returns decrypted plaintext, skips Claude", async () => {
    cacheHit.value = true
    const { POST } = await import("@/app/api/scan/route")
    const req = new Request("http://localhost/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Some marketing copy.", content_type: "website_copy" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()

    // No Claude call on a cache hit.
    expect(anthropicCalls.count).toBe(0)
    // Body carries the decrypted plaintext, not the v1u. envelope.
    expect(body.original_text).toBe("cached scan body")
    expect(body.cached).toBe(true)
    expect(body.compliance_score).toBe(91)
  })
})
