import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the Anthropic client so extractRulesFromText never hits the real API.
// Same pattern as tests/lib/compliance-scraper.test.ts - tests set the
// resolved value per-case via mockedCreate.mockResolvedValue(...).
vi.mock("@/lib/anthropic", () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}))

import { anthropic } from "@/lib/anthropic"
import { extractRulesFromText, type ExtractedRule } from "@/lib/compliance-scraper"

const mockedCreate = anthropic.messages.create as unknown as ReturnType<typeof vi.fn>

function rulePayload(overrides: Partial<ExtractedRule> = {}): ExtractedRule {
  return {
    banned_phrase: "cures arthritis",
    banned_phrase_variants: ["cure arthritis", "heals arthritis"],
    compliant_alternative: "may help with joint discomfort (off-label)",
    risk_level: "high",
    category: "efficacy",
    applies_to: ["stem_cell"],
    title: "Cures arthritis claim",
    description: "Direct cure claim cited as a violation.",
    ...overrides,
  }
}

function mockClaudeReturn(payload: unknown): void {
  mockedCreate.mockResolvedValue({
    content: [{ type: "text", text: JSON.stringify(payload) }],
  })
}

describe("extractRulesFromText documentDate handling", () => {
  beforeEach(() => {
    mockedCreate.mockReset()
  })

  it("returns the parsed ISO documentDate when Claude provides one", async () => {
    mockClaudeReturn({
      documentDate: "2024-03-15",
      rules: [rulePayload()],
    })

    const result = await extractRulesFromText("doc text", "FDA Warning Letters", "fda_warning")
    expect(result.documentDate).toBe("2024-03-15")
    expect(result.rules).toHaveLength(1)
    expect(result.rules[0].banned_phrase).toBe("cures arthritis")
  })

  it("returns documentDate null when Claude returns null, without throwing", async () => {
    mockClaudeReturn({
      documentDate: null,
      rules: [rulePayload()],
    })

    const result = await extractRulesFromText("doc text", "FTC Press Releases", "ftc_press")
    expect(result.documentDate).toBeNull()
    expect(result.rules).toHaveLength(1)
  })

  it("rejects malformed dates (long-form text) and returns null", async () => {
    mockClaudeReturn({
      documentDate: "March 15, 2024",
      rules: [rulePayload()],
    })

    const result = await extractRulesFromText("doc text", "FDA Warning Letters", "fda_warning")
    expect(result.documentDate).toBeNull()
    expect(result.rules).toHaveLength(1)
  })

  it("rejects slash-separated dates and returns null", async () => {
    mockClaudeReturn({
      documentDate: "2024/03/15",
      rules: [rulePayload()],
    })

    const result = await extractRulesFromText("doc text", "DOJ Healthcare Fraud", "doj_fraud")
    expect(result.documentDate).toBeNull()
    expect(result.rules).toHaveLength(1)
  })

  it("rejects junk strings and returns null", async () => {
    mockClaudeReturn({
      documentDate: "not a date at all",
      rules: [rulePayload()],
    })

    const result = await extractRulesFromText("doc text", "FTC Press Releases", "ftc_press")
    expect(result.documentDate).toBeNull()
    expect(result.rules).toHaveLength(1)
  })

  it("rejects non-string documentDate (number, object) and returns null", async () => {
    mockClaudeReturn({
      documentDate: 20240315,
      rules: [rulePayload()],
    })

    const result = await extractRulesFromText("doc text", "FDA 483 Observations", "fda_483")
    expect(result.documentDate).toBeNull()
    expect(result.rules).toHaveLength(1)
  })

  it("rejects partially-matching ISO-ish dates and returns null", async () => {
    // Looks close but has a time component - still not the YYYY-MM-DD contract.
    mockClaudeReturn({
      documentDate: "2024-03-15T00:00:00Z",
      rules: [rulePayload()],
    })

    const result = await extractRulesFromText("doc text", "FDA Warning Letters", "fda_warning")
    expect(result.documentDate).toBeNull()
    expect(result.rules).toHaveLength(1)
  })

  it("returns rules array correctly when documentDate is present (regression)", async () => {
    const rules = [
      rulePayload({ banned_phrase: "guaranteed pain relief", risk_level: "high" }),
      rulePayload({ banned_phrase: "FDA approved stem cell therapy", category: "fda_approval" }),
    ]
    mockClaudeReturn({
      documentDate: "2025-01-02",
      rules,
    })

    const result = await extractRulesFromText("doc text", "FDA Warning Letters", "fda_warning")
    expect(result.documentDate).toBe("2025-01-02")
    expect(result.rules).toHaveLength(2)
    expect(result.rules[0].banned_phrase).toBe("guaranteed pain relief")
    expect(result.rules[1].category).toBe("fda_approval")
  })

  it("tolerates the legacy bare-array response shape (back-compat)", async () => {
    // Older prompt iterations had Claude return a bare array. We still want
    // rules to parse cleanly in that case; documentDate falls back to null.
    mockedCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify([rulePayload()]) }],
    })

    const result = await extractRulesFromText("doc text", "FDA Warning Letters", "fda_warning")
    expect(result.documentDate).toBeNull()
    expect(result.rules).toHaveLength(1)
  })

  it("strips markdown code fencing before parsing", async () => {
    mockedCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text:
            "```json\n" +
            JSON.stringify({ documentDate: "2024-07-04", rules: [rulePayload()] }) +
            "\n```",
        },
      ],
    })

    const result = await extractRulesFromText("doc text", "FDA Warning Letters", "fda_warning")
    expect(result.documentDate).toBe("2024-07-04")
    expect(result.rules).toHaveLength(1)
  })

  it("returns empty rules + null date on invalid JSON without throwing", async () => {
    mockedCreate.mockResolvedValue({
      content: [{ type: "text", text: "not valid json at all" }],
    })

    const result = await extractRulesFromText("doc text", "FDA Warning Letters", "fda_warning")
    expect(result.documentDate).toBeNull()
    expect(result.rules).toEqual([])
  })

  it("returns empty rules + null date when Claude returns non-text content", async () => {
    mockedCreate.mockResolvedValue({
      content: [{ type: "tool_use", name: "nope", input: {} }],
    })

    const result = await extractRulesFromText("doc text", "FDA Warning Letters", "fda_warning")
    expect(result.documentDate).toBeNull()
    expect(result.rules).toEqual([])
  })

  it("returns empty rules + null date when the API call throws", async () => {
    mockedCreate.mockRejectedValue(new Error("rate limited"))

    const result = await extractRulesFromText("doc text", "FDA Warning Letters", "fda_warning")
    expect(result.documentDate).toBeNull()
    expect(result.rules).toEqual([])
  })
})
