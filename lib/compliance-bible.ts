// ---------------------------------------------------------------------------
// Regen Compliance Bible - distilled from the 31-page regulatory guide
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
  // RED LIGHT - NEVER USE (automatic high-risk flag)
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
      why: "16 CFR Part 255 (FTC Endorsement Guides, 2023 revision) requires truthful endorsements with disclosed material connections",
    },
    {
      category: "Compounded GLP-1 misrepresentation",
      patterns: [
        "our compounded semaglutide is FDA approved",
        "same as Ozempic at a fraction of the cost",
        "FDA-grade semaglutide", "research-grade semaglutide for human use",
        "guaranteed weight loss with our shot",
        "compounded tirzepatide approved for weight loss",
      ],
      why: "Compounded semaglutide/tirzepatide are not FDA approved; 21 USC 353a/353b limit compounding and prohibit 'essentially a copy' of an approved drug; FDA warning letters issued to US Chem Labs and Synthetix (Feb 2024) for unapproved sales",
    },
    {
      category: "Ketamine off-label promotion",
      patterns: [
        "ketamine cures depression", "FDA approved ketamine for PTSD",
        "ketamine therapy treats anxiety", "at-home ketamine with no doctor visit",
        "permanent fix for treatment-resistant depression",
        "ketamine has no risk of addiction",
      ],
      why: "Ketamine is Schedule III (21 CFR 1308.13(b)(7)); not FDA approved for any psychiatric indication. Only Spravato (esketamine) is approved for TRD and is REMS-restricted. Ryan Haight Act (21 USC 829(e)) requires in-person evaluation before controlled-substance telemedicine prescribing",
    },
    {
      category: "NAD+ disease and anti-aging claims",
      patterns: [
        "NAD+ reverses aging", "NAD+ IV cures addiction/Parkinson's/Alzheimer's",
        "NAD+ repairs DNA damage", "FDA approved NAD+ therapy",
        "clinically proven to extend lifespan",
      ],
      why: "NAD+ injectable/IV products are not FDA approved finished drugs; disease and serious health claims require RCT-grade substantiation under FTC Health Products Compliance Guidance",
    },
    {
      category: "Ozone therapy efficacy claims",
      patterns: [
        "ozone therapy treats cancer/Lyme/autoimmune",
        "10-pass ozone cures chronic disease",
        "EBOO ozone heals the body",
        "FDA cleared ozone treatment", "medical ozone is safe and effective",
      ],
      why: "21 CFR 801.415 states ozone has 'no known useful medical application'; FDA O3UV warning letter (Jul 7, 2025) cited unapproved-device claims for autohemotherapy/EBOO",
    },
    {
      category: "BPC-157 peptide efficacy claims",
      patterns: [
        "BPC-157 heals tendons/ligaments/gut",
        "BPC-157 repairs tissue damage",
        "Body Protective Compound proven for injury recovery",
        "FDA approved BPC-157 protocol",
        "research-grade BPC-157 for human use",
      ],
      why: "BPC-157 is not FDA approved and does not meet 21 USC 353a(b)(1)(A) bulks-substance criteria; FDA issued warning letter to Summit Research Peptides (Dec 10, 2024) for unapproved peptide sales",
    },
    {
      category: "TRT anti-aging and risk-free claims",
      patterns: [
        "TRT reverses aging", "TRT is risk-free for men",
        "FDA approved Low T treatment for age-related decline",
        "boost your testosterone with no side effects",
        "lifetime testosterone optimization with no cardiovascular risk",
      ],
      why: "FDA 2015 class-wide labeling change clarifies testosterone is NOT approved for age-related low testosterone and warns of possible increased risk of heart attack and stroke; testosterone is Schedule III under 21 CFR 1308.13",
    },
  ],

  // -------------------------------------------------------------------------
  // YELLOW LIGHT - RESTRICTED (needs specific disclaimers)
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
  // GREEN LIGHT - APPROVED patterns (safe to use)
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
  // MODALITY RULES - per-treatment regulatory status
  // -------------------------------------------------------------------------
  modalityRules: {
    stem_cell: {
      regulatoryStatus: "Only cord-blood-derived HPCs (e.g., HEMACORD, DUCORD) are FDA approved, and only for blood disorders. All other stem cell therapies are unapproved. HCT/Ps are governed by 21 CFR Part 1271: §1271.10 sets the four criteria for regulation solely under section 361 (minimal manipulation, homologous use, no combination with another article, no systemic effect or limited to autologous/first-degree-allogeneic/reproductive use); §1271.15(b) provides the same-surgical-procedure exception; §1271.350 sets adverse-event reporting via Form FDA-3500A within 15 calendar days.",
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
      regulatoryStatus: "NO FDA-approved exosome products exist. Education only. FDA issued an explicit Consumer Alert in 2019/2020 (https://www.fda.gov/vaccines-blood-biologics/safety-availability-biologics/public-safety-notification-exosome-products). Exosomes are 351 biologics requiring a BLA; they do not satisfy the four 21 CFR 1271.10 criteria for 361 HCT/P regulation, and §1271.350 adverse-event reporting still applies where distributed.",
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
      regulatoryStatus: "SVF/adipose stem cells are unapproved 351 biologics. Cannot be marketed as therapy. Enzymatic SVF preparation generally fails 21 CFR 1271.10(a)(1) ('minimally manipulated' criterion) per FDA's HCT/P framework; courts have upheld this (US v. US Stem Cell Clinic, 11th Cir. 2021). The 21 CFR 1271.15(b) same-surgical-procedure exception is narrow and does not cover most SVF clinical models. 21 CFR 1271.350 adverse-event reporting applies where distributed.",
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
    glp_1_compounded: {
      regulatoryStatus: "Compounded semaglutide/tirzepatide/retatrutide are not FDA-approved drugs. Compounding under 21 USC 353a (503A pharmacies) or 353b (503B outsourcing facilities) is permitted only under narrow shortage-list / patient-specific exceptions; FDA removed semaglutide and tirzepatide from the drug shortage list in 2024-2025 and clarified that compounding 'essentially a copy' of an approved drug is prohibited (https://www.fda.gov/drugs/human-drug-compounding/fda-clarifies-policies-compounders-national-glp-1-supply-begins-stabilize). FDA issued warning letters to US Chem Labs (Feb 7, 2024, https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/us-chem-labs-669074-02072024) and Synthetix/Helix Chemical Supply (Feb 7, 2024) for selling unapproved semaglutide and tirzepatide as 'research only.' FTC has flagged misleading GLP-1 weight-loss marketing under Section 5 of the FTC Act.",
      canSay: [
        "FDA-approved semaglutide (Ozempic, Wegovy) and tirzepatide (Mounjaro, Zepbound) are prescription medications",
        "Discuss whether a GLP-1 medication may be appropriate during a medical consultation",
        "Compounded semaglutide is not FDA approved and is only permitted under limited pharmacy-compounding rules",
      ],
      cannotSay: [
        "Our compounded semaglutide is FDA approved",
        "Lose [X] pounds guaranteed with semaglutide",
        "Same as Ozempic at a fraction of the cost",
        "Safe weight-loss shot with no side effects",
        "Compounded GLP-1 cures obesity/diabetes",
        "Research-grade semaglutide for human use",
        "FDA-grade semaglutide",
      ],
    },
    ketamine: {
      regulatoryStatus: "Ketamine is a DEA Schedule III controlled substance (21 CFR 1308.13(b)(7)). FDA-approved ketamine is an IV/IM anesthetic; it is NOT FDA approved for depression, PTSD, or any psychiatric indication - those uses are off-label. Esketamine (Spravato) is the only FDA-approved ketamine-class product for treatment-resistant depression and is restricted under a REMS program requiring in-office administration and observation. Compounded oral and nasal ketamine carry FDA safety alerts (https://www.fda.gov/drugs/human-drug-compounding/fda-warns-patients-and-health-care-providers-about-potential-risks-associated-compounded-ketamine and https://www.fda.gov/drugs/human-drug-compounding/fda-alerts-health-care-professionals-potential-risks-associated-compounded-ketamine-nasal-spray). The Ryan Haight Act, 21 USC 829(e), requires at least one in-person medical evaluation before any controlled-substance prescription via telemedicine (subject to time-limited DEA flexibilities).",
      canSay: [
        "Ketamine is a Schedule III controlled substance, FDA approved as an anesthetic",
        "Spravato (esketamine) is FDA approved for treatment-resistant depression and is administered under a REMS program",
        "Use of ketamine for depression is off-label and not FDA approved for that indication",
        "Federal law requires an in-person medical evaluation before prescribing controlled substances via telemedicine",
      ],
      cannotSay: [
        "Ketamine cures depression",
        "Ketamine is FDA approved for PTSD/anxiety/depression",
        "Ketamine therapy works for everyone",
        "Safe at-home ketamine treatment with no risks",
        "Permanent fix for treatment-resistant depression",
        "No risk of addiction or abuse",
        "Get your ketamine prescription with no doctor visit",
      ],
    },
    nad_iv: {
      regulatoryStatus: "NAD+ injectable/IV products are not FDA-approved finished drugs for any indication. They are compounded preparations subject to 21 USC 353a/353b. FDA has issued recalls of compounded NAD products for being out-of-specification (e.g., Olympia Pharmacy nationwide recall covering compounded NAD injectables, https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts). FTC Section 5 unfair-and-deceptive-practices authority applies to anti-aging or disease-treatment claims for any IV therapy; FTC's 2022 Health Products Compliance Guidance requires randomized controlled human clinical trials to substantiate disease and structure/function claims for health products.",
      canSay: [
        "NAD+ is a coenzyme found naturally in the body",
        "Wellness-oriented IV programs may include NAD+ as part of a provider-supervised regimen",
        "NAD+ injectable and IV products are not FDA approved for any disease indication",
      ],
      cannotSay: [
        "NAD+ reverses aging",
        "NAD+ IV cures addiction/Parkinson's/Alzheimer's",
        "NAD+ repairs DNA damage",
        "Anti-aging IV drip - guaranteed results",
        "FDA-approved NAD+ therapy",
        "NAD+ restores youthful energy and brain function",
        "Clinically proven to extend lifespan",
      ],
    },
    ozone_therapy: {
      regulatoryStatus: "FDA has no approved medical use for ozone. 21 CFR 801.415 states 'ozone is a toxic gas with no known useful medical application in specific, adjunctive, or preventive therapy.' Devices that generate ozone for therapeutic use are unapproved/unauthorized devices; FDA issued a warning letter to O3UV, LLC on July 7, 2025 for marketing autohemotherapy/EBOO (extracorporeal blood oxygenation and ozonation) devices without authorization (https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/o3uv-llc-668840-07072025). Earlier warning letters include Living Foods LLC (July 5, 2022) for ozone-based products marketed as new drugs without approval.",
      canSay: [
        "FDA has not approved any medical use for ozone",
        "We do not offer ozone therapy",
      ],
      cannotSay: [
        "Ozone therapy treats cancer/Lyme/COVID/autoimmune disease",
        "Ozone IV is safe and effective",
        "FDA approved ozone treatment",
        "10-pass ozone cures chronic disease",
        "EBOO ozone therapy heals the body",
        "Ozone kills viruses and bacteria in the bloodstream",
        "Medical ozone is FDA cleared",
      ],
    },
    bpc_157: {
      regulatoryStatus: "BPC-157 is not an FDA-approved drug. It is not on the section 503A bulks list permitted for compounding, and FDA has stated it does not qualify as a USP/NF monograph substance or a component of an FDA-approved drug; under 21 USC 353a(b)(1)(A), bulk drug substances used in 503A compounding must satisfy one of those criteria. FDA has issued warning letters to peptide compounders selling BPC-157 (e.g., Summit Research Peptides, Dec 10, 2024, https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/summit-research-peptides-695607-12102024). // TODO: needs citation - specific FDA Sept 2023 'Category 2' bulks decision date for BPC-157 (FDA category-list pages 404'd; Federal Register link blocked by unblock proxy).",
      canSay: [
        "BPC-157 is not FDA approved",
        "We do not prescribe or compound BPC-157",
        "Peptide research is an active and evolving field",
      ],
      cannotSay: [
        "BPC-157 heals tendons/ligaments/gut",
        "BPC-157 repairs tissue damage",
        "Body Protective Compound proven for injury recovery",
        "FDA approved BPC-157 protocol",
        "Safe peptide therapy with no side effects",
        "BPC-157 accelerates healing",
        "Research-grade BPC-157 for human use",
      ],
    },
    trt_men: {
      regulatoryStatus: "Testosterone is a DEA Schedule III controlled substance (21 CFR 1308.13). FDA-approved testosterone products are indicated only for men with low testosterone levels caused by certain medical conditions (classical hypogonadism). FDA issued a Drug Safety Communication on March 3, 2015 requiring class-wide labeling changes warning of possible increased risk of heart attack and stroke and clarifying that the benefit and safety of testosterone has NOT been established for low testosterone due to aging (https://www.fda.gov/drugs/drug-safety-and-availability/fda-issues-class-wide-labeling-changes-testosterone-products). Compounded testosterone preparations are not FDA approved. FTC has acted against 'Low T' marketing under Section 5 of the FTC Act for unsubstantiated claims about energy, libido, and vitality.",
      canSay: [
        "FDA-approved testosterone products are indicated for men with hypogonadism from specific medical conditions",
        "Testosterone is a Schedule III controlled substance and requires a valid prescription",
        "FDA labeling for testosterone warns of possible increased risk of heart attack and stroke",
        "The benefit and safety of testosterone has not been established for low testosterone due to aging",
      ],
      cannotSay: [
        "TRT reverses aging",
        "TRT is risk-free for men",
        "Boost your testosterone naturally with no side effects",
        "TRT cures low energy/depression/erectile dysfunction",
        "Anti-aging testosterone protocol",
        "FDA-approved Low T treatment for age-related decline",
        "Lifetime testosterone optimization with no cardiovascular risk",
      ],
    },
  },

  // -------------------------------------------------------------------------
  // CHANNEL RULES - per-advertising-platform restrictions
  // -------------------------------------------------------------------------
  channelRules: {
    website: {
      restrictions: [
        "No disease treatment claims for unapproved therapies",
        "Testimonials require typicality disclosures and HIPAA authorization",
        "Before/after photos require informed consent and cannot imply guaranteed results",
        "Cite FDA-approved status truthfully; do not imply broader approval than granted",
      ],
    },
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
    website: {
      restrictions: [
        "Testimonials and endorsements must comply with 16 CFR Part 255 (FTC Endorsement Guides, final revision effective July 26, 2023, 88 FR 48102): truthful, substantiated, material connections disclosed, and not deceptive",
        "Consumer testimonials that imply atypical results must include clear and conspicuous disclosure that results are not what most consumers will achieve; a generic 'results not typical' line is insufficient if it is not clear and conspicuous",
        "Expert endorsements require that the endorser have qualifications sufficient to give the endorsement (16 CFR 255.3) and must reflect the endorser's actual opinions",
        "Health-product claims must be substantiated by competent and reliable scientific evidence (FTC Health Products Compliance Guidance 2022); for disease and serious health claims FTC generally expects randomized, controlled human clinical trials",
        "Before/after photos must depict the actual patient receiving the actual treatment, with the same lighting/angle/posing, and may not imply a guaranteed or typical result",
        "Before/after and identifiable patient images require written HIPAA authorization (45 CFR 164.508) and patient written consent for marketing use",
        "State medical-advertising rules apply (e.g., NAC 630.190 prohibiting false, deceptive, misleading or guarantee-based advertising; Fla. Stat. 458.3245 and 459.0127 requiring a specific FDA-approval-status notice in stem cell ads)",
        "Treatment-page disclaimers: any modality not FDA approved for the advertised use must carry a clear off-label or non-FDA-approved status disclaimer",
        "Credential and title claims must be truthful and verifiable: only ABMS- or AOA-recognized board certifications may be described as 'board-certified'; specialty terms must match the certifying body",
        "Provider directory information (NPI, state license number, DEA registration where relevant) must be accurate and not misleading",
      ],
    },
  },

  // -------------------------------------------------------------------------
  // DISCLAIMER TEMPLATES - required legal text
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
      name: "State Notice - Florida",
      text: "Per Fla. Stat. 458.3245 (allopathic physicians) and Fla. Stat. 459.0127 (osteopathic physicians), advertisements for stem cell therapies that are not FDA approved must include the following notice, clearly legible in type no smaller than the largest font used in the advertisement: 'THIS NOTICE MUST BE PROVIDED TO YOU UNDER FLORIDA LAW. This physician performs one or more stem cell therapies that have not yet been approved by the United States Food and Drug Administration. You are encouraged to consult with your primary care provider before undergoing any stem cell therapy.' A signed informed consent form covering the nature of the treatment, its FDA-approval status, anticipated results, risks, and alternatives is also required.",
    },
    {
      name: "State Notice - Utah",
      text: "Per Utah Code 58-1-512 (licensure consent and disclosure for HCT/P / stem cell therapy under Title 58 of the Utah Code), a health care provider must obtain a signed informed consent before performing stem cell therapy, stating in language the patient can reasonably understand: the nature and character of the proposed treatment, the FDA-approval status of the treatment, the anticipated results, and recognized possible alternative forms of treatment. The requirement may not apply where the provider has obtained an investigational new drug or device approval from the FDA.",
    },
    {
      name: "State Notice - Nevada",
      text: "Per NAC 630.190 (Nevada Administrative Code, Chapter 630, Board of Medical Examiners) under NRS Title 54 / NRS Chapter 630, a Nevada licensee may not advertise in a manner that claims a manifestly incurable disease can be cured, makes false claims of skill or efficacy, claims professional superiority, guarantees results, or includes any statement known or reasonably knowable to be false, deceptive, misleading, or harmful. NRS 630.304 establishes false advertising as grounds for disciplinary action.",
    },
  ],
}

// ---------------------------------------------------------------------------
// Prompt generator - returns a condensed string for Claude system prompts
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

  return `=== FDA/FTC REGULATORY RULES - RISK CLASSIFICATION ===

HIGH RISK - NEVER ALLOWED (flag as HIGH risk):
${redSection}

MEDIUM RISK - RESTRICTED (flag as MEDIUM risk if missing required disclaimers):
${yellowSection}

APPROVED PATTERNS (safe, suggest if missing where appropriate):
${greenSection}

MODALITY-SPECIFIC REGULATORY STATUS:
${modalitySection}

CHANNEL-SPECIFIC RULES:
${channelSection}

REQUIRED DISCLAIMER TEMPLATES:
${disclaimerSection}

=== END REGULATORY RULES ===`
}

// ---------------------------------------------------------------------------
// Rewrite-specific prompt guidance
// ---------------------------------------------------------------------------
export function getComplianceBibleRewriteGuidance(): string {
  return `=== REWRITE PROTOCOL ===
1. High-risk phrases: Replace with approved alternatives. Never keep cure/guarantee/FDA-misrepresentation language.
2. Medium-risk phrases: Keep the content but ADD the required disclaimer text nearby.
3. Always note regulatory status for any modality mentioned (stem cells, exosomes, PRP, peptides, etc.).
4. Use patient experience language: "some patients report...", "may support...", "individual results vary".
5. Never add claims not in the original - only make existing claims compliant.
6. Maintain original tone, length, and marketing intent.
7. If the content mentions a specific modality, include the appropriate disclaimer from the templates.
=== END REWRITE PROTOCOL ===`
}
