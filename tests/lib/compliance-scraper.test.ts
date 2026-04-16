import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/anthropic", () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}))

import { anthropic } from "@/lib/anthropic"
import {
  agencyForSourceType,
  extractActionMetadata,
} from "@/lib/compliance-scraper"

describe("agencyForSourceType", () => {
  it("maps FDA source types to FDA", () => {
    expect(agencyForSourceType("fda_warning")).toBe("FDA")
    expect(agencyForSourceType("fda_483")).toBe("FDA")
  })

  it("maps FTC source types to FTC", () => {
    expect(agencyForSourceType("ftc_press")).toBe("FTC")
    expect(agencyForSourceType("ftc_guidance")).toBe("FTC")
  })

  it("maps DOJ source types to DOJ", () => {
    expect(agencyForSourceType("doj_fraud")).toBe("DOJ")
  })
})

describe("extractActionMetadata", () => {
  const mockedCreate = anthropic.messages.create as unknown as ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockedCreate.mockReset()
  })

  it("returns parsed metadata on valid JSON", async () => {
    mockedCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            company_name: "Acme Stem Cells",
            product_or_treatment: "stem cell IV therapy",
            summary: "FDA cited Acme for marketing unapproved stem cell IV therapy for arthritis.",
          }),
        },
      ],
    })

    const result = await extractActionMetadata("some document text", "FDA Warning Letters")
    expect(result).toEqual({
      company_name: "Acme Stem Cells",
      product_or_treatment: "stem cell IV therapy",
      summary: "FDA cited Acme for marketing unapproved stem cell IV therapy for arthritis.",
    })
  })

  it("strips markdown code fencing before parsing", async () => {
    mockedCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: "```json\n" +
            JSON.stringify({ company_name: null, product_or_treatment: null, summary: "Test." }) +
            "\n```",
        },
      ],
    })

    const result = await extractActionMetadata("x", "FTC")
    expect(result?.summary).toBe("Test.")
    expect(result?.company_name).toBeNull()
  })

  it("normalizes missing optional fields to null", async () => {
    mockedCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ summary: "Only summary." }) }],
    })

    const result = await extractActionMetadata("x", "FDA")
    expect(result).toEqual({
      company_name: null,
      product_or_treatment: null,
      summary: "Only summary.",
    })
  })

  it("returns null on invalid JSON", async () => {
    mockedCreate.mockResolvedValue({
      content: [{ type: "text", text: "not valid json at all" }],
    })
    expect(await extractActionMetadata("x", "FDA")).toBeNull()
  })

  it("returns null when Claude returns non-text content", async () => {
    mockedCreate.mockResolvedValue({
      content: [{ type: "tool_use", name: "nope", input: {} }],
    })
    expect(await extractActionMetadata("x", "FDA")).toBeNull()
  })

  it("returns null when API call throws", async () => {
    mockedCreate.mockRejectedValue(new Error("rate limited"))
    expect(await extractActionMetadata("x", "FDA")).toBeNull()
  })

  it("returns null when summary is missing", async () => {
    mockedCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ company_name: "X" }) }],
    })
    expect(await extractActionMetadata("x", "FDA")).toBeNull()
  })
})
