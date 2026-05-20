import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock safeFetchHtml so we can assert (a) scaffolded sources never call it,
// and (b) implemented sources do call it. The mock must be hoisted via
// vi.mock for the dynamic re-import inside the per-call test to pick it up.
vi.mock("@/lib/compliance-scraper", () => ({
  safeFetchHtml: vi.fn(),
}))

import { safeFetchHtml } from "@/lib/compliance-scraper"
import { scrapeStateSource } from "@/lib/compliance/state-scraper"
import { STATE_SOURCES, type StateSource } from "@/lib/compliance/state-sources"

const mockedFetch = safeFetchHtml as unknown as ReturnType<typeof vi.fn>

describe("scrapeStateSource - scaffolded short-circuit", () => {
  beforeEach(() => {
    mockedFetch.mockReset()
  })

  it("returns skipped_scaffolded and does NOT call safeFetchHtml for a scaffolded source", async () => {
    const scaffolded: StateSource = {
      state: "ZZ",
      stateName: "Test Scaffold",
      kind: "medical_board",
      name: "Test scaffolded source",
      url: "https://example.test/scaffold",
      status: "scaffolded",
      regenRelevant: "low",
      notes: "test fixture",
    }

    const result = await scrapeStateSource(scaffolded)

    expect(result.status).toBe("skipped_scaffolded")
    expect(result.links).toEqual([])
    expect(mockedFetch).not.toHaveBeenCalled()
  })

  it("returns skipped_scaffolded and does NOT call safeFetchHtml for needs_research", async () => {
    const needsResearch: StateSource = {
      state: "ZZ",
      stateName: "Test Needs Research",
      kind: "medical_board",
      name: "Test needs-research source",
      url: "https://example.test/needs-research",
      status: "needs_research",
      regenRelevant: "low",
    }

    const result = await scrapeStateSource(needsResearch)

    expect(result.status).toBe("skipped_scaffolded")
    expect(mockedFetch).not.toHaveBeenCalled()
  })
})

describe("scrapeStateSource - implemented source happy path", () => {
  beforeEach(() => {
    mockedFetch.mockReset()
  })

  it("fetches the listing, extracts links matching listSelector, and resolves them to absolute URLs", async () => {
    mockedFetch.mockResolvedValueOnce(`
      <html><body>
        <a href="/orders/2026-001.pdf">2026-001 Final Order</a>
        <a href="https://example.test/orders/2026-002.pdf">2026-002 Final Order</a>
        <a href="mailto:contact@example.test">Email us</a>
        <a href="javascript:void(0)">JS link</a>
        <a>No href</a>
      </body></html>
    `)

    const implemented: StateSource = {
      state: "ZZ",
      stateName: "Test Implemented",
      kind: "medical_board",
      name: "Test implemented source",
      url: "https://example.test/listing",
      listSelector: "a[href]",
      status: "implemented",
      regenRelevant: "medium",
    }

    const result = await scrapeStateSource(implemented)

    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(result.status).toBe("ok")
    // mailto:, javascript:, and no-href anchors should be dropped.
    // The two PDF links should both resolve to absolute URLs.
    const urls = result.links.map((l) => l.url)
    expect(urls).toContain("https://example.test/orders/2026-001.pdf")
    expect(urls).toContain("https://example.test/orders/2026-002.pdf")
    expect(urls).not.toContain("mailto:contact@example.test")
    expect(urls.every((u) => u.startsWith("http://") || u.startsWith("https://"))).toBe(true)
    const firstPdf = result.links.find((l) => l.url === "https://example.test/orders/2026-001.pdf")
    expect(firstPdf?.title).toBe("2026-001 Final Order")
  })

  it("returns fetch_failed (not throw) when safeFetchHtml returns null", async () => {
    mockedFetch.mockResolvedValueOnce(null)

    const implemented: StateSource = {
      state: "ZZ",
      stateName: "Test Implemented",
      kind: "medical_board",
      name: "Test implemented source",
      url: "https://example.test/listing",
      listSelector: "a[href]",
      status: "implemented",
      regenRelevant: "low",
    }

    const result = await scrapeStateSource(implemented)
    expect(result.status).toBe("fetch_failed")
    expect(result.error).toBeTruthy()
    expect(result.links).toEqual([])
  })

  it("returns fetch_failed (not throw) when safeFetchHtml rejects", async () => {
    mockedFetch.mockRejectedValueOnce(new Error("network down"))

    const implemented: StateSource = {
      state: "ZZ",
      stateName: "Test Implemented",
      kind: "medical_board",
      name: "Test implemented source",
      url: "https://example.test/listing",
      listSelector: "a[href]",
      status: "implemented",
      regenRelevant: "low",
    }

    const result = await scrapeStateSource(implemented)
    expect(result.status).toBe("fetch_failed")
    expect(result.error).toContain("network down")
  })

  it("returns empty when listSelector matches no links", async () => {
    mockedFetch.mockResolvedValueOnce("<html><body><p>no links here</p></body></html>")

    const implemented: StateSource = {
      state: "ZZ",
      stateName: "Test Implemented",
      kind: "medical_board",
      name: "Test implemented source",
      url: "https://example.test/listing",
      listSelector: "a[href*='action']",
      status: "implemented",
      regenRelevant: "low",
    }

    const result = await scrapeStateSource(implemented)
    expect(result.status).toBe("empty")
    expect(result.links).toEqual([])
  })

  it("caps results at 50 links", async () => {
    const anchors = Array.from(
      { length: 80 },
      (_, i) => `<a href="/orders/${i}.pdf">Order ${i}</a>`,
    ).join("\n")
    mockedFetch.mockResolvedValueOnce(`<html><body>${anchors}</body></html>`)

    const implemented: StateSource = {
      state: "ZZ",
      stateName: "Test Implemented",
      kind: "medical_board",
      name: "Test implemented source",
      url: "https://example.test/listing",
      listSelector: "a[href]",
      status: "implemented",
      regenRelevant: "low",
    }

    const result = await scrapeStateSource(implemented)
    expect(result.status).toBe("ok")
    expect(result.links.length).toBe(50)
  })
})

describe("STATE_SOURCES registry", () => {
  const ALL_50_STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  ]

  it("contains an entry for every US state (50)", () => {
    const present = new Set(STATE_SOURCES.map((s) => s.state))
    for (const code of ALL_50_STATES) {
      expect(present.has(code), `missing state: ${code}`).toBe(true)
    }
    // Each registry entry must use one of the known 50 codes
    // (no typos like "FA" / "TX1").
    for (const s of STATE_SOURCES) {
      expect(
        ALL_50_STATES.includes(s.state),
        `unexpected state code: ${s.state}`,
      ).toBe(true)
    }
  })

  it("sets regenRelevant on every entry", () => {
    for (const s of STATE_SOURCES) {
      expect(
        s.regenRelevant,
        `${s.state}/${s.kind} missing regenRelevant`,
      ).toBeDefined()
      expect(["high", "medium", "low"]).toContain(s.regenRelevant)
    }
  })

  it("requires listSelector on every implemented entry", () => {
    for (const s of STATE_SOURCES) {
      if (s.status === "implemented") {
        expect(
          s.listSelector,
          `${s.state}/${s.kind} is implemented but has no listSelector`,
        ).toBeTruthy()
      }
    }
  })

  it("includes at least one implemented entry for the 5 explicit asks (FL, CA, TX, NY, UT)", () => {
    const required = ["FL", "CA", "TX", "NY", "UT"]
    for (const code of required) {
      const hasImpl = STATE_SOURCES.some(
        (s) => s.state === code && s.status === "implemented",
      )
      expect(hasImpl, `${code} has no implemented source`).toBe(true)
    }
  })
})
