import { describe, it, expect, vi, beforeEach } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"

// Mock Anthropic so the semantic-dedup Layer 3 in insertRulesWithDedup never
// hits the real API. Default answer is "NO" so a candidate that survives
// Layers 1+2 reaches the insert path.
vi.mock("@/lib/anthropic", () => ({
  anthropic: {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "NO" }],
      }),
    },
  },
}))

import {
  insertRulesWithDedup,
  normalizePhrase,
  type ExtractedRule,
} from "@/lib/compliance-scraper"

// ---------------------------------------------------------------------------
// Mock Supabase client tailored to the compliance_rules surface used by
// insertRulesWithDedup. Tracks inserts, updates, and the seed rows for select.
// ---------------------------------------------------------------------------

interface MockRow {
  id: string
  banned_phrase: string
  category: string | null
  source_date: string | null
  created_at?: string
  [key: string]: unknown
}

interface UpdateCall {
  id: string
  patch: Record<string, unknown>
  ltSourceDate?: string
  applied: boolean
}

interface InsertCall {
  payload: Record<string, unknown>
}

function makeMock(seedRows: MockRow[]) {
  const rows: MockRow[] = seedRows.map((r) => ({ ...r }))
  const updates: UpdateCall[] = []
  const inserts: InsertCall[] = []

  let nextId = 1000

  function fromCompliance() {
    return {
      select(_cols: string) {
        // SELECT path - returns rows with order/limit support as no-ops.
        const builder = {
          order() {
            return builder
          },
          limit() {
            return Promise.resolve({ data: rows, error: null })
          },
          eq() {
            return builder
          },
        }
        return builder
      },
      insert(payload: Record<string, unknown>) {
        inserts.push({ payload })
        const id = `row-${nextId++}`
        const inserted: MockRow = {
          id,
          banned_phrase: payload.banned_phrase as string,
          category: (payload.category as string) ?? null,
          source_date: (payload.source_date as string) ?? null,
        }
        rows.push(inserted)
        // .select('id').single() chain
        const chain = {
          select() {
            return {
              single: async () => ({ data: { id }, error: null }),
            }
          },
        }
        return chain
      },
      update(patch: Record<string, unknown>) {
        const call: UpdateCall = { id: "", patch, applied: false }
        updates.push(call)
        const chain = {
          eq(_col: string, val: string) {
            call.id = val
            return chain
          },
          lt(_col: string, val: string) {
            call.ltSourceDate = val
            // Apply the update if the row matches the lt() guard.
            const target = rows.find((r) => r.id === call.id)
            if (target) {
              const existingDate = target.source_date
              const passes = !existingDate || existingDate < val
              if (passes) {
                Object.assign(target, patch)
                call.applied = true
              }
            }
            return Promise.resolve({ data: null, error: null })
          },
        }
        return chain
      },
    }
  }

  const client = {
    from(table: string) {
      if (table === "compliance_rules") return fromCompliance()
      throw new Error(`unexpected table: ${table}`)
    },
  } as unknown as SupabaseClient

  return { client, rows, updates, inserts }
}

function makeRule(overrides: Partial<ExtractedRule> = {}): ExtractedRule {
  return {
    banned_phrase: "cures cancer",
    banned_phrase_variants: ["cures cancer"],
    compliant_alternative: "may support wellness as part of a balanced lifestyle",
    risk_level: "high",
    category: "health_claims",
    applies_to: ["stem_cell"],
    title: "Test",
    description: "Test rule",
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("normalizePhrase", () => {
  it("lowercases", () => {
    expect(normalizePhrase("CURES Cancer")).toBe("cures cancer")
  })

  it("collapses internal whitespace runs", () => {
    expect(normalizePhrase("cures    cancer")).toBe("cures cancer")
  })

  it("trims leading and trailing whitespace", () => {
    expect(normalizePhrase("  cures cancer  ")).toBe("cures cancer")
  })

  it("collapses mixed whitespace types (tabs, newlines)", () => {
    expect(normalizePhrase("cures\t\ncancer")).toBe("cures cancer")
  })

  it("treats case + whitespace variations as the same key", () => {
    const a = normalizePhrase("CURES   Cancer")
    const b = normalizePhrase(" cures cancer ")
    const c = normalizePhrase("Cures\tCancer")
    expect(a).toBe(b)
    expect(b).toBe(c)
  })
})

describe("insertRulesWithDedup - exact dedup + freshness", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("inserts a fresh rule when no matches exist", async () => {
    const { client, inserts } = makeMock([])
    const count = await insertRulesWithDedup(
      [makeRule({ banned_phrase: "completely novel claim phrase xyz" })],
      "https://example.com/article",
      "Test Source",
      "2026-05-19",
      client,
    )
    expect(count).toBe(1)
    expect(inserts).toHaveLength(1)
    expect(inserts[0].payload.banned_phrase).toBe("completely novel claim phrase xyz")
    expect(inserts[0].payload.source_date).toBe("2026-05-19")
  })

  it("skips an exact-duplicate phrase (returns 0 new inserts)", async () => {
    const { client, inserts } = makeMock([
      {
        id: "seed-1",
        banned_phrase: "cures cancer",
        category: "health_claims",
        source_date: "2026-04-01",
      },
    ])
    const count = await insertRulesWithDedup(
      [makeRule({ banned_phrase: "cures cancer" })],
      "https://example.com/article",
      "Test Source",
      "2026-05-19",
      client,
    )
    expect(count).toBe(0)
    expect(inserts).toHaveLength(0)
  })

  it("treats case + whitespace variants as exact duplicates", async () => {
    const { client, inserts } = makeMock([
      {
        id: "seed-1",
        banned_phrase: "Cures Cancer",
        category: "health_claims",
        source_date: "2026-04-01",
      },
    ])
    // Candidate has different case + extra whitespace + trailing space.
    const count = await insertRulesWithDedup(
      [makeRule({ banned_phrase: "  CURES   cancer " })],
      "https://example.com/article",
      "Test Source",
      "2026-05-19",
      client,
    )
    expect(count).toBe(0)
    expect(inserts).toHaveLength(0)
  })

  it("bumps source_date forward on exact-dup re-confirmation", async () => {
    const { client, updates, rows } = makeMock([
      {
        id: "seed-1",
        banned_phrase: "cures cancer",
        category: "health_claims",
        source_date: "2026-04-01",
      },
    ])
    await insertRulesWithDedup(
      [makeRule({ banned_phrase: "cures cancer" })],
      "https://example.com/article",
      "Test Source",
      "2026-05-19",
      client,
    )
    expect(updates).toHaveLength(1)
    expect(updates[0].id).toBe("seed-1")
    expect(updates[0].ltSourceDate).toBe("2026-05-19")
    expect(updates[0].applied).toBe(true)
    expect(updates[0].patch.source_date).toBe("2026-05-19")
    // updated_at should also be set explicitly (best-effort, as the spec asks).
    expect(updates[0].patch.updated_at).toBeDefined()
    // Row in our mock reflects the new source_date.
    expect(rows.find((r) => r.id === "seed-1")?.source_date).toBe("2026-05-19")
  })

  it("does NOT bump source_date when candidate is older than existing", async () => {
    const { client, updates, inserts, rows } = makeMock([
      {
        id: "seed-1",
        banned_phrase: "cures cancer",
        category: "health_claims",
        source_date: "2026-06-01",
      },
    ])
    await insertRulesWithDedup(
      [makeRule({ banned_phrase: "cures cancer" })],
      "https://example.com/article",
      "Test Source",
      "2026-05-19",
      client,
    )
    // Still counted as exact-dup, but no UPDATE fired and no INSERT either:
    // the in-memory guard skips the round trip when candidate isn't newer.
    expect(inserts).toHaveLength(0)
    expect(updates).toHaveLength(0)
    expect(rows.find((r) => r.id === "seed-1")?.source_date).toBe("2026-06-01")
  })
})

describe("insertRulesWithDedup - near-dup detection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("skips a near-dup substring within the same category", async () => {
    const { client, inserts } = makeMock([
      {
        id: "seed-1",
        banned_phrase: "cure cancer",
        category: "health_claims",
        source_date: "2026-04-01",
      },
    ])
    // "cures cancer" contains "cure cancer" once lowercased - same category.
    const count = await insertRulesWithDedup(
      [makeRule({ banned_phrase: "cures cancer", category: "health_claims" })],
      "https://example.com/article",
      "Test Source",
      "2026-05-19",
      client,
    )
    expect(count).toBe(0)
    expect(inserts).toHaveLength(0)
  })

  it("DOES insert a near-dup substring when category differs", async () => {
    const { client, inserts } = makeMock([
      {
        id: "seed-1",
        banned_phrase: "cure cancer",
        category: "health_claims",
        source_date: "2026-04-01",
      },
    ])
    // Same substring relationship but different category - should insert.
    // Use a phrase that the token-overlap pre-filter in isDuplicateRule
    // won't accidentally flag: only "cure" and "cancer" overlap; below
    // the 0.4 Jaccard threshold once stop-words and short tokens are stripped.
    // Actually "cures cancer" tokenizes to {cures, cancer} and "cure cancer"
    // tokenizes to {cure, cancer} - Jaccard = 1/3 = 0.33 < 0.4, so OK.
    const count = await insertRulesWithDedup(
      [makeRule({ banned_phrase: "cures cancer", category: "efficacy" })],
      "https://example.com/article",
      "Test Source",
      "2026-05-19",
      client,
    )
    expect(count).toBe(1)
    expect(inserts).toHaveLength(1)
  })

  it("skips when existing phrase contains candidate (reverse substring)", async () => {
    const { client, inserts } = makeMock([
      {
        id: "seed-1",
        banned_phrase: "guaranteed to cure cancer in 30 days",
        category: "health_claims",
        source_date: "2026-04-01",
      },
    ])
    const count = await insertRulesWithDedup(
      [makeRule({ banned_phrase: "cure cancer in 30 days", category: "health_claims" })],
      "https://example.com/article",
      "Test Source",
      "2026-05-19",
      client,
    )
    expect(count).toBe(0)
    expect(inserts).toHaveLength(0)
  })
})

describe("insertRulesWithDedup - summary log", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("logs a dedup summary with inserted/exact_dup/near_dup counts", async () => {
    const { client } = makeMock([
      {
        id: "seed-1",
        banned_phrase: "cures cancer",
        category: "health_claims",
        source_date: "2026-04-01",
      },
      {
        id: "seed-2",
        banned_phrase: "cure heart disease",
        category: "health_claims",
        source_date: "2026-04-01",
      },
    ])
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {})
    await insertRulesWithDedup(
      [
        makeRule({ banned_phrase: "cures cancer" }), // exact dup
        makeRule({ banned_phrase: "cures heart disease", category: "health_claims" }), // near dup
        makeRule({ banned_phrase: "totally unrelated novel xyz claim phrase" }), // insert
      ],
      "https://example.com/article",
      "Test Source",
      "2026-05-19",
      client,
    )
    const summaryCall = infoSpy.mock.calls.find((c) =>
      String(c[0]).includes("[scrape-rules] dedup summary"),
    )
    expect(summaryCall).toBeDefined()
    expect(String(summaryCall![0])).toContain("inserted=1")
    expect(String(summaryCall![0])).toContain("exact_dup=1")
    expect(String(summaryCall![0])).toContain("near_dup=1")
    infoSpy.mockRestore()
  })
})
