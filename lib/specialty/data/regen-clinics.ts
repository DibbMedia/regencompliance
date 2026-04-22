import type { SpecialtyMeta } from "../types"

export const meta: SpecialtyMeta = {
  slug: "regen-clinics",
  specialty: "Regenerative Medicine Clinics",
  specialtyLong: "Regenerative Medicine Practices (stem cell, PRP, exosome)",
  title:
    "FDA/FTC Compliance Software for Regenerative Medicine Clinics — RegenCompliance",
  description:
    "Purpose-built compliance scanning for stem cell, PRP, and exosome clinics. The regen-medicine rule set — built from the exact FDA warning letters and FTC settlements that have defined 25 years of enforcement in this space.",
  heroBadge: "For regen clinics",
  heroTagline:
    "Regenerative medicine is where this compliance category was born. More FDA warning letters have been issued for stem cell and regen marketing than for any other healthcare vertical.",
  riskSummary:
    "Regenerative medicine is the specialty that built the current FDA enforcement playbook on healthcare marketing. The Wellbeing Corporation $5.15M FTC settlement, the Kimera Labs case, the ongoing FDA CBER attention on HCT/P products — every major enforcement action in this category has set precedent that shapes how every regen clinic's marketing is evaluated. Our rule set started with this specialty. If RegenCompliance exists, it is because of how much enforcement happens in regenerative medicine. We are built first for regen clinics.",
  enforcementExamples: [
    {
      title: "FTC $5.15M settlement over social-media stem cell marketing",
      body: "The Wellbeing Corporation settlement is the single most-cited FTC action in healthcare compliance training. A single Instagram post — claiming stem cells could cure arthritis, heal spinal cord injury, and reverse aging — triggered the investigation. The settlement included restitution, a 20-year compliance monitoring order, and a permanent bar on similar claims.",
    },
    {
      title: "FDA warning letters on 'FDA-approved stem cell' language",
      body: "The FDA has issued a sustained campaign of warning letters on language implying FDA approval of HCT/P products. 'FDA-approved stem cells,' 'FDA-approved treatment,' and variations remain among the most-cited phrases in active enforcement.",
    },
    {
      title: "FDA CBER actions on HCT/P marketing outside the 361 pathway",
      body: "HCT/P products are regulated under CBER with a specific pathway for minimal-manipulation, homologous-use products. Marketing products outside this pathway as 'minimally manipulated' or 'homologous use' — or making therapeutic claims that push the product into the 351 (drug/biologic) pathway — has produced warning letters to clinics and lab partners.",
    },
    {
      title: "FTC actions on exosome marketing",
      body: "Exosome marketing has drawn particular FTC attention. Claims that exosomes 'repair,' 'regenerate,' or 'heal' tissue — standard language in exosome marketing a few years ago — are now specific enforcement targets.",
    },
    {
      title: "State AG actions on regen clinic consumer protection",
      body: "Beyond FDA and FTC, state Attorneys General have used consumer protection authority to pursue regen clinics. Texas, California, and New York have each brought actions based on the intersection of state consumer protection and healthcare marketing.",
    },
  ],
  bannedPhrases: [
    {
      phrase: "FDA-approved stem cells",
      why: "Most HCT/P products are not FDA-approved. The phrase is the single most-cited in regen enforcement.",
      alternative: "Performed in an FDA-registered facility using HCT/P materials under the 361 pathway",
      risk: "HIGH",
    },
    {
      phrase: "Cures arthritis",
      why: "Disease cure claim — direct FDA enforcement target going back to the 2010s.",
      alternative: "May support joint comfort and function for some patients",
      risk: "HIGH",
    },
    {
      phrase: "Heals damaged tissue",
      why: "Therapeutic efficacy claim that pushes product into drug-regulatory pathway.",
      alternative: "Some patients report improvement in function and comfort in the treated area",
      risk: "HIGH",
    },
    {
      phrase: "Reverses aging",
      why: "Cited in the Wellbeing settlement; active FTC enforcement target.",
      alternative: "May support aspects of skin and tissue health in the treated area",
      risk: "HIGH",
    },
    {
      phrase: "Guaranteed results",
      why: "Guarantee claim is almost never substantiable for regenerative therapies.",
      alternative: "Outcomes vary; we discuss realistic expectations during every consultation",
      risk: "HIGH",
    },
    {
      phrase: "Proven to regrow cartilage",
      why: "Tissue regeneration claim subject to FDA CBER scrutiny and FTC substantiation rules.",
      alternative: "Clinical studies on [specific protocol] have shown [specific endpoint]; patient outcomes vary",
      risk: "HIGH",
    },
    {
      phrase: "Exosomes repair damaged cells",
      why: "Current FTC target; 'repair' claims on exosomes are under active enforcement.",
      alternative: "Research into exosome biology continues; our current protocols use [product] for [appropriate indication]",
      risk: "HIGH",
    },
    {
      phrase: "100% safe, no side effects",
      why: "Absolute safety claim conflicts with clinical reality and substantiation rules.",
      alternative: "Adverse events are rare but possible; candidacy and risks are discussed at consultation",
      risk: "HIGH",
    },
    {
      phrase: "Alternative to surgery",
      why: "Comparative claim implies equivalence to surgical outcomes without substantiation.",
      alternative: "A non-surgical option some patients choose to explore before considering surgery",
      risk: "MEDIUM",
    },
    {
      phrase: "Works for all patients",
      why: "Universal efficacy claim is not substantiable for any regenerative protocol.",
      alternative: "May be appropriate for patients who meet specific candidacy criteria discussed at consultation",
      risk: "HIGH",
    },
    {
      phrase: "Treats spinal cord injury",
      why: "Direct disease/condition treatment claim on HCT/P products is an FDA target.",
      alternative: "(Remove entirely — no compliant reframe for direct spinal-cord-injury treatment claims)",
      risk: "HIGH",
    },
    {
      phrase: "Breakthrough therapy",
      why: "'Breakthrough therapy' is a specific FDA designation; misuse is a direct flag.",
      alternative: "An emerging area of regenerative treatment we are offering based on current evidence",
      risk: "MEDIUM",
    },
  ],
  commonCatches: [
    {
      title: "Stem cell service page claims beyond the 361 pathway",
      body: "Many regen clinic service pages describe treatments using language that would push the product into the 351 (drug/biologic) pathway. Our scanner is specifically trained on the pathway distinctions — it flags language that implies the regulatory category you are not operating under.",
    },
    {
      title: "Testimonials describing disease-specific outcomes",
      body: "Testimonials that name specific conditions ('my arthritis is gone,' 'I can walk again after my stem cell treatment') carry the disease claim into your marketing via the endorsement. Our scanner catches this pattern — which is what triggered several recent enforcement actions.",
    },
    {
      title: "Social media content from staff personal accounts",
      body: "Staff personal accounts reposting clinic outcomes, partner content, or general regen marketing often contain language that the clinic's main website has already been cleaned up to avoid. Regulators do not distinguish between the clinic's official account and a physician's personal one.",
    },
    {
      title: "Content partnerships with equipment or biologic suppliers",
      body: "Supplier-provided marketing assets (typically written for clinician education rather than consumer marketing) frequently contain language that the supplier itself would not use in consumer-facing channels. Our scanner catches reused supplier content with the specific problem phrases.",
    },
    {
      title: "Conference or webinar recordings posted publicly",
      body: "Internal-audience or clinician-audience content (conferences, CE-credit talks, peer presentations) uses a different standard than consumer marketing. Posting these recordings publicly without review often puts clinical-discussion language into a consumer-marketing surface, which is where compliance issues enter.",
    },
  ],
  caseStudy: {
    title: "A typical first scan on a regenerative medicine clinic homepage",
    before:
      "Our revolutionary stem cell therapy cures arthritis and heals damaged tissue using FDA-approved stem cells. Exosomes repair damaged cells with 100% safe, no side effects — guaranteed results to regrow cartilage and reverse aging. Works for all patients — a proven alternative to surgery for spinal cord injury, joint pain, and chronic conditions.",
    after:
      "Our regenerative medicine offerings are performed in an FDA-registered facility using HCT/P materials under the 361 pathway. Some patients report improvement in joint comfort and function in the treated area; outcomes vary and candidacy is discussed during every consultation. Adverse events are rare but possible and are reviewed at consultation. A non-surgical option some patients choose to explore before considering surgery. Clinical studies continue to inform our protocols; results depend on many factors specific to each patient.",
    outcome:
      "Score went from 8 to 89 across 14 flagged phrases. PDF audit trail generated covering every rewrite. Every core service offering preserved — language reframed to match the 361 regulatory pathway and current FTC enforcement patterns.",
  },
  uniqueValue:
    "Regenerative medicine is the specialty that defined this category of enforcement. More rules in our rule set come from stem cell, PRP, and exosome warning letters than from any other specialty. If you run a regen clinic, this is not a generic compliance tool you are getting — it is a compliance tool that was primarily built around your specialty, with every major enforcement action in your space already encoded as a rule.",
  whoThisIsFor: [
    "Stem cell and HCT/P regenerative clinics",
    "PRP injection practices",
    "Exosome therapy clinics",
    "Bone marrow concentrate (BMC) specialists",
    "Amniotic and placental tissue providers",
    "Orthobiologics-focused sports medicine and orthopedic practices",
    "Integrative/functional regen practices",
    "Regenerative medicine educational businesses",
  ],
  faqs: [
    {
      q: "What is the 361 vs 351 regulatory pathway?",
      a: "Under FDA rules, HCT/P products that meet specific criteria (minimal manipulation, homologous use, no systemic effect, and a few others) fall under the 361 pathway, which does not require FDA pre-market approval. Products that fail any criterion fall under the 351 pathway, which regulates them as drugs or biologics requiring full approval. Your marketing language signals which pathway you are operating under — and claims appropriate for 351 products (treating specific diseases, systemic effects) are often what trigger enforcement on 361-pathway clinics.",
    },
    {
      q: "Does the scanner understand 361 vs 351 distinctions?",
      a: "Yes. This is one of the specific distinctions our rule set models. Language that implies you are treating a disease, achieving systemic effects, or operating with FDA approval is flagged specifically because it signals the wrong pathway. The compliant alternatives are written to match 361-pathway reality while preserving your ability to communicate meaningful patient benefit.",
    },
    {
      q: "What about exosome marketing?",
      a: "Exosomes are a current FTC enforcement priority. The scanner is trained on the specific exosome claims under active enforcement — 'repair,' 'regenerate,' 'heal,' 'restore,' and the combinations that have generated FTC action. Compliant alternatives preserve scientific accuracy while avoiding the specific claim patterns.",
    },
    {
      q: "Can I still discuss clinical studies in my marketing?",
      a: "Yes, with accuracy about what the studies actually show. 'Clinical studies on [protocol] in patients with [condition] have shown [specific endpoint]' is compliant when true. 'Proven to work,' 'clinically proven,' and similar shorthand is not — our scanner catches the shorthand and suggests the accurate framing.",
    },
    {
      q: "How do I handle testimonials with disease-specific outcomes?",
      a: "The safest approach: do not publish testimonials that name specific diseases or conditions, even from willing patients. The testimonial carries the disease claim into your marketing regardless of how the clinic itself frames its services. Our scanner flags this pattern and suggests either generalized satisfaction language or removal. Acceptable testimonial framings discuss patient experience, quality of care, or functional outcomes without disease-specific claims.",
    },
    {
      q: "What about educational content explaining what stem cells are?",
      a: "Genuinely educational content — describing biology, mechanism, research history — is generally fine when clearly separated from your service offerings. Problems arise when educational content is used as marketing for your specific treatments (implying the general science justifies specific treatment claims). Our scanner catches the education-bleeding-into-marketing pattern and suggests structural separation.",
    },
    {
      q: "Do regen clinics still need a healthcare marketing attorney?",
      a: "Yes — this specialty needs attorney involvement more than most. Pathway questions, specific-indication advice, and response to any regulatory contact require counsel. Our scanner handles the volume work; the attorney handles the judgment calls. Most regen clinics using both have counsel review the initial scanner-cleaned version of major assets, then rely on the scanner for day-to-day review.",
    },
    {
      q: "Is RegenCompliance affiliated with any specific regen medicine association or supplier?",
      a: "No. We are an independent compliance software company. We are not affiliated with any specific supplier, association, or regulatory body. Our rule set is built from public enforcement records, not from industry group recommendations.",
    },
  ],
  relatedBlogSlugs: [
    "stem-cell-marketing-costly-phrases",
    "ftc-stem-cell-settlement-social-media",
    "fda-warning-letters-25-year-high",
  ],
  keywords: [
    "stem cell clinic compliance software",
    "regenerative medicine FDA compliance",
    "regen clinic FTC marketing",
    "PRP clinic marketing compliance",
    "exosome marketing compliance",
    "stem cell marketing rules",
    "HCT/P marketing compliance",
  ],
}
