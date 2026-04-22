export interface GlossaryTerm {
  slug: string
  term: string
  shortDefinition: string
  fullDefinition: string
  whyItMatters: string
  category: "FDA" | "FTC" | "State" | "Device" | "General"
  relatedTerms?: string[]
  example?: string
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "fda-warning-letter",
    term: "FDA Warning Letter",
    category: "FDA",
    shortDefinition:
      "Formal written notice from the FDA that a practice or company is violating FDA rules and must correct the violations within a stated timeframe.",
    fullDefinition:
      "An FDA warning letter is the FDA's primary enforcement communication tool. It identifies specific violations of the Federal Food, Drug, and Cosmetic Act (FD&C Act) or related regulations and demands corrective action. The recipient typically has 15 business days to respond in writing explaining how they will fix the issue. Failure to respond — or inadequate response — can escalate to consent decrees, injunctions, product seizures, or criminal charges.",
    whyItMatters:
      "Warning letters are public, searchable by regulator databases, and often reported in trade press. Beyond the enforcement consequence, a warning letter typically triggers insurance scrutiny, financing complications, and patient-trust damage. The stated 15-day response window also means scrambling for legal representation and documentation on a tight timeline.",
    example:
      "The FDA's ongoing campaign against stem cell clinics marketing unapproved HCT/P products has produced hundreds of warning letters since 2017 — nearly all initiated based on specific marketing claims found on clinic websites or social media.",
    relatedTerms: ["untitled-letter", "consent-decree", "form-483"],
  },
  {
    slug: "structure-function-claim",
    term: "Structure-Function Claim",
    category: "FDA",
    shortDefinition:
      "A marketing statement about how a product affects the structure or function of the body without claiming to treat, cure, or prevent a specific disease.",
    fullDefinition:
      "Structure-function claims describe what a product does at a biological level — 'supports immune function,' 'maintains healthy joints,' 'promotes energy metabolism.' Under FDA rules, dietary supplements can make structure-function claims with specific disclaimers. Drugs cannot — they must be marketed based on approved indications. The line between a structure-function claim and a disease claim is the line between 'supports joint health' (allowed in some contexts) and 'cures arthritis' (never allowed without drug approval).",
    whyItMatters:
      "Most healthcare marketing compliance issues cluster around this line. Saying 'supports joint health' is structure-function; saying 'relieves arthritis pain' is a disease claim. Same concept, different regulatory category. Understanding which side of the line your claim falls on — and how implicit disease claims can creep in — is the foundation of FDA-compliant marketing.",
    example:
      "'Our protocol supports natural collagen production' is structure-function. 'Our protocol reverses aging' is an implied disease claim. Both describe the same underlying product; only one is compliant.",
    relatedTerms: ["disease-claim", "drug-claim-implied", "section-201g"],
  },
  {
    slug: "disease-claim",
    term: "Disease Claim",
    category: "FDA",
    shortDefinition:
      "A marketing statement claiming that a product can diagnose, treat, cure, prevent, or mitigate a specific disease.",
    fullDefinition:
      "Under FDA rules, any product making a disease claim is legally a drug — regardless of what the product actually is. 'Cures cancer,' 'treats depression,' 'prevents heart disease,' 'heals arthritis' are all disease claims. Making a disease claim about an unapproved product turns the product into an unapproved drug, which is illegal to market. This is the single most common category of FDA enforcement in healthcare marketing.",
    whyItMatters:
      "Disease claims are the fastest route to an FDA warning letter. Even subtle language (symptoms of a disease, conditions that correlate with a disease, historical use for a disease) can count as implied disease claims. Understanding how broadly this category is interpreted is critical to compliant healthcare marketing.",
    example:
      "Warning letters have cited phrases as indirect as 'supports healthy blood pressure' when the surrounding context makes clear the claim is about treating hypertension.",
    relatedTerms: [
      "structure-function-claim",
      "drug-claim-implied",
      "section-201g",
      "off-label-promotion",
    ],
  },
  {
    slug: "drug-claim-implied",
    term: "Implied Drug Claim",
    category: "FDA",
    shortDefinition:
      "A claim that doesn't directly say 'treats disease' but conveys the same meaning through context, testimonials, or associated content.",
    fullDefinition:
      "FDA rules evaluate claims in context, not in isolation. A phrase that is fine in one marketing context might be an implied drug claim in another. Testimonials describing specific disease outcomes, images of patients with specific conditions, links between the product and disease-treatment content, and marketing presence on disease-specific search terms can all convert otherwise-acceptable claims into implied drug claims.",
    whyItMatters:
      "Most FDA warning letters involve implied drug claims, not explicit ones. Sophisticated marketers know not to say 'cures arthritis' — but they post testimonials from arthritis patients, run ads targeting arthritis-related keywords, and publish educational content about arthritis treatment. The cumulative effect is an implied drug claim that the FDA reads as drug marketing.",
    example:
      "A clinic that runs PRP injection ads targeting 'arthritis pain relief' search terms, publishes testimonials from patients describing recovery from arthritis symptoms, and uses images of knee pain — without ever saying the PRP treats arthritis — is making an implied drug claim in the FDA's reading.",
    relatedTerms: ["disease-claim", "off-label-promotion"],
  },
  {
    slug: "material-connection",
    term: "Material Connection",
    category: "FTC",
    shortDefinition:
      "Any relationship between an endorser and a marketer that would affect the weight or credibility of the endorsement — and which must be clearly disclosed.",
    fullDefinition:
      "Under FTC Endorsement Guides, any material connection between an endorser (patient, celebrity, influencer, employee) and the marketer (the healthcare practice) must be clearly and conspicuously disclosed. Material connections include payment, free services, employment, family relationships, discounts, referral arrangements, and ownership. The disclosure must be present wherever the endorsement appears — including on social media where each post is evaluated independently.",
    whyItMatters:
      "Healthcare practices regularly use patient testimonials, staff recommendations, and influencer partnerships without proper material-connection disclosure. This is one of the most common FTC enforcement patterns, and each non-compliant endorsement can be treated as a separate violation.",
    example:
      "An influencer post praising a weight-loss clinic they received a free treatment from must clearly disclose the free treatment — not in a linked bio, not in small print, not behind a click-to-expand.",
    relatedTerms: [
      "ftc-endorsement-guides",
      "typical-experience-disclosure",
      "clear-and-conspicuous",
    ],
  },
  {
    slug: "typical-experience-disclosure",
    term: "Typical-Experience Disclosure",
    category: "FTC",
    shortDefinition:
      "Required disclosure accompanying any endorsement or testimonial describing experience or results that aren't generally typical of what users would experience.",
    fullDefinition:
      "When a testimonial describes a specific result, the FTC presumes consumers understand the testimonial to represent typical experience. If actual typical experience differs, the marketer must disclose typical experience — not in fine print but clearly and conspicuously alongside the testimonial. For weight-loss specifically, the standard is strict due to precedent cases (Jenny Craig, Nutrisystem, POM Wonderful).",
    whyItMatters:
      "Most before/after testimonials show best-case outcomes. If those outcomes are not typical, 'results may vary' is not sufficient — the marketer must state what typical results actually look like. Failure to do this has been the basis of many FTC actions against aesthetic and weight-loss practices.",
    example:
      "A weight-loss testimonial showing 60 pounds lost must be paired with a clear statement of typical results — 'typical clients lose 12–18% of starting body weight over 12 months' — not just 'results vary.'",
    relatedTerms: [
      "material-connection",
      "ftc-endorsement-guides",
      "clear-and-conspicuous",
    ],
  },
  {
    slug: "ftc-endorsement-guides",
    term: "FTC Endorsement Guides",
    category: "FTC",
    shortDefinition:
      "Federal rules governing the use of endorsements, testimonials, influencer partnerships, and reviews in advertising — including disclosure, substantiation, and typical-experience requirements.",
    fullDefinition:
      "The FTC Endorsement Guides (16 CFR Part 255) set the rules for how endorsements and testimonials can be used in advertising. Updated in 2023, the Guides cover material-connection disclosure, typical-experience disclosure, the use of consumer reviews, the rules around incentivized reviews, and the liability of marketers for endorser statements. They apply to every endorsement in every marketing channel, including social media.",
    whyItMatters:
      "Almost every healthcare practice uses testimonials and endorsements. The Endorsement Guides create substantial exposure because every non-compliant endorsement is a separate potential violation, and the 2023 updates tightened several previously-ambiguous areas.",
    relatedTerms: [
      "material-connection",
      "typical-experience-disclosure",
      "clear-and-conspicuous",
      "substantiation",
    ],
  },
  {
    slug: "consent-decree",
    term: "Consent Decree",
    category: "FDA",
    shortDefinition:
      "A court-enforced settlement between a regulator and a defendant, establishing binding corrective measures and ongoing oversight.",
    fullDefinition:
      "A consent decree is a formal court order memorializing a settlement. Unlike a warning letter (which requests correction), a consent decree is binding and enforceable through contempt proceedings. Consent decrees typically include specific corrective actions, ongoing compliance monitoring (often 5–20 years), financial penalties, and bars on specific conduct. Violation of a consent decree is a separate offense from the original violation.",
    whyItMatters:
      "Consent decrees are the practical end-state of many enforcement actions that start as warning letters. They are public records, they affect financing and insurance, and violating one carries consequences far beyond the original enforcement.",
    example:
      "The $5.15M Wellbeing Corporation FTC settlement included a 20-year compliance monitoring consent decree — meaning the company's marketing is subject to FTC review for two decades after the original social media post.",
    relatedTerms: ["fda-warning-letter", "cease-and-desist"],
  },
  {
    slug: "untitled-letter",
    term: "Untitled Letter",
    category: "FDA",
    shortDefinition:
      "An FDA enforcement communication for violations that are less serious than warning letters but still require correction.",
    fullDefinition:
      "Untitled letters address violations that the FDA considers less serious than warning-letter-level issues. They do not carry the same 15-day response requirement and are generally not made public in the same way. However, they still require corrective action and can escalate to warning letters if uncorrected or if additional issues emerge.",
    whyItMatters:
      "Practices sometimes receive untitled letters and dismiss them as minor — which can lead to subsequent warning letters or escalated enforcement. Any FDA communication should be treated as a flag that the agency is watching and that compliance needs attention.",
    relatedTerms: ["fda-warning-letter", "form-483"],
  },
  {
    slug: "form-483",
    term: "Form 483",
    category: "FDA",
    shortDefinition:
      "Written observations issued by FDA investigators during inspections, noting specific practices that may violate FDA regulations.",
    fullDefinition:
      "Form 483 (formally FDA Form 483) is a formal list of observations issued at the conclusion of an FDA inspection. Each observation identifies a specific practice or condition that may violate FDA rules. The recipient is typically expected to respond in writing addressing each observation. A Form 483 can precede a warning letter if observations aren't adequately addressed.",
    whyItMatters:
      "Form 483s are most relevant to FDA-inspected facilities (compounding pharmacies, HCT/P processing labs, certain clinic types). For most marketing-focused practices, Form 483s are rare — but compounding pharmacy partners or tissue suppliers who receive them can have downstream effects on your marketing messaging.",
    relatedTerms: ["fda-warning-letter", "untitled-letter"],
  },
  {
    slug: "adulterated",
    term: "Adulterated",
    category: "FDA",
    shortDefinition:
      "A drug, device, or tissue product that fails to meet FDA safety, purity, manufacturing, or quality standards.",
    fullDefinition:
      "Adulterated is a defined FDA term — products can be adulterated because of manufacturing issues (contamination, quality failures), mixing with other substances, or specific regulatory failures (e.g., HCT/P products processed in ways that take them outside the 361 pathway). Distributing adulterated products is illegal, and marketing them can contribute to the enforcement case.",
    whyItMatters:
      "Clinics generally don't manufacture products but they do distribute them (via administration to patients). Marketing an adulterated product — even unknowingly — can make the clinic part of the enforcement chain. Verifying supplier status matters.",
    relatedTerms: ["misbranded", "hct-p", "cber"],
  },
  {
    slug: "misbranded",
    term: "Misbranded",
    category: "FDA",
    shortDefinition:
      "A drug, device, or tissue product whose labeling (including advertising) is false, misleading, or omits required information.",
    fullDefinition:
      "Misbranded is the category that covers most marketing-related FDA violations. A product becomes misbranded when its advertising, labeling, or promotional material is false or misleading, or fails to include required information. Crucially, the FDA reads product labeling broadly — websites, social media, consumer ads, and clinic marketing can all be considered labeling when they describe the product.",
    whyItMatters:
      "Most healthcare marketing compliance work is essentially misbranding avoidance. The warning letters, consent decrees, and enforcement actions most practices worry about are technically misbranding cases.",
    relatedTerms: ["adulterated", "disease-claim", "drug-claim-implied"],
  },
  {
    slug: "cber",
    term: "CBER (Center for Biologics Evaluation and Research)",
    category: "FDA",
    shortDefinition:
      "The FDA center that regulates biological products — including vaccines, blood products, gene therapies, and human cell and tissue products (HCT/Ps).",
    fullDefinition:
      "CBER is the arm of the FDA with primary jurisdiction over biologics, including the HCT/P products that regenerative medicine clinics work with. CBER has taken a sustained enforcement posture on the marketing of HCT/P products, particularly around claims that push products outside the 361 pathway into the 351 (drug/biologic) pathway.",
    whyItMatters:
      "Regen clinics marketing stem cell, exosome, and tissue-based products are primarily in CBER's enforcement scope. Understanding CBER's specific priorities matters — and those priorities have shifted over time.",
    relatedTerms: ["hct-p", "minimal-manipulation", "homologous-use"],
  },
  {
    slug: "hct-p",
    term: "HCT/P",
    category: "FDA",
    shortDefinition:
      "Human Cells, Tissues, and Cellular and Tissue-Based Products — the FDA regulatory category that includes stem cells, bone marrow concentrate, amniotic tissue, and related products.",
    fullDefinition:
      "HCT/P is the FDA regulatory designation for a broad category of human cell and tissue products. HCT/P products meeting specific criteria (minimal manipulation, homologous use, no systemic effect, a few others) fall under the 361 pathway, which does not require FDA pre-market approval. Products that fail any criterion fall under the 351 pathway, which treats them as drugs or biologics requiring full FDA approval before marketing.",
    whyItMatters:
      "The 361 vs 351 pathway distinction is foundational for regen clinic compliance. Marketing language often signals which pathway the practice is operating under — and language appropriate for 351 products (treating specific diseases, systemic effects) is often what triggers CBER enforcement against 361-pathway clinics.",
    relatedTerms: [
      "cber",
      "minimal-manipulation",
      "homologous-use",
      "adulterated",
      "misbranded",
    ],
  },
  {
    slug: "off-label-promotion",
    term: "Off-Label Promotion",
    category: "FDA",
    shortDefinition:
      "Promotional marketing of an FDA-approved drug or device for uses that are not part of its FDA-approved labeling.",
    fullDefinition:
      "Off-label use (prescribing or using a product outside its approved indications) is a normal and generally legal part of medical practice. Off-label promotion — marketing a product for off-label uses — is a different matter. The FDA prohibits off-label promotion by manufacturers and has extended similar scrutiny to prescribing practices that market off-label use directly to consumers.",
    whyItMatters:
      "This is especially relevant in med spa and aesthetic marketing (fillers marketed for non-labeled indications) and in weight-loss marketing (Ozempic marketed as a weight-loss drug, though its Type 2 diabetes labeling is separate from the weight-loss-specific Wegovy labeling).",
    relatedTerms: ["drug-claim-implied", "misbranded", "disease-claim"],
  },
  {
    slug: "section-201g",
    term: "Section 201(g) FD&C Act",
    category: "FDA",
    shortDefinition:
      "The statutory definition of a 'drug' under the Federal Food, Drug, and Cosmetic Act — which is triggered by the claims made about a product.",
    fullDefinition:
      "Section 201(g) defines a drug as any article intended for use in the diagnosis, cure, mitigation, treatment, or prevention of disease — or intended to affect the structure or any function of the body. Critically, intent is established by the claims made about the product. If a clinic markets PRP injections as treating arthritis, the claims turn PRP into a drug under 201(g), regardless of what PRP physically is. Marketing an unapproved drug is illegal.",
    whyItMatters:
      "Understanding 201(g) is how you understand why the phrase 'cures arthritis' is so dangerous — it doesn't just make the claim problematic, it turns the underlying product into an unapproved drug. Many warning letters cite 201(g) directly.",
    relatedTerms: ["disease-claim", "structure-function-claim", "misbranded"],
  },
  {
    slug: "substantiation",
    term: "Substantiation",
    category: "FTC",
    shortDefinition:
      "The evidence required to support every objective claim made in advertising.",
    fullDefinition:
      "Under FTC rules, every objective claim in advertising must be substantiated by 'competent and reliable scientific evidence' before it is made. For health claims specifically, the evidence bar is typically well-designed clinical studies. 'Clinically proven,' 'proven to work,' specific numerical outcome claims, and comparison claims all require substantiation meeting this standard.",
    whyItMatters:
      "Many healthcare marketing claims that seem innocuous ('clinically proven,' 'most effective,' 'fastest results') require substantiation that most practices do not actually have. The FTC's 'prior substantiation' requirement means you need the evidence before making the claim — not after getting a letter.",
    relatedTerms: [
      "competent-and-reliable-scientific-evidence",
      "ftc-endorsement-guides",
    ],
  },
  {
    slug: "clear-and-conspicuous",
    term: "Clear and Conspicuous",
    category: "FTC",
    shortDefinition:
      "The FTC standard for how prominently disclosures must be presented — including size, color, placement, and duration.",
    fullDefinition:
      "Clear and conspicuous is the standard for all required disclosures (material connections, typical-experience, risk information). A disclosure that is technically present but buried in fine print, in a linked page, in a color that blends with the background, or on screen too briefly to read does not meet the standard. The 2023 FTC Endorsement Guides update tightened this standard specifically for social media and video contexts.",
    whyItMatters:
      "Many practices include disclosures — but in ways that don't meet the clear-and-conspicuous standard. 'Results may vary' in footer text, in linked terms pages, or in two-second end-of-video flashes typically fails this standard.",
    relatedTerms: [
      "material-connection",
      "typical-experience-disclosure",
      "ftc-endorsement-guides",
    ],
  },
  {
    slug: "cease-and-desist",
    term: "Cease and Desist",
    category: "General",
    shortDefinition:
      "A written demand that a practice stop specific behavior, typically issued by regulators or private parties with a legal basis.",
    fullDefinition:
      "Cease-and-desist letters come from many sources — state AGs, state medical boards, competing companies, trademark holders (e.g., pharmaceutical companies whose brand names are being used in practice marketing). Unlike warning letters from federal agencies, cease-and-desist letters vary widely in force and may or may not represent the opening of a formal enforcement action.",
    whyItMatters:
      "Some practices dismiss cease-and-desist letters because they lack the gravity of an FDA warning letter. This is dangerous — a cease-and-desist can be a precursor to litigation, state board action, or trademark dispute escalation.",
    relatedTerms: ["fda-warning-letter", "consent-decree"],
  },
  {
    slug: "510k-clearance",
    term: "510(k) Clearance",
    category: "Device",
    shortDefinition:
      "A premarket notification pathway allowing a medical device to be marketed based on substantial equivalence to an existing legally-marketed device.",
    fullDefinition:
      "510(k) is the most common pathway to market for medical devices. A device that is substantially equivalent to an existing device can be cleared through the 510(k) process without the full PMA (Premarket Approval) process required for higher-risk devices. 510(k)-cleared devices are legally 'FDA-cleared,' not 'FDA-approved.'",
    whyItMatters:
      "Most aesthetic lasers, energy devices, and similar tools are 510(k)-cleared. Marketing them as 'FDA-approved' is a factual error that has generated warning letters across the aesthetic device industry.",
    relatedTerms: ["fda-approval-vs-clearance"],
  },
  {
    slug: "fda-approval-vs-clearance",
    term: "FDA Approval vs FDA Clearance",
    category: "Device",
    shortDefinition:
      "Two different FDA pathways with different evidentiary standards — and legally distinct statuses that must not be conflated in marketing.",
    fullDefinition:
      "FDA approval (typically via PMA or NDA) requires clinical evidence of safety and efficacy. FDA clearance (typically via 510(k)) requires demonstration of substantial equivalence to an existing device. FDA registration is separate still — it refers to the manufacturer's status, not the product's evaluation. These are legally distinct terms, and using them incorrectly is a direct enforcement flag.",
    whyItMatters:
      "Many healthcare practices use 'FDA-approved' loosely. The FDA reads each term as a specific regulatory status, and misuse is a direct and easily-cited violation. This is one of the most common patterns in both FDA and state medical board enforcement.",
    relatedTerms: ["510k-clearance"],
  },
  {
    slug: "ind",
    term: "IND (Investigational New Drug)",
    category: "FDA",
    shortDefinition:
      "FDA authorization allowing an experimental drug to be used in clinical trials before approval.",
    fullDefinition:
      "An IND is the mechanism that allows a drug to be used in human studies. Research conducted under an IND is separate from clinical practice — which is why 'we are part of a clinical study' and 'this is an experimental treatment we offer' carry very different meanings in marketing. Marketing language that implies IND-protected research status without actually having an IND can be cited as misbranding.",
    whyItMatters:
      "Some clinics blur the line between clinical research and patient care to justify novel treatment marketing. This is a frequent FDA enforcement pattern in regen medicine and certain weight-loss/hormone practices.",
    relatedTerms: ["off-label-promotion", "misbranded"],
  },
  {
    slug: "minimal-manipulation",
    term: "Minimal Manipulation",
    category: "FDA",
    shortDefinition:
      "One of the criteria HCT/P products must meet to fall under the 361 pathway without FDA premarket approval.",
    fullDefinition:
      "Minimal manipulation means processing that does not alter the relevant biological characteristics of the cells or tissues. The FDA has issued specific guidance on what processing steps count as minimal vs. more-than-minimal manipulation — and the definitions have tightened over time. Products that cross into more-than-minimal manipulation fall under the 351 (drug/biologic) pathway requiring full approval.",
    whyItMatters:
      "Regen clinics operating under the 361 pathway must ensure their products and partners meet minimal manipulation requirements. Marketing claims about advanced processing, activation, or enhancement can undermine the regulatory basis for operating under 361.",
    relatedTerms: ["hct-p", "cber", "homologous-use"],
  },
  {
    slug: "homologous-use",
    term: "Homologous Use",
    category: "FDA",
    shortDefinition:
      "One of the criteria HCT/P products must meet to fall under the 361 pathway — the product must perform the same basic function it performed in the donor.",
    fullDefinition:
      "Homologous use requires that the HCT/P product perform the same basic function in the recipient that it performed in the donor. Bone-to-bone, cartilage-to-cartilage, skin-to-skin are classic homologous uses. Using a tissue product for a non-homologous purpose (e.g., using amniotic tissue to treat knee osteoarthritis, if amniotic tissue's native function isn't joint-related) can take the product outside the 361 pathway.",
    whyItMatters:
      "This is one of the most-cited criteria in CBER enforcement on regen clinics. Marketing that describes non-homologous uses can undermine 361-pathway operation even when the physical product would otherwise qualify.",
    relatedTerms: ["hct-p", "minimal-manipulation", "cber"],
  },
  {
    slug: "competent-and-reliable-scientific-evidence",
    term: "Competent and Reliable Scientific Evidence",
    category: "FTC",
    shortDefinition:
      "The FTC's substantiation standard — tests, analyses, research, or studies conducted and evaluated objectively by qualified people using generally-accepted procedures.",
    fullDefinition:
      "'Competent and reliable scientific evidence' is the FTC's required basis for health and efficacy claims. For specific objective health claims, this typically means well-designed clinical studies — randomized, controlled, of adequate duration and population size. Anecdotal reports, open-label observations, and 'most users report' data generally do not meet the standard.",
    whyItMatters:
      "Most practice-level substantiation files do not meet the competent-and-reliable standard. This is what makes 'clinically proven' and 'proven to work' such dangerous marketing phrases — the FTC treats the claim as a representation that the practice has competent-and-reliable evidence on file.",
    relatedTerms: ["substantiation", "ftc-endorsement-guides"],
  },
  {
    slug: "deceptive-act-or-practice",
    term: "Deceptive Act or Practice",
    category: "FTC",
    shortDefinition:
      "The primary category of FTC enforcement — any material representation, omission, or practice likely to mislead reasonable consumers.",
    fullDefinition:
      "Under Section 5 of the FTC Act, deceptive acts or practices in commerce are prohibited. Deception has three elements: (1) a representation, omission, or practice that (2) is likely to mislead a reasonable consumer (3) in a way material to the consumer's decision. Deceptive does not require proof of actual deception — the likelihood is enough. And 'material' is interpreted broadly (anything affecting a purchase decision).",
    whyItMatters:
      "Most FTC healthcare enforcement is fundamentally a deceptive-practice case. Understanding the three-element test helps explain why specific marketing patterns (testimonials without typical-experience disclosure, omission of risks, ambiguous safety claims) are enforced even when no consumer actually complains.",
    relatedTerms: ["ftc-endorsement-guides", "substantiation"],
  },
  {
    slug: "state-medical-board-rules",
    term: "State Medical Board Rules",
    category: "State",
    shortDefinition:
      "State-level rules governing physician and practice advertising, specialty claims, supervision requirements, and professional conduct.",
    fullDefinition:
      "Each state's medical board has its own rules on physician advertising — what titles can be used, what specialty claims are permissible, what supervision language is acceptable, what disclosures are required. These rules are often stricter than FTC rules in specific areas (e.g., 'board-certified' terminology) and can be the basis for state-level discipline independent of any federal action.",
    whyItMatters:
      "State medical boards can suspend licenses, which is a more immediate business threat than an FDA warning letter. California, Texas, Florida, and New York have particularly active medical boards with specific marketing rules practices must follow.",
    relatedTerms: ["deceptive-act-or-practice"],
  },
  {
    slug: "hipaa-marketing-rule",
    term: "HIPAA Marketing Rule",
    category: "General",
    shortDefinition:
      "The portion of HIPAA that restricts how protected health information (PHI) can be used for marketing purposes.",
    fullDefinition:
      "Under HIPAA, PHI cannot be used or disclosed for marketing purposes without patient authorization, with specific exceptions (face-to-face communications, promotional gifts of nominal value, treatment communications). Using patient photos, names, or treatment details in marketing requires specific HIPAA-compliant authorization. This is separate from FTC endorsement rules — both apply to patient testimonials.",
    whyItMatters:
      "Practices often focus on FTC rules for testimonials while missing the HIPAA layer. Using a patient's photo or treatment story in marketing without compliant authorization is a HIPAA violation regardless of whether the testimonial itself is FTC-compliant.",
    relatedTerms: ["material-connection"],
  },
  {
    slug: "dshea",
    term: "DSHEA (Dietary Supplement Health and Education Act)",
    category: "FDA",
    shortDefinition:
      "The federal law establishing the regulatory framework for dietary supplements — including what claims supplements can and cannot make.",
    fullDefinition:
      "DSHEA allows dietary supplements to make structure-function claims (not disease claims) with a specific disclaimer and proper substantiation. DSHEA does not apply to drugs, devices, or services — which is why healthcare practices cannot simply rely on 'supplement-style' claim language in marketing their services. DSHEA-style claims on non-supplement products can actually be worse than other claim language because they signal the wrong regulatory framework.",
    whyItMatters:
      "Some healthcare practices import supplement-industry marketing patterns into service marketing. This commonly creates both structure-function confusion and DSHEA-compliance confusion simultaneously.",
    relatedTerms: ["structure-function-claim", "disease-claim"],
  },
]

export const TERMS_BY_CATEGORY: Record<GlossaryTerm["category"], GlossaryTerm[]> = {
  FDA: GLOSSARY.filter((t) => t.category === "FDA"),
  FTC: GLOSSARY.filter((t) => t.category === "FTC"),
  State: GLOSSARY.filter((t) => t.category === "State"),
  Device: GLOSSARY.filter((t) => t.category === "Device"),
  General: GLOSSARY.filter((t) => t.category === "General"),
}
