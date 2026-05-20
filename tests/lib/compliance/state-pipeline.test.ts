import { describe, it, expect, vi, beforeEach } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"

// ---------------------------------------------------------------------------
// Mocks must be declared before importing the module under test. We mock the
// entire compliance-scraper surface used by runStateRulesPipeline, plus the
// state-scraper aggregator so we control which sources surface and what
// links they return.
// ---------------------------------------------------------------------------

vi.mock("@/lib/compliance-scraper", () => ({
  safeFetchHtml: vi.fn(),
  extractArticleText: vi.fn(),
  extractRulesFromText: vi.fn(),
  insertRulesWithDedup: vi.fn(),
  upsertEnforcementAction: vi.fn(),
}))

vi.mock("@/lib/compliance/state-scraper", () => ({
  scrapeAllImplementedStates: vi.fn(),
}))

import {
  safeFetchHtml,
  extractRulesFromText,
  insertRulesWithDedup,
  upsertEnforcementAction,
} from "@/lib/compliance-scraper"
import { scrapeAllImplementedStates } from "@/lib/compliance/state-scraper"
import { runStateRulesPipeline } from "@/lib/compliance/state-pipeline"
import type { StateSource } from "@/lib/compliance/state-sources"

const mockedFetch = safeFetchHtml as unknown as ReturnType<typeof vi.fn>
const mockedExtractRules = extractRulesFromText as unknown as ReturnType<typeof vi.fn>
const mockedInsertRules = insertRulesWithDedup as unknown as ReturnType<typeof vi.fn>
const mockedUpsertAction = upsertEnforcementAction as unknown as ReturnType<typeof vi.fn>
const mockedScrapeAll = scrapeAllImplementedStates as unknown as ReturnType<typeof vi.fn>

// Stand-in service-role Supabase client. The pipeline does not touch it
// directly - it only passes it through to upsertEnforcementAction +
// insertRulesWithDedup, both of which are mocked.
const fakeSupabase = {} as unknown as SupabaseClient

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function implementedSource(overrides: Partial<StateSource> = {}): StateSource {
  return {
    state: "FL",
    stateName: "Florida",
    kind: "medical_board",
    name: "Florida Board of Medicine",
    url: "https://example.test/fl/listing",
    listSelector: "a[href]",
    detailSelector: "article, main",
    status: "implemented",
    regenRelevant: "high",
    ...overrides,
  }
}

function scaffoldedSource(overrides: Partial<StateSource> = {}): StateSource {
  return {
    state: "AL",
    stateName: "Alabama",
    kind: "medical_board",
    name: "Alabama Board of Medical Examiners",
    url: "https://example.test/al/listing",
    status: "scaffolded",
    regenRelevant: "low",
    ...overrides,
  }
}

const sampleArticleHtml = `<!doctype html>
  <html><body>
    <article>
      The Florida Board of Medicine entered a final order against the
      respondent for marketing unapproved stem cell therapy as a cure for
      arthritis, in violation of the Florida Medical Practice Act. The order
      requires removal of all claims, payment of administrative costs, and
      probationary supervision for twelve months. Future advertising must
      include a disclaimer that no FDA-approved indication exists for the
      treatments described.
    </article>
  </body></html>`

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("runStateRulesPipeline - scaffolded sources", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("skips states with skipped_scaffolded status (no detail fetch, no result row)", async () => {
    mockedScrapeAll.mockResolvedValueOnce([
      {
        source: scaffoldedSource(),
        status: "skipped_scaffolded",
        links: [],
      },
    ])

    const result = await runStateRulesPipeline(fakeSupabase)

    expect(result.perState).toHaveLength(0)
    expect(result.totalNewRules).toBe(0)
    expect(result.totalDetailsProcessed).toBe(0)
    // Critical: no detail fetch, no Claude call, no DB write attempted.
    expect(mockedFetch).not.toHaveBeenCalled()
    expect(mockedExtractRules).not.toHaveBeenCalled()
    expect(mockedInsertRules).not.toHaveBeenCalled()
    expect(mockedUpsertAction).not.toHaveBeenCalled()
  })

  it("only operates on implemented sources when both kinds are present", async () => {
    mockedScrapeAll.mockResolvedValueOnce([
      {
        source: scaffoldedSource(),
        status: "skipped_scaffolded",
        links: [],
      },
      {
        source: implementedSource(),
        status: "ok",
        links: [
          { url: "https://example.test/fl/order-001", title: "Final Order 001" },
        ],
      },
    ])
    mockedFetch.mockResolvedValueOnce(sampleArticleHtml)
    mockedUpsertAction.mockResolvedValueOnce("action-1")
    mockedExtractRules.mockResolvedValueOnce([
      {
        banned_phrase: "stem cells cure arthritis",
        banned_phrase_variants: ["stem cells will cure arthritis"],
        compliant_alternative: "stem cell therapy is being studied for joint conditions",
        risk_level: "high",
        category: "health_claims",
        applies_to: ["stem_cell"],
        title: "Cure claim cited in FL order",
        description: "FL board cited a clinic for cure-of-arthritis stem cell claims.",
      },
    ])
    mockedInsertRules.mockResolvedValueOnce(1)

    const result = await runStateRulesPipeline(fakeSupabase)

    // Only the implemented source produces a per-state result.
    expect(result.perState).toHaveLength(1)
    expect(result.perState[0].state).toBe("FL")
    expect(result.perState[0].newRules).toBe(1)
    expect(result.totalNewRules).toBe(1)
    expect(result.totalDetailsProcessed).toBe(1)
  })
})

describe("runStateRulesPipeline - per-link error capture", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("catches per-link safeFetchHtml errors and reports them in linkErrors, never throws", async () => {
    mockedScrapeAll.mockResolvedValueOnce([
      {
        source: implementedSource(),
        status: "ok",
        links: [
          { url: "https://example.test/fl/bad-1", title: "Bad 1" },
          { url: "https://example.test/fl/bad-2", title: "Bad 2" },
        ],
      },
    ])
    // First link: safeFetchHtml throws (network error).
    // Second link: safeFetchHtml returns null (assertSafeUrl blocked).
    mockedFetch
      .mockRejectedValueOnce(new Error("ECONNRESET"))
      .mockResolvedValueOnce(null)

    // Pipeline must not throw despite both links failing.
    const result = await runStateRulesPipeline(fakeSupabase)

    expect(result.perState).toHaveLength(1)
    const fl = result.perState[0]
    expect(fl.state).toBe("FL")
    expect(fl.linksDiscovered).toBe(2)
    // detailsProcessed counts links that produced at least an article-text
    // pass (rules array may be empty); both links failed before that point.
    expect(fl.detailsProcessed).toBe(0)
    expect(fl.newRules).toBe(0)
    expect(fl.linkErrors).toBeDefined()
    expect(fl.linkErrors).toHaveLength(2)
    expect(fl.linkErrors![0].reason).toContain("ECONNRESET")
    expect(fl.linkErrors![1].reason).toContain("safeFetchHtml returned null")
    // Top-level error field stays unset - this is per-link, not whole-state.
    expect(fl.error).toBeUndefined()
    // No DB writes attempted because no article text was extracted.
    expect(mockedUpsertAction).not.toHaveBeenCalled()
    expect(mockedExtractRules).not.toHaveBeenCalled()
    expect(mockedInsertRules).not.toHaveBeenCalled()
  })

  it("catches upsertEnforcementAction returning null and records linkError without throwing", async () => {
    mockedScrapeAll.mockResolvedValueOnce([
      {
        source: implementedSource(),
        status: "ok",
        links: [{ url: "https://example.test/fl/order-x", title: "Order X" }],
      },
    ])
    mockedFetch.mockResolvedValueOnce(sampleArticleHtml)
    mockedUpsertAction.mockResolvedValueOnce(null)

    const result = await runStateRulesPipeline(fakeSupabase)

    const fl = result.perState[0]
    expect(fl.linkErrors).toBeDefined()
    expect(fl.linkErrors![0].reason).toContain("upsertEnforcementAction")
    expect(fl.newRules).toBe(0)
    expect(mockedExtractRules).not.toHaveBeenCalled()
    expect(mockedInsertRules).not.toHaveBeenCalled()
  })

  it("catches insertRulesWithDedup throwing and continues with subsequent links", async () => {
    mockedScrapeAll.mockResolvedValueOnce([
      {
        source: implementedSource(),
        status: "ok",
        links: [
          { url: "https://example.test/fl/o-1", title: "O 1" },
          { url: "https://example.test/fl/o-2", title: "O 2" },
        ],
      },
    ])
    // Both links fetch + extract successfully.
    mockedFetch
      .mockResolvedValueOnce(sampleArticleHtml)
      .mockResolvedValueOnce(sampleArticleHtml)
    mockedUpsertAction
      .mockResolvedValueOnce("action-1")
      .mockResolvedValueOnce("action-2")
    mockedExtractRules
      .mockResolvedValueOnce([
        {
          banned_phrase: "x",
          banned_phrase_variants: ["x"],
          compliant_alternative: "y",
          risk_level: "high",
          category: "health_claims",
          applies_to: ["stem_cell"],
          title: "t",
          description: "d",
        },
      ])
      .mockResolvedValueOnce([
        {
          banned_phrase: "z",
          banned_phrase_variants: ["z"],
          compliant_alternative: "y",
          risk_level: "high",
          category: "health_claims",
          applies_to: ["stem_cell"],
          title: "t",
          description: "d",
        },
      ])
    // First insert throws, second succeeds.
    mockedInsertRules
      .mockRejectedValueOnce(new Error("supabase write timed out"))
      .mockResolvedValueOnce(1)

    const result = await runStateRulesPipeline(fakeSupabase)

    const fl = result.perState[0]
    expect(fl.linkErrors).toBeDefined()
    expect(fl.linkErrors).toHaveLength(1)
    expect(fl.linkErrors![0].reason).toContain("supabase write timed out")
    // Second link survives, so we expect one new rule and one details_processed.
    expect(fl.newRules).toBe(1)
    expect(fl.detailsProcessed).toBe(1)
  })

  it("reports a state with fetch_failed status via top-level error, not linkErrors", async () => {
    mockedScrapeAll.mockResolvedValueOnce([
      {
        source: implementedSource(),
        status: "fetch_failed",
        links: [],
        error: "HTTP 502",
      },
    ])

    const result = await runStateRulesPipeline(fakeSupabase)
    const fl = result.perState[0]
    expect(fl.error).toBe("HTTP 502")
    expect(fl.linksDiscovered).toBe(0)
    expect(fl.linkErrors).toBeUndefined()
    // No detail-page work attempted when the listing itself failed.
    expect(mockedFetch).not.toHaveBeenCalled()
    expect(mockedUpsertAction).not.toHaveBeenCalled()
  })
})

describe("runStateRulesPipeline - per-state link cap", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("processes at most MAX_DETAILS_PER_STATE links per state", async () => {
    // Surface 6 links - the pipeline must only process the first 3.
    const links = Array.from({ length: 6 }, (_, i) => ({
      url: `https://example.test/fl/order-${i}`,
      title: `Order ${i}`,
    }))
    mockedScrapeAll.mockResolvedValueOnce([
      { source: implementedSource(), status: "ok", links },
    ])
    mockedFetch.mockResolvedValue(sampleArticleHtml)
    mockedUpsertAction.mockResolvedValue("action-id")
    mockedExtractRules.mockResolvedValue([])
    mockedInsertRules.mockResolvedValue(0)

    const result = await runStateRulesPipeline(fakeSupabase)

    expect(result.perState[0].linksDiscovered).toBe(6)
    expect(result.perState[0].detailsProcessed).toBe(3)
    expect(mockedFetch).toHaveBeenCalledTimes(3)
  })
})
