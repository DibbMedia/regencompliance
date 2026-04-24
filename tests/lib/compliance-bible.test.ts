import { describe, it, expect } from "vitest"
import {
  COMPLIANCE_BIBLE,
  getComplianceBiblePrompt,
  getComplianceBibleRewriteGuidance,
} from "@/lib/compliance-bible"

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
