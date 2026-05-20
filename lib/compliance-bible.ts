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
    {
      category: "Compounded retatrutide marketing",
      patterns: [
        "compounded retatrutide", "research-grade retatrutide for human use",
        "FDA approved retatrutide", "next-generation FDA-approved weight-loss shot",
        "retatrutide guaranteed weight loss",
        "tirzepatide knock-off", "compounded tirzepatide approved for weight loss",
      ],
      why: "Retatrutide is investigational (Lilly Phase 3 LY3437943); no NDA filed and not FDA approved. Marketing compounded retatrutide is essentially per se unlawful as introduction of an unapproved new drug into interstate commerce (21 USC 355(a)) and misbranding (21 USC 352). Compounded tirzepatide enforcement parallels semaglutide: FDA removed tirzepatide from the shortage list on Oct 2, 2024, after which 503A/503B compounders generally may not compound essentially a copy of Mounjaro/Zepbound (21 USC 353a(b)(1)(D), 353b(a)(5))",
    },
    {
      category: "Wharton's jelly and birth-tissue efficacy claims",
      patterns: [
        "Wharton's jelly treats arthritis", "umbilical cord stem cell shot heals joints",
        "Wharton's jelly regenerates cartilage",
        "live cells in our cord-blood injection",
        "cord-blood PRP regrows hair", "placenta PRP rejuvenates skin",
        "FDA approved birth-tissue therapy",
      ],
      why: "Wharton's jelly, cord-blood, and placenta-derived products marketed for orthopedic, anti-aging, or systemic indications are perinatal HCT/Ps that typically fail 21 CFR 1271.10(a) homologous-use criteria; FDA enforcement-discretion period for these HCT/Ps ended May 31, 2021. Liveyon owner pled guilty and was sentenced (Sept 2024) to 36 months federal prison for introducing an unapproved new drug; Regenative Labs received an FDA warning letter classifying Wharton's-jelly products as unapproved drugs. 'Cord-blood PRP' is misbranding - PRP refers only to autologous platelets.",
    },
    {
      category: "Wolverine peptide stack marketing",
      patterns: [
        "Wolverine stack", "Wolverine protocol",
        "BPC-157 plus TB-500 healing stack",
        "regenerative peptide stack", "Wolverine peptide protocol",
        "BPC-157 + TB-500 + GHK-Cu healing protocol",
      ],
      why: "BPC-157, TB-500, and injectable GHK-Cu were all placed on FDA's Category 2 of the interim 503A bulks list in September 2023 (significant safety risks identified); none satisfy 21 USC 353a(b)(1)(A) bulk-substance criteria. Marketing a named multi-peptide 'stack' for 'healing' or 'recovery' compounds the unapproved-new-drug exposure and pairs unapproved substances with disease/structure-function claims",
    },
    {
      category: "Lipodissolve and mesotherapy fat-loss claims",
      patterns: [
        "lipodissolve", "injection lipolysis for fat removal",
        "mesotherapy for fat reduction", "fat-dissolving shots",
        "phosphatidylcholine injection for fat loss", "PC/DC fat shot",
        "non-surgical lipo injection",
      ],
      why: "FDA sent warning letters on April 7, 2010 to six US medical spas (and a cyber letter to a Brazilian seller) regarding lipodissolve, stating the drugs used (phosphatidylcholine and sodium deoxycholate, 'PC/DC') are not FDA approved for fat removal and that safety and effectiveness are unknown (https://www.fda.gov/news-events/press-announcements/fda-warns-medical-spas-illegal-marketing-and-sale-unapproved-prescription-drugs-fat-removal). The only FDA-approved injectable for sub-mental fat is Kybella (deoxycholic acid, NDA 206333, approved April 29, 2015) and only for the sub-mental indication; PC/DC mesotherapy or 'lipodissolve' for other body areas remains unapproved",
    },
    {
      category: "Off-label aesthetic device and injection marketing",
      patterns: [
        "FDA approved liquid rhinoplasty", "FDA approved butt filler",
        "FDA cleared shockwave therapy for ED", "GAINSWave is FDA approved",
        "preventative Botox stops aging", "lifetime filler results",
        "permanent filler", "forever lips",
        "FDA approved Botox for [non-labeled indication]",
      ],
      why: "Hyaluronic acid fillers are FDA-approved Class III devices for SPECIFIC anatomic indications; off-label nose / breast / buttock / body contouring fillers carry elevated risk of vascular occlusion, blindness, and stroke (FDA dermal-filler safety panel, March 23, 2021). No acoustic/shockwave device is FDA cleared for the ED indication. Botulinum toxin products are FDA-approved for product-specific indications only. HA fillers are biodegradable - 'permanent / lifetime / forever' filler claims are false",
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
      regulatoryStatus: "510(k) cleared ONLY for bone graft handling. All other uses (joints, hair, face) are off-label. The term 'PRP' refers specifically to AUTOLOGOUS platelet-rich plasma derived from the patient's own peripheral blood; products marketed as 'cord-blood PRP', 'placenta PRP', 'umbilical-cord PRP', or 'birth-tissue PRP' are NOT autologous PRP - they are perinatal HCT/Ps (or unapproved 351 biologics) and fall under the prp_birth_tissue modality, not this one.",
      canSay: [
        "PRP uses your own blood platelets",
        "PRP is being studied for various applications",
        "Some patients report positive experiences with PRP (with disclaimer)",
      ],
      cannotSay: [
        "PRP heals/cures/treats [condition]",
        "PRP is FDA approved for [non-bone-graft use]",
        "PRP guaranteed to regrow hair/heal joints",
        "Cord-blood PRP (this is not autologous PRP - misbranding signal)",
        "Placenta PRP (this is birth-tissue HCT/P, not PRP)",
        "Umbilical-cord PRP (this is birth-tissue HCT/P, not PRP)",
        "Allogeneic / donor PRP (PRP is autologous by definition)",
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
    sermorelin: {
      regulatoryStatus: "Sermorelin acetate is a GHRH analog. It was previously FDA approved as Geref (Serono) and Geref Diagnostic for pediatric growth hormone deficiency and as a diagnostic agent; both manufactured products were voluntarily withdrawn from the market and the original approvals are no longer commercially available (https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019863). Sermorelin has a USP monograph, which is the basis many 503A pharmacies cite for continued compounding under 21 USC 353a(b)(1)(A). Sermorelin was NOT placed on FDA's Category 2 list in the September 2023 peptide action that captured CJC-1295, ipamorelin, BPC-157, and others (https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks). // TODO: needs citation - exact date and federal-register citation for the Geref withdrawal; confirm current USP monograph status for sermorelin acetate (searched FDA Orange Book + USP-NF index, paywalled).",
      canSay: [
        "Sermorelin is a growth-hormone-releasing-hormone analog historically approved by the FDA for pediatric growth-hormone deficiency",
        "The original FDA-approved sermorelin product (Geref) was withdrawn from the market and is not currently commercially available as an approved finished drug",
        "Some compounding pharmacies prepare sermorelin under 503A compounding rules",
        "Sermorelin is not currently FDA approved for adult anti-aging or general wellness use",
      ],
      cannotSay: [
        "FDA approved sermorelin for anti-aging",
        "Sermorelin reverses aging",
        "Sermorelin guaranteed to boost growth hormone safely",
        "Our compounded sermorelin is FDA approved",
        "Risk-free sermorelin protocol",
        "Sermorelin cures age-related growth-hormone decline",
      ],
    },
    ipamorelin: {
      regulatoryStatus: "Ipamorelin acetate is a growth-hormone-releasing peptide (GHRP). It is NOT an FDA-approved drug. On September 29, 2023 FDA placed ipamorelin acetate on Category 2 of the interim 503A bulks list (substances FDA has identified significant safety risks for), alongside BPC-157, CJC-1295, GHK-Cu (injectable), Melanotan II, MOTS-c, Selank, Thymosin Alpha-1, and Thymosin Beta-4 (https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks). FDA announced on September 20, 2024 that AOD-9604, CJC-1295, ipamorelin acetate, Thymosin Alpha-1 (Ta1), and Selank acetate (TP-7) were being removed from Category 2 effective September 27, 2024 because the original nominators withdrew the nominations, and stated it would consult the Pharmacy Compounding Advisory Committee (PCAC) for potential future inclusion on the 503A bulks list. Under 21 USC 353a(b)(1)(A), bulk drug substances used in 503A compounding must be the subject of an applicable USP/NF monograph, be a component of an FDA-approved drug, or appear on the 503A bulks list; ipamorelin satisfies none of those criteria.",
      canSay: [
        "Ipamorelin is not an FDA-approved drug",
        "Ipamorelin does not appear on the FDA section 503A bulks list",
        "Peptide research is an evolving field",
        "We do not prescribe or compound ipamorelin",
      ],
      cannotSay: [
        "Ipamorelin is FDA approved",
        "Ipamorelin safely boosts growth hormone",
        "Ipamorelin reverses aging",
        "Research-grade ipamorelin for human use",
        "Ipamorelin cures age-related decline",
        "FDA-approved ipamorelin protocol",
      ],
    },
    cjc_1295: {
      regulatoryStatus: "CJC-1295 (with or without DAC, Drug Affinity Complex) is a GHRH analog. It is NOT an FDA-approved drug. CJC-1295 was placed on FDA's Category 2 of the interim 503A bulks list on September 29, 2023 as a substance presenting significant safety risks (https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks). FDA removed CJC-1295 from Category 2 on September 27, 2024 because the nominator withdrew the nomination, and announced PCAC would review CJC-1295 for potential future inclusion on the 503A bulks list (PCAC meeting scheduled December 4, 2024 for CJC-1295, AOD-9604, and Thymosin Alpha-1; FDA's pre-meeting briefing recommended NOT including these substances on the bulks list). 21 USC 353a(b)(1)(A) criteria are not satisfied (no USP/NF monograph, not a component of an FDA-approved drug, not currently on the bulks list).",
      canSay: [
        "CJC-1295 is not an FDA-approved drug",
        "CJC-1295 does not appear on the FDA section 503A bulks list",
        "We do not prescribe or compound CJC-1295",
        "Peptide research is an active field of study",
      ],
      cannotSay: [
        "CJC-1295 is FDA approved",
        "CJC-1295 with DAC safely boosts growth hormone",
        "Anti-aging CJC-1295 protocol",
        "Research-grade CJC-1295 for human use",
        "CJC-1295 cures age-related decline",
        "Risk-free CJC-1295 with no side effects",
      ],
    },
    tesamorelin: {
      regulatoryStatus: "Tesamorelin (Egrifta, Egrifta SV, Egrifta WR) IS FDA approved, BUT only for one narrow indication: reduction of excess abdominal fat in adults with HIV-associated lipodystrophy. The original Egrifta NDA approval issued November 10, 2010 (https://www.accessdata.fda.gov/drugsatfda_docs/label/2010/022505lbl.pdf); Egrifta SV was approved November 1, 2019; the F8 concentrated formulation Egrifta WR was approved March 2025 (https://www.pharmacypracticenews.com/FDA-News/Article/03-25/FDA-Approves-Egrifta-WR-to-Treat-Excess-Visceral-Abdominal-Fat-in-Adults-With-HIV/76626). Use of tesamorelin for general fat-loss, body-recomposition, anti-aging, or non-HIV abdominal-fat marketing is off-label and not supported by the approved labeling. Compounded tesamorelin sold as 'research only' or as a body-composition peptide for non-HIV patients is unapproved-drug marketing. // TODO: needs citation - specific FDA warning letter to a compounder or telehealth seller of off-label tesamorelin (searched FDA warning-letter database; no clean hit on 'tesamorelin' as primary subject).",
      canSay: [
        "Tesamorelin (Egrifta, Egrifta SV, Egrifta WR) is FDA approved for the reduction of excess abdominal fat in adults with HIV-associated lipodystrophy",
        "Tesamorelin is not FDA approved for general fat loss or anti-aging",
        "Use of tesamorelin outside the HIV-lipodystrophy indication is off-label",
      ],
      cannotSay: [
        "FDA approved tesamorelin for weight loss",
        "Tesamorelin is an FDA-approved fat-loss peptide",
        "Tesamorelin guaranteed to reduce belly fat",
        "Anti-aging tesamorelin protocol",
        "Compounded tesamorelin same as Egrifta at lower cost",
        "Tesamorelin cures age-related abdominal fat",
      ],
    },
    tb_500: {
      regulatoryStatus: "TB-500 (thymosin beta-4 fragment / LKKTETQ) is not an FDA-approved drug. FDA placed TB-500 (along with full-length thymosin beta-4) on Category 2 of the interim 503A bulks list on September 29, 2023 as a substance presenting significant safety risks (https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks). Section 503A bulk-substance criteria under 21 USC 353a(b)(1)(A) are not satisfied. TB-500 is prohibited in sport under WADA's S2 class (peptide hormones / growth factors). FDA has issued warning letters to peptide compounders selling BPC-157, TB-500, and related substances (e.g., Summit Research Peptides, Dec 10, 2024, https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/summit-research-peptides-695607-12102024). // TODO: needs citation - April 2026 PCAC review status for TB-500 specifically (one secondary source reports removal-from-Cat-2 + PCAC consultation, but I could not retrieve the primary FDA notice in this session).",
      canSay: [
        "TB-500 / thymosin beta-4 is not an FDA-approved drug",
        "TB-500 is prohibited in WADA-regulated sport",
        "We do not prescribe or compound TB-500",
        "Peptide research is an emerging field",
      ],
      cannotSay: [
        "TB-500 heals tendons/ligaments/injuries",
        "TB-500 repairs tissue damage",
        "FDA approved TB-500 protocol",
        "Safe peptide therapy with no side effects",
        "Research-grade TB-500 for human use",
        "TB-500 accelerates recovery",
      ],
    },
    ghk_cu: {
      regulatoryStatus: "GHK-Cu (copper tripeptide-1, also written as copper peptide GHK) is used in two regulatory contexts. (a) As a cosmetic ingredient applied to intact skin in serums and creams, GHK-Cu is regulated as a cosmetic (FDCA section 201(i)) and is not approved or evaluated by FDA for any therapeutic use. (b) As an injectable, GHK-Cu was placed on Category 2 of the interim 503A bulks list on September 29, 2023 specifically for injectable routes of administration (https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks). Topical GHK-Cu was nominated to Category 1, but injectable GHK-Cu is Category 2 (safety risks identified). Injectable GHK-Cu does not satisfy 21 USC 353a(b)(1)(A) bulk-substance criteria. // TODO: needs citation - confirm whether injectable GHK-Cu remained on Category 2 after the April 2026 Category 2 cleanup announcement (secondary sources are inconsistent).",
      canSay: [
        "GHK-Cu is a copper tripeptide used in some cosmetic skincare products",
        "Topical GHK-Cu cosmetic products are regulated as cosmetics, not drugs",
        "Injectable GHK-Cu is not FDA approved",
        "Injectable GHK-Cu does not appear on the FDA section 503A bulks list",
      ],
      cannotSay: [
        "GHK-Cu reverses aging",
        "GHK-Cu cures skin damage / hair loss / wounds",
        "FDA approved injectable GHK-Cu",
        "Research-grade GHK-Cu injectable for human use",
        "Risk-free injectable copper peptide protocol",
      ],
    },
    pt_141: {
      regulatoryStatus: "PT-141 (bremelanotide, brand name Vyleesi) is FDA approved ONLY for the treatment of acquired, generalized hypoactive sexual desire disorder (HSDD) in premenopausal women. Vyleesi was approved June 21, 2019 (https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210557s000lbl.pdf). Use in men, in postmenopausal women, or for erectile dysfunction is off-label and not supported by the approved labeling. Vyleesi labeling carries warnings for transient blood pressure increase and focal hyperpigmentation. Compounded bremelanotide marketed as 'PT-141' for general libido or male sexual function falls outside the approved use and, where compounded as essentially a copy of Vyleesi, may run afoul of 21 USC 353a/353b compounding limits.",
      canSay: [
        "Vyleesi (bremelanotide / PT-141) is FDA approved for acquired, generalized hypoactive sexual desire disorder in premenopausal women",
        "Use of bremelanotide in men or for erectile dysfunction is off-label",
        "Vyleesi labeling warns of transient blood pressure increase and focal hyperpigmentation",
      ],
      cannotSay: [
        "PT-141 cures erectile dysfunction",
        "FDA approved PT-141 for men",
        "PT-141 guaranteed to boost libido",
        "Risk-free libido peptide",
        "Same as Vyleesi at a fraction of the cost",
        "PT-141 reverses sexual dysfunction",
      ],
    },
    tirzepatide: {
      regulatoryStatus: "Tirzepatide is the active ingredient in FDA-approved Mounjaro (approved May 13, 2022 for type 2 diabetes) and Zepbound (approved November 8, 2023 for chronic weight management in adults with obesity or overweight with at least one weight-related condition; https://www.fda.gov/news-events/press-announcements/fda-approves-new-medication-chronic-weight-management). FDA removed tirzepatide from the drug shortage list on October 2, 2024 and reaffirmed that determination in December 2024 (https://www.fda.gov/drugs/drug-safety-and-availability/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss). Once a drug is no longer on the shortage list, 503A and 503B compounders generally may not compound essentially a copy of the FDA-approved product (21 USC 353a(b)(1)(D) and 353b(a)(5)). Eli Lilly has filed multiple civil lawsuits against compounders, weight-loss clinics, and telehealth sellers offering compounded tirzepatide. FDA has issued letters and consumer alerts about counterfeit Mounjaro/Zepbound seized at the border. FTC Section 5 applies to weight-loss claims for compounded tirzepatide.",
      canSay: [
        "FDA-approved tirzepatide is sold as Mounjaro (type 2 diabetes) and Zepbound (chronic weight management)",
        "Tirzepatide was removed from the FDA drug shortage list in October 2024",
        "Compounded tirzepatide is not FDA approved",
        "Discuss whether tirzepatide may be appropriate during a medical consultation",
      ],
      cannotSay: [
        "Our compounded tirzepatide is FDA approved",
        "Compounded tirzepatide approved for weight loss",
        "Same as Mounjaro / Zepbound at a fraction of the cost",
        "Guaranteed weight loss with our tirzepatide shot",
        "Research-grade tirzepatide for human use",
        "Safe weight-loss shot with no side effects",
        "FDA-grade tirzepatide",
      ],
    },
    retatrutide: {
      regulatoryStatus: "Retatrutide (LY3437943) is an investigational triple-agonist (GLP-1 / GIP / glucagon) being developed by Eli Lilly. It is NOT FDA approved for any indication. Lilly's Phase 3 TRIUMPH program is ongoing and Lilly has not submitted a New Drug Application as of the latest publicly reported timelines (https://www.lilly.com/news/stories/what-to-know-about-retatrutide). Because retatrutide is not an approved drug and is not an article of an approved drug, it cannot satisfy 21 USC 353a(b)(1)(A) bulk-substance criteria for 503A compounding, and FDA has stated that compounded 'retatrutide' products being sold by telehealth clinics and compounders are unapproved new drugs. Marketing any compounded or 'research only' retatrutide as a weight-loss therapy is essentially per se unlawful as introduction of an unapproved new drug into interstate commerce (21 USC 355(a)) and misbranding (21 USC 352). FTC Section 5 also applies to associated weight-loss claims. // TODO: needs citation - specific FDA warning letter to a retatrutide seller (one secondary source references FDA warning letters but I could not retrieve the primary FDA letter URL in this session).",
      canSay: [
        "Retatrutide is an investigational Eli Lilly compound currently in Phase 3 trials",
        "Retatrutide is not FDA approved for any indication",
        "Compounded or research-grade retatrutide is not a legal therapy in the United States",
        "We do not prescribe or compound retatrutide",
      ],
      cannotSay: [
        "FDA approved retatrutide",
        "Our compounded retatrutide is safe and effective",
        "Lose [X] pounds guaranteed with retatrutide",
        "Research-grade retatrutide for human use",
        "Next-generation FDA-approved weight-loss shot",
        "Retatrutide cures obesity",
      ],
    },
    hcg_weight_loss: {
      regulatoryStatus: "Human chorionic gonadotropin (HCG) is FDA approved for specific endocrine indications (e.g., infertility, hypogonadotropic hypogonadism, prepubertal cryptorchidism). FDA has explicitly prohibited the use and marketing of HCG for weight loss. On December 6, 2011 FDA and FTC sent seven joint warning letters to companies marketing 'homeopathic' HCG and HCG-related products for weight loss, stating these products are unapproved drugs and that HCG is not approved for any weight-loss indication (https://www.ftc.gov/news-events/news/press-releases/2011/12/fda-ftc-act-against-companies-marketing-illegal-hcg-weight-loss). FDA-approved HCG injectable labeling explicitly states HCG has no recognized effectiveness as adjunctive therapy in the treatment of obesity and that there is no substantial evidence HCG increases weight loss beyond that resulting from caloric restriction. Over-the-counter 'homeopathic' HCG drops, sprays, or pellets for weight loss are illegal.",
      canSay: [
        "HCG is FDA approved for certain fertility and endocrine indications",
        "FDA has not approved HCG for weight loss; FDA-approved HCG labeling states it has no recognized effectiveness for treatment of obesity",
        "Over-the-counter HCG weight-loss products are illegal under FDA and FTC enforcement actions",
      ],
      cannotSay: [
        "HCG diet plan for fast weight loss",
        "HCG drops melt fat",
        "FDA approved HCG for weight loss",
        "Homeopathic HCG safely promotes weight loss",
        "HCG protocol guaranteed to drop 20-30 pounds in 40 days",
        "Doctor-supervised HCG diet is FDA cleared",
      ],
    },
    whartons_jelly: {
      regulatoryStatus: "Wharton's jelly is the gelatinous connective tissue from the umbilical cord. Wharton's jelly products are perinatal HCT/Ps under 21 CFR Part 1271. FDA has consistently treated Wharton's jelly products marketed for orthopedic, anti-aging, or systemic conditions as unapproved new drugs and unlicensed biologics requiring a BLA, because they fail one or more of the four 21 CFR 1271.10(a) criteria for regulation solely under section 361 (most commonly failing the homologous-use requirement). FDA's enforcement-discretion period for certain HCT/Ps ended May 31, 2021 (https://www.fda.gov/vaccines-blood-biologics/cellular-gene-therapy-products/questions-and-answers-regarding-end-compliance-and-enforcement-policy-certain-human-cells-tissues-or). Notable enforcement: FDA warning letter to Regenative Labs (2022) classifying Wharton's-jelly tissue products as unapproved drugs; Liveyon Labs / Liveyon LLC warning letter (Dec 6, 2019) plus subsequent criminal prosecution of owner John Kosolcharoen, who pled guilty and was sentenced (Sept 2024) to 36 months in federal prison for introducing an unapproved new drug into interstate commerce, with CDC documenting 19 patient hospitalizations across eight states tied to bacterial infections from Liveyon's umbilical-cord-derived products. Several states (e.g., Florida 2024 stem-cell law) layer state notice and consent requirements on top of federal status.",
      canSay: [
        "Wharton's jelly is a perinatal tissue regulated by FDA under 21 CFR Part 1271",
        "There are no FDA-approved Wharton's-jelly therapies for orthopedic, anti-aging, or systemic disease indications",
        "Wharton's-jelly products marketed for these uses have been the subject of FDA warning letters and criminal enforcement",
      ],
      cannotSay: [
        "Wharton's jelly treats arthritis / orthopedic injuries / autoimmune disease",
        "Our Wharton's-jelly injection regenerates joints",
        "FDA approved Wharton's-jelly therapy",
        "Umbilical cord stem cell shot is safe and effective",
        "Wharton's jelly reverses aging",
        "Live cells in our Wharton's-jelly product",
      ],
    },
    bmac: {
      regulatoryStatus: "Bone marrow aspirate concentrate (BMAC) is autologous bone marrow that has been aspirated and concentrated by centrifugation. When BMAC is removed from a patient and reimplanted into the SAME patient during the SAME surgical procedure, it can fall under the 21 CFR 1271.15(b) same-surgical-procedure exception and be outside Part 1271 registration and listing requirements (https://www.fda.gov/regulatory-information/search-fda-guidance-documents/same-surgical-procedure-exception-under-21-cfr-127115b-questions-and-answers-regarding-scope). Where BMAC is processed off-site, stored, expanded, combined with another article, or otherwise more-than-minimally manipulated (21 CFR 1271.10(a)(1)), or used for non-homologous purposes, it loses the 1271.15(b) exception and is regulated as an HCT/P (and often as an unapproved biologic / 351 product requiring a BLA). Marketing BMAC for systemic, anti-aging, or non-homologous indications can convert a permissible same-surgical-procedure use into an unapproved-drug enforcement target. FDA's same-surgical-procedure guidance and the broader 'Regulatory Considerations for HCT/Ps: Minimal Manipulation and Homologous Use' guidance (Nov 2017, updated 2020) set the controlling framework. // TODO: needs citation - specific FDA warning letter where BMAC marketing was the cited violation (BMAC enforcement tends to ride alongside SVF or amnio enforcement; I could not isolate a BMAC-primary warning letter in this session).",
      canSay: [
        "BMAC is autologous bone marrow concentrated by centrifugation",
        "When BMAC is taken from and returned to the same patient in the same surgical procedure, it can fall under the 21 CFR 1271.15(b) same-surgical-procedure exception",
        "BMAC use for non-homologous indications (such as systemic, anti-aging, or unrelated tissue claims) is outside the same-surgical-procedure exception and is not FDA approved",
      ],
      cannotSay: [
        "BMAC cures arthritis / regenerates cartilage / reverses joint disease",
        "FDA approved BMAC therapy",
        "Bone marrow stem cells treat / heal / repair [organ or system]",
        "BMAC is a regenerative drug",
        "Risk-free bone marrow stem cell shot",
        "Our BMAC product is safe and effective for [non-homologous indication]",
      ],
    },
    shockwave_ed: {
      regulatoryStatus: "Low-intensity extracorporeal shockwave therapy (Li-ESWT) for erectile dysfunction, often marketed under brand programs such as GAINSWave or under generic 'shockwave for ED' branding, is NOT FDA cleared or approved for the treatment of erectile dysfunction. The American Urological Association's 2018 ED Guideline (updated 2024) classifies Li-ESWT for ED as investigational and recommends use only within research protocols. Several acoustic-wave devices hold 510(k) clearances for OTHER indications (e.g., activation of connective tissue, pain reduction, improved local blood supply, treatment of chronic diabetic foot ulcers, treatment of certain second-degree burns); using a device cleared for one indication to treat ED is off-label device use and clinic marketing claims for ED efficacy are subject to FDA misbranding enforcement under 21 USC 352 and FTC Section 5 substantiation rules. // TODO: needs citation - specific FDA warning letter targeting shockwave-for-ED marketing (searched FDA warning-letter database; no clean primary-target hit for GAINSWave or Li-ESWT ED in this session).",
      canSay: [
        "Low-intensity shockwave therapy for erectile dysfunction is not FDA approved or FDA cleared for the ED indication",
        "Acoustic wave devices may be FDA cleared for other indications such as connective tissue activation or pain reduction",
        "Use of shockwave therapy for erectile dysfunction is considered investigational by the American Urological Association",
      ],
      cannotSay: [
        "FDA approved shockwave therapy for ED",
        "GAINSWave is FDA cleared to treat erectile dysfunction",
        "Shockwave therapy cures erectile dysfunction",
        "Guaranteed restoration of sexual function",
        "Risk-free, drug-free ED cure",
        "Permanent fix for erectile dysfunction with no surgery",
      ],
    },
    botulinum_toxin: {
      regulatoryStatus: "FDA-approved botulinum toxin products include onabotulinumtoxinA (Botox / Botox Cosmetic, Allergan/AbbVie), abobotulinumtoxinA (Dysport, Galderma), incobotulinumtoxinA (Xeomin, Merz), prabotulinumtoxinA (Jeuveau, Evolus), and daxibotulinumtoxinA-lanm (Daxxify, Revance). FDA-approved indications include glabellar lines (and certain other dynamic facial lines for some products), chronic migraine, cervical dystonia, spasticity, strabismus, blepharospasm, hyperhidrosis (axillary), overactive bladder, and neurogenic detrusor overactivity; specific indications vary by product label. All FDA-approved botulinum toxin products carry a Boxed Warning regarding distant spread of toxin effect (https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/103000s5377lbl.pdf). FDA issued 18 warning letters in November 2025 to websites illegally marketing unapproved and misbranded botulinum toxin products (https://www.fda.gov/news-events/press-announcements/fda-warns-companies-over-illegal-marketing-botox-and-related-products) and continues to act against counterfeit/illegally imported botulinum toxin. Use of FDA-approved botulinum toxin for indications outside the approved label (for example 'preventative Botox' marketing for sub-30 patients, masseter slimming for non-dystonia cosmetic shaping, off-label trapezius / scalp / 'Barbie Botox' marketing) is off-label and clinic claims must comply with FDA misbranding rules and FTC substantiation. Injectors must operate within their state scope of practice; unsupervised non-physician injection in some states is itself a regulatory violation.",
      canSay: [
        "FDA-approved botulinum toxin products are indicated for specific cosmetic and medical uses (varies by product label)",
        "All FDA-approved botulinum toxin products carry a Boxed Warning regarding distant spread of toxin effect",
        "Treatment is administered by licensed providers within their state scope of practice",
        "Individual results vary; effects are temporary and typically last three to four months",
      ],
      cannotSay: [
        "Botox cures migraines / depression / TMJ",
        "Risk-free Botox with no side effects",
        "Preventative Botox stops aging",
        "Botox is FDA approved for [any indication not on the product label]",
        "Guaranteed wrinkle-free results",
        "Our imported botulinum toxin is FDA approved",
        "Lifetime Botox results from one treatment",
      ],
    },
    hyaluronic_acid_filler: {
      regulatoryStatus: "Hyaluronic acid (HA) dermal fillers (Juvederm, Restylane, RHA, Belotero, Versa, Skinvive, and related brands) are FDA-approved Class III medical devices regulated under 21 CFR Part 878 and approved through PMA (premarket approval) for specific anatomic sites and indications (e.g., correction of moderate-to-severe facial wrinkles and folds, lip augmentation, cheek augmentation, hand augmentation in certain products). Use in anatomic locations or for indications not on the device label (notably non-surgical rhinoplasty / nose filler, breast / buttock / body-contouring fillers, and intramammary / intra-glute injection) is off-label and carries elevated risk of vascular occlusion, blindness, and stroke. FDA's General and Plastic Surgery Devices Panel reviewed dermal filler safety on March 23, 2021 (https://www.fda.gov/medical-devices/medical-devices-news-and-events/general-and-plastic-surgery-devices-panel-march-23-2021-meeting-announcement) and FDA has issued multiple consumer warnings against the use of unapproved injectable silicone and unapproved dermal fillers for body contouring (https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/dermal-fillers-soft-tissue-fillers). Claims of 'permanent', 'lifetime', or 'forever' results are false for HA fillers, which are biodegradable. Off-label body-contouring injection by non-physicians has been the subject of state criminal prosecutions and FDA-coordinated enforcement.",
      canSay: [
        "Hyaluronic acid dermal fillers are FDA-approved Class III medical devices for specific facial and hand indications",
        "HA filler results are temporary and gradually metabolize over months",
        "Off-label injection sites (such as the nose or body contouring) carry elevated risk of vascular occlusion, blindness, or tissue necrosis",
        "Treatment is administered by licensed providers within their state scope of practice",
      ],
      cannotSay: [
        "Permanent / lifetime / forever filler results",
        "Risk-free filler",
        "FDA approved filler for body contouring / butt augmentation",
        "Liquid rhinoplasty is FDA approved",
        "Lip / cheek / nose filler guaranteed to last [more than the labeled duration]",
        "Our fillers have no risk of vascular complications",
      ],
    },
    prp_birth_tissue: {
      regulatoryStatus: "Marketing the phrase 'PRP' for any product NOT derived from the patient's own peripheral blood is misbranding. Autologous platelet-rich plasma is regulated as a blood product (and the centrifuge/separator system holds a 510(k) clearance only for handling bone graft material). 'Cord-blood PRP', 'umbilical-cord PRP', 'placenta PRP', 'birth-tissue PRP', and 'allogeneic platelets' are NOT autologous PRP - they are perinatal HCT/Ps under 21 CFR Part 1271 (or, where they fail the four 21 CFR 1271.10(a) criteria, unapproved 351 biologics requiring a BLA). FDA's HCT/P enforcement-discretion period ended May 31, 2021 (https://www.fda.gov/vaccines-blood-biologics/cellular-gene-therapy-products/questions-and-answers-regarding-end-compliance-and-enforcement-policy-certain-human-cells-tissues-or). Adipose-derived 'PRP' variants overlap with the svf_adipose modality and inherit the SVF regulatory status (US v. US Stem Cell Clinic, 11th Cir. 2021). Calling a non-autologous platelet or birth-tissue product 'PRP' in marketing copy is itself a misbranding signal.",
      canSay: [
        "Autologous PRP uses the patient's own platelets",
        "Cord-blood, placenta, and umbilical-cord platelet products are perinatal HCT/Ps, not autologous PRP",
        "There are no FDA-approved cord-blood / placenta / umbilical-cord PRP products for orthopedic or anti-aging indications",
      ],
      cannotSay: [
        "Cord-blood PRP regenerates joints / hair / skin",
        "Placenta PRP is more powerful than autologous PRP",
        "FDA approved umbilical-cord PRP",
        "Allogeneic PRP is safer and stronger",
        "Birth-tissue PRP cures arthritis",
        "Our cord-blood platelets are FDA cleared",
      ],
    },
  },

  // -------------------------------------------------------------------------
  // CHANNEL RULES - per-advertising-platform restrictions
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
