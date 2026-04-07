// ---------------------------------------------------------------------------
// Regen Compliance Bible — distilled from the 31-page regulatory guide
// Structured as traffic-light rules for injection into Claude system prompts
// ---------------------------------------------------------------------------

export interface ComplianceBible {
  redLight: RedLightRule[]
  yellowLight: YellowLightRule[]
  greenLight: string[]
  modalityRules: Record<string, ModalityRule>
  channelRules: Record<string, ChannelRule>
  disclaimerTemplates: DisclaimerTemplate[]
}

interface RedLightRule {
  category: string
  patterns: string[]
  why: string
}

interface YellowLightRule {
  category: string
  patterns: string[]
  requiredDisclaimer: string
}

interface ModalityRule {
  regulatoryStatus: string
  canSay: string[]
  cannotSay: string[]
}

interface ChannelRule {
  restrictions: string[]
}

interface DisclaimerTemplate {
  name: string
  text: string
}

export const COMPLIANCE_BIBLE: ComplianceBible = {
  // -------------------------------------------------------------------------
  // RED LIGHT — NEVER USE (automatic high-risk flag)
  // -------------------------------------------------------------------------
  redLight: [
    {
      category: "Cure claims",
      patterns: [
        "cures", "cure for", "reverses [disease]", "eliminates [disease]",
        "eradicates", "heals [disease]", "permanent fix",
      ],
      why: "FDA prohibits cure claims for unapproved products/therapies",
    },
    {
      category: "Guaranteed outcomes",
      patterns: [
        "guaranteed results", "100% effective", "works every time",
        "no chance of failure", "proven to work", "guaranteed to",
      ],
      why: "FTC requires substantiation; guarantees are inherently misleading",
    },
    {
      category: "FDA misrepresentation",
      patterns: [
        "FDA approved" /* when used for unapproved uses */, "FDA tested",
        "FDA certified treatment", "FDA endorsed", "FDA recommended",
      ],
      why: "Misbranding under FDCA; most regen therapies are NOT FDA approved",
    },
    {
      category: "Unapproved disease treatment",
      patterns: [
        "treats [disease]", "prevents [disease]", "mitigates [disease]",
        "heals [condition]", "therapeutic for [disease]",
      ],
      why: "Unapproved products cannot claim to treat/prevent/mitigate disease (21 USC 321)",
    },
    {
      category: "Exosome efficacy",
      patterns: [
        "exosome therapy heals", "exosomes regrow cartilage",
        "exosomes reverse aging", "exosomes repair tissue",
        "exosome therapy treats", "exosomes regenerate",
      ],
      why: "No FDA-approved exosome products exist; all efficacy claims are illegal",
    },
    {
      category: "Unapproved stem cell efficacy",
      patterns: [
        "stem cells cure arthritis", "stem cell facelift reverses aging",
        "stem cells regenerate nerves", "stem cells repair [organ]",
        "stem cell therapy fixes", "stem cells restore",
      ],
      why: "Only cord-blood HPCs are FDA approved; all other stem cell efficacy claims are unapproved",
    },
    {
      category: "Comparative superiority",
      patterns: [
        "better than surgery", "replaces the need for surgery",
        "safer than all other options", "superior to conventional",
        "outperforms", "more effective than",
      ],
      why: "Unsubstantiated comparative claims violate FTC Act Section 5",
    },
    {
      category: "Absolute safety",
      patterns: [
        "completely safe", "no side effects", "risk-free",
        "zero complications", "100% safe", "perfectly safe",
        "no risks", "without any risk",
      ],
      why: "All medical procedures carry risk; absolute safety claims are inherently false",
    },
    {
      category: "Peptide therapy claims",
      patterns: [
        "BPC-157 heals tendons", "TB-500 fixes injuries",
        "peptide therapy cures", "peptides treat [disease]",
        "BPC-157 repairs", "TB-500 regenerates",
      ],
      why: "Many peptides banned from compounding (FDA); no FDA-approved therapeutic peptides for regen",
    },
    {
      category: "Misleading credentials",
      patterns: [
        "board-certified in regenerative medicine",
        "board-certified stem cell specialist",
      ],
      why: "No ABMS-recognized board for regenerative medicine; claiming board certification is misleading",
    },
    {
      category: "PHI in marketing",
      patterns: [
        "patient name in testimonial without HIPAA authorization",
        "before/after with identifiable patient info",
      ],
      why: "HIPAA violation; marketing with PHI requires specific written authorization",
    },
    {
      category: "Fake reviews",
      patterns: [
        "fabricated testimonials", "undisclosed paid reviews",
        "undisclosed family member reviews", "fake patient stories",
      ],
      why: "FTC Endorsement Guides require truthful, disclosed testimonials",
    },
  ],

  // -------------------------------------------------------------------------
  // YELLOW LIGHT — RESTRICTED (needs specific disclaimers)
  // -------------------------------------------------------------------------
  yellowLight: [
    {
      category: "Research citations",
      patterns: [
        "research suggests", "early studies suggest", "studies show",
        "clinical research indicates", "evidence suggests",
      ],
      requiredDisclaimer: "Must link to actual peer-reviewed studies AND include FDA disclaimer that the therapy is not FDA approved",
    },
    {
      category: "Off-label use",
      patterns: [
        "off-label", "used for conditions beyond", "applied to other areas",
      ],
      requiredDisclaimer: "Must include off-label use disclaimer stating the use has not been FDA approved for the described indication",
    },
    {
      category: "Patient experience language",
      patterns: [
        "some patients report improvement", "many patients experience",
        "patients have noticed", "our patients often see",
      ],
      requiredDisclaimer: "Must include typicality disclosure: 'Individual results vary. These statements do not represent typical results.'",
    },
    {
      category: "PRP/PRF benefits",
      patterns: [
        "PRP promotes healing", "PRF accelerates recovery",
        "PRP rejuvenates", "platelet-rich plasma benefits",
      ],
      requiredDisclaimer: "Must clarify PRP/PRF is off-label for most uses (510(k) cleared only for bone graft handling)",
    },
    {
      category: "Stem cell education",
      patterns: [
        "stem cell therapy", "stem cell treatment options",
        "regenerative stem cell", "stem cell procedures",
      ],
      requiredDisclaimer: "Must state: 'Only cord-blood-derived HPCs are FDA approved for specific blood disorders. Other stem cell uses are unapproved.'",
    },
    {
      category: "Exosome education",
      patterns: [
        "exosome therapy", "exosome treatment", "exosome procedure",
      ],
      requiredDisclaimer: "Must state: 'There are currently no FDA-approved exosome products.'",
    },
    {
      category: "Supplement claims",
      patterns: [
        "supports immune health", "promotes joint function",
        "helps maintain", "supports healthy",
      ],
      requiredDisclaimer: "Structure/function claims only; must include DSHEA disclaimer: 'These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.'",
    },
  ],

  // -------------------------------------------------------------------------
  // GREEN LIGHT — APPROVED patterns (safe to use)
  // -------------------------------------------------------------------------
  greenLight: [
    "What is PRP? (educational overview)",
    "Schedule a consultation to see if this may be appropriate for you",
    "Our clinic offers regenerative medicine consultations",
    "This procedure involves... (neutral process description)",
    "As with any medical procedure, there are potential risks including...",
    "This treatment has not been FDA approved for this indication",
    "Supports your body's natural healing processes (general wellness)",
    "Board-certified in [ABMS-recognized specialty]",
    "Contact us to learn more about your options",
    "Individual results may vary",
    "Results are not guaranteed",
    "Our team includes [real, verifiable credentials]",
  ],

  // -------------------------------------------------------------------------
  // MODALITY RULES — per-treatment regulatory status
  // -------------------------------------------------------------------------
  modalityRules: {
    stem_cell: {
      regulatoryStatus: "Only cord-blood-derived HPCs (e.g., HEMACORD, DUCORD) are FDA approved, and only for blood disorders. All other stem cell therapies are unapproved.",
      canSay: [
        "We offer stem cell consultations",
        "Cord-blood-derived stem cells are FDA approved for certain blood disorders",
        "Ask if stem cell therapy may be appropriate for you",
      ],
      cannotSay: [
        "Stem cells cure/treat/heal [any condition]",
        "Our stem cell therapy is FDA approved",
        "Stem cells regenerate/repair/restore [tissue/organ]",
      ],
    },
    exosomes: {
      regulatoryStatus: "NO FDA-approved exosome products exist. Education only. FDA issued explicit warning in 2019.",
      canSay: [
        "What are exosomes? (educational)",
        "Exosome research is ongoing",
        "Consult with our team about emerging therapies",
      ],
      cannotSay: [
        "Exosome therapy heals/treats/repairs anything",
        "Our exosome product is safe and effective",
        "Exosomes regrow/regenerate/reverse anything",
      ],
    },
    prp: {
      regulatoryStatus: "510(k) cleared ONLY for bone graft handling. All other uses (joints, hair, face) are off-label.",
      canSay: [
        "PRP uses your own blood platelets",
        "PRP is being studied for various applications",
        "Some patients report positive experiences with PRP (with disclaimer)",
      ],
      cannotSay: [
        "PRP heals/cures/treats [condition]",
        "PRP is FDA approved for [non-bone-graft use]",
        "PRP guaranteed to regrow hair/heal joints",
      ],
    },
    peptides: {
      regulatoryStatus: "BPC-157, TB-500, and many others banned from compounding by FDA. No FDA-approved peptide therapies for regenerative use.",
      canSay: [
        "Peptide research is an emerging field",
        "Ask about peptide options during your consultation",
      ],
      cannotSay: [
        "BPC-157 heals tendons/gut/injuries",
        "TB-500 repairs tissue",
        "Peptide therapy cures/treats/fixes anything",
      ],
    },
    iv_therapy: {
      regulatoryStatus: "No disease claims allowed. Wellness framing only. NAD+ and vitamin IVs are not FDA approved for any disease.",
      canSay: [
        "IV therapy for hydration and wellness support",
        "Nutrient IV drips may support general wellness",
      ],
      cannotSay: [
        "IV therapy treats/cures fatigue/aging/disease",
        "NAD+ reverses aging",
        "IV vitamins boost your immune system to fight disease",
      ],
    },
    bhrt: {
      regulatoryStatus: "Compounded bioidentical hormones are NOT FDA approved. Only manufactured BHRT products with NDAs are approved.",
      canSay: [
        "Hormone optimization consultation available",
        "Bioidentical hormones are one option your doctor may discuss",
      ],
      cannotSay: [
        "BHRT is safer than conventional HRT",
        "Bioidentical hormones are natural and risk-free",
        "BHRT prevents aging/disease",
      ],
    },
    svf_adipose: {
      regulatoryStatus: "SVF/adipose stem cells are unapproved 351 biologics. Cannot be marketed as therapy.",
      canSay: [
        "Adipose-derived cell research is ongoing",
      ],
      cannotSay: [
        "Fat stem cells treat/heal/repair anything",
        "SVF therapy available",
        "Adipose stem cell treatment for [condition]",
      ],
    },
    hbot: {
      regulatoryStatus: "FDA cleared for 13 specific indications (decompression, wounds, CO poisoning, etc.). All other uses are off-label.",
      canSay: [
        "HBOT is FDA cleared for [specific 13 indications]",
        "Ask if HBOT may be appropriate for your condition",
      ],
      cannotSay: [
        "HBOT treats autism/cancer/anti-aging",
        "Hyperbaric oxygen cures [non-cleared condition]",
      ],
    },
  },

  // -------------------------------------------------------------------------
  // CHANNEL RULES — per-advertising-platform restrictions
  // -------------------------------------------------------------------------
  channelRules: {
    google_ads: {
      restrictions: [
        "No speculative/experimental treatment ads (stem cells, exosomes, PRP, gene therapy)",
        "No unproven medical claims",
        "Healthcare ads require Google certification",
        "Destination must match ad claims",
      ],
    },
    meta_instagram: {
      restrictions: [
        "18+ targeting required for cosmetic procedures",
        "No PHI-based custom audiences",
        "No before/after that implies guaranteed results",
        "Health claims must not be sensationalized",
      ],
    },
    tiktok: {
      restrictions: [
        "Health ads require platform certification",
        "18+ audience targeting required",
        "No cure/treatment promises",
        "No graphic medical procedure content",
      ],
    },
    email: {
      restrictions: [
        "CAN-SPAM: physical address required",
        "Working unsubscribe link required",
        "No deceptive subject lines",
        "Sender identity must be clear",
      ],
    },
    sms: {
      restrictions: [
        "Prior express written consent required (TCPA)",
        "Time restrictions: no messages before 8am or after 9pm local",
        "Opt-out mechanism required in every message",
        "Must identify sender/business",
      ],
    },
  },

  // -------------------------------------------------------------------------
  // DISCLAIMER TEMPLATES — required legal text
  // -------------------------------------------------------------------------
  disclaimerTemplates: [
    {
      name: "Universal Medical Disclaimer",
      text: "This content is for informational purposes only and does not constitute medical advice. Consult a qualified healthcare provider before pursuing any treatment.",
    },
    {
      name: "Regenerative Medicine Disclaimer",
      text: "Regenerative medicine therapies are largely investigational. Only certain cord-blood-derived stem cell products are FDA approved (for specific blood disorders). There are no FDA-approved exosome products. PRP is FDA cleared only for bone graft handling; other uses are off-label. Results vary and are not guaranteed.",
    },
    {
      name: "Off-Label Use Disclaimer",
      text: "This treatment is being used off-label. It has not been FDA approved for the described indication. Your provider can discuss the potential benefits and risks.",
    },
    {
      name: "DSHEA Supplement Disclaimer",
      text: "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.",
    },
    {
      name: "Testimonial Disclaimer",
      text: "Individual results may vary. Testimonials reflect individual experiences and do not represent typical results. No outcome is guaranteed.",
    },
    {
      name: "State Notice — Florida",
      text: "Florida requires: The patient is advised that stem cell therapies are not proven by the FDA to be safe or effective for the condition being treated.",
    },
    {
      name: "State Notice — Utah",
      text: "Utah requires informed consent for investigational stem cell treatments, including risks, alternatives, and that the treatment is not FDA approved.",
    },
    {
      name: "State Notice — Nevada",
      text: "Nevada requires stem cell clinics to register and provide informed consent disclosing investigational status.",
    },
  ],
}

// ---------------------------------------------------------------------------
// Prompt generator — returns a condensed string for Claude system prompts
// ---------------------------------------------------------------------------
export function getComplianceBiblePrompt(): string {
  const b = COMPLIANCE_BIBLE

  // Build red-light section
  const redSection = b.redLight
    .map((r) => `- ${r.category}: ${r.patterns.slice(0, 4).join(", ")} → ${r.why}`)
    .join("\n")

  // Build yellow-light section
  const yellowSection = b.yellowLight
    .map((y) => `- ${y.category}: ${y.patterns.slice(0, 3).join(", ")} → REQUIRES: ${y.requiredDisclaimer}`)
    .join("\n")

  // Build green-light section
  const greenSection = b.greenLight.map((g) => `- ${g}`).join("\n")

  // Build modality section (compact)
  const modalitySection = Object.entries(b.modalityRules)
    .map(([key, m]) => `${key}: ${m.regulatoryStatus}`)
    .join("\n")

  // Build channel section (compact)
  const channelSection = Object.entries(b.channelRules)
    .map(([key, c]) => `${key}: ${c.restrictions.join("; ")}`)
    .join("\n")

  // Build disclaimer section
  const disclaimerSection = b.disclaimerTemplates
    .map((d) => `[${d.name}]: ${d.text}`)
    .join("\n")

  return `=== REGEN COMPLIANCE BIBLE — TRAFFIC LIGHT SYSTEM ===

RED LIGHT — NEVER ALLOWED (flag as HIGH risk):
${redSection}

YELLOW LIGHT — RESTRICTED (flag as MEDIUM risk if missing required disclaimers):
${yellowSection}

GREEN LIGHT — APPROVED PATTERNS (safe, suggest if missing where appropriate):
${greenSection}

MODALITY-SPECIFIC REGULATORY STATUS:
${modalitySection}

CHANNEL-SPECIFIC RULES:
${channelSection}

REQUIRED DISCLAIMER TEMPLATES:
${disclaimerSection}

=== END COMPLIANCE BIBLE ===`
}

// ---------------------------------------------------------------------------
// Rewrite-specific prompt guidance
// ---------------------------------------------------------------------------
export function getComplianceBibleRewriteGuidance(): string {
  return `=== REWRITE PROTOCOL (from Compliance Bible) ===
1. RED LIGHT phrases: Replace with GREEN LIGHT alternatives. Never keep cure/guarantee/FDA-misrep language.
2. YELLOW LIGHT phrases: Keep the content but ADD the required disclaimer text nearby.
3. Always note regulatory status for any modality mentioned (stem cells, exosomes, PRP, peptides, etc.).
4. Use patient experience language: "some patients report...", "may support...", "individual results vary".
5. Never add claims not in the original — only make existing claims compliant.
6. Maintain original tone, length, and marketing intent.
7. If the content mentions a specific modality, include the appropriate disclaimer from the templates.
=== END REWRITE PROTOCOL ===`
}
