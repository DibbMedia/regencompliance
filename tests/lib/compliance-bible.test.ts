import { describe, it, expect } from "vitest"
import {
  COMPLIANCE_BIBLE,
  getComplianceBiblePrompt,
  getComplianceBibleRewriteGuidance,
} from "@/lib/compliance-bible"
import { MODALITY_DISPLAY } from "@/app/coverage/page"

describe("COMPLIANCE_BIBLE", () => {
  it("has red light categories", () => {
    expect(COMPLIANCE_BIBLE.redLight.length).toBeGreaterThan(0)
  })

  it("each red light rule has category, patterns, and why", () => {
    for (const rule of COMPLIANCE_BIBLE.redLight) {
      expect(rule.category).toBeTruthy()
      expect(rule.patterns.length).toBeGreaterThan(0)
      expect(rule.why).toBeTruthy()
    }
  })

  it("has yellow light categories", () => {
    expect(COMPLIANCE_BIBLE.yellowLight.length).toBeGreaterThan(0)
  })

  it("each yellow light rule has requiredDisclaimer", () => {
    for (const rule of COMPLIANCE_BIBLE.yellowLight) {
      expect(rule.requiredDisclaimer).toBeTruthy()
    }
  })

  it("has green light patterns", () => {
    expect(COMPLIANCE_BIBLE.greenLight.length).toBeGreaterThan(0)
  })

  it("has modality rules", () => {
    expect(Object.keys(COMPLIANCE_BIBLE.modalityRules).length).toBeGreaterThan(0)
  })

  it("each modality rule has regulatoryStatus, canSay, cannotSay", () => {
    for (const [, rule] of Object.entries(COMPLIANCE_BIBLE.modalityRules)) {
      expect(rule.regulatoryStatus).toBeTruthy()
      expect(rule.canSay.length).toBeGreaterThan(0)
      expect(rule.cannotSay.length).toBeGreaterThan(0)
    }
  })

  it("has channel rules", () => {
    expect(Object.keys(COMPLIANCE_BIBLE.channelRules).length).toBeGreaterThan(0)
  })

  it("has disclaimer templates", () => {
    expect(COMPLIANCE_BIBLE.disclaimerTemplates.length).toBeGreaterThan(0)
  })

  it("includes key modalities: stem_cell, exosomes, prp, peptides", () => {
    expect(COMPLIANCE_BIBLE.modalityRules.stem_cell).toBeDefined()
    expect(COMPLIANCE_BIBLE.modalityRules.exosomes).toBeDefined()
    expect(COMPLIANCE_BIBLE.modalityRules.prp).toBeDefined()
    expect(COMPLIANCE_BIBLE.modalityRules.peptides).toBeDefined()
  })

  it("citationGaps is well-formed where present (IN-05)", () => {
    // Optional field; when set, each entry must be a non-empty string so
    // an audit grep can surface real signal instead of empty placeholders.
    for (const [key, rule] of Object.entries(COMPLIANCE_BIBLE.modalityRules)) {
      if (rule.citationGaps === undefined) continue
      expect(
        Array.isArray(rule.citationGaps),
        `${key}.citationGaps must be string[] when present`,
      ).toBe(true)
      expect(rule.citationGaps.length, `${key}.citationGaps must be non-empty`).toBeGreaterThan(0)
      for (const gap of rule.citationGaps) {
        expect(typeof gap, `${key}.citationGaps entry must be a string`).toBe("string")
        expect(gap.trim().length, `${key}.citationGaps entry must be non-blank`).toBeGreaterThan(0)
      }
    }
  })

  it("known modalities with primary-letter gaps are flagged via citationGaps (IN-05)", () => {
    // tesamorelin / bmac / shockwave_ed have honest "no primary-subject WL
    // publicly indexed as of 2026-05-20" annotations baked into their
    // regulatoryStatus prose. The structured citationGaps field mirrors
    // that so a sweep can find them by structure, not prose.
    const expectGap = ["tesamorelin", "bmac", "shockwave_ed"] as const
    for (const key of expectGap) {
      expect(
        COMPLIANCE_BIBLE.modalityRules[key].citationGaps,
        `${key} should have citationGaps[] documenting its primary-letter gap`,
      ).toBeDefined()
    }
  })

  it("coverage page MODALITY_DISPLAY keys are in parity with bible modalityRules (CR-01)", () => {
    const bibleKeys = Object.keys(COMPLIANCE_BIBLE.modalityRules).sort()
    const displayKeys = Object.keys(MODALITY_DISPLAY).sort()
    const missingFromDisplay = bibleKeys.filter((k) => !displayKeys.includes(k))
    const extraInDisplay = displayKeys.filter((k) => !bibleKeys.includes(k))
    expect(
      missingFromDisplay,
      `Bible has modality keys that the /coverage page cannot render with friendly names: ${missingFromDisplay.join(", ")}`,
    ).toEqual([])
    expect(
      extraInDisplay,
      `/coverage page has MODALITY_DISPLAY keys not present in the bible: ${extraInDisplay.join(", ")}`,
    ).toEqual([])
  })
})

describe("getComplianceBiblePrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = getComplianceBiblePrompt()
    expect(prompt.length).toBeGreaterThan(100)
  })

  it("includes red light section", () => {
    const prompt = getComplianceBiblePrompt()
    // The prompt uses HIGH/MEDIUM/APPROVED framing to match scan output.
    expect(prompt).toContain("HIGH RISK")
  })

  it("includes yellow light section", () => {
    const prompt = getComplianceBiblePrompt()
    expect(prompt).toContain("MEDIUM RISK")
  })

  it("includes green light section", () => {
    const prompt = getComplianceBiblePrompt()
    expect(prompt).toContain("APPROVED PATTERNS")
  })

  it("includes modality rules", () => {
    const prompt = getComplianceBiblePrompt()
    expect(prompt).toContain("MODALITY-SPECIFIC")
    expect(prompt).toContain("stem_cell")
  })

  it("includes channel rules", () => {
    const prompt = getComplianceBiblePrompt()
    expect(prompt).toContain("CHANNEL-SPECIFIC")
    expect(prompt).toContain("google_ads")
  })

  it("includes disclaimer templates", () => {
    const prompt = getComplianceBiblePrompt()
    expect(prompt).toContain("DISCLAIMER TEMPLATES")
  })
})

describe("getComplianceBibleRewriteGuidance", () => {
  it("returns a non-empty string", () => {
    const guidance = getComplianceBibleRewriteGuidance()
    expect(guidance.length).toBeGreaterThan(50)
  })

  it("includes rewrite protocol markers", () => {
    const guidance = getComplianceBibleRewriteGuidance()
    expect(guidance).toContain("REWRITE PROTOCOL")
  })

  it("references red and yellow light handling", () => {
    const guidance = getComplianceBibleRewriteGuidance()
    // Guidance uses "High-risk" / "Medium-risk" phrasing, not RED/YELLOW.
    expect(guidance).toContain("High-risk")
    expect(guidance).toContain("Medium-risk")
  })
})
