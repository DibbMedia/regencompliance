import type { SpecialtyMeta } from "../types"

export const meta: SpecialtyMeta = {
  slug: "med-spas",
  specialty: "Med Spas",
  specialtyLong: "Medical Spa Practices",
  title: "FDA/FTC Compliance Software for Med Spas - RegenCompliance",
  description:
    "Purpose-built compliance scanning for medical spas. Catches the banned phrases, off-label device marketing, and before/after photo violations that trigger FDA warning letters and FTC investigations in the aesthetic industry.",
  heroBadge: "For med spas",
  heroTagline:
    "Medical spas sit at the intersection of FDA device rules, FTC endorsement rules, and state medical board supervision requirements - a regulatory triangle no other specialty deals with in the same way.",
  riskSummary:
    "Med spas are one of the highest-enforcement healthcare categories in 2026. The FDA treats injectables, lasers, and aesthetic devices as regulated medical products; the FTC treats your marketing under the full Endorsement Guides; state medical boards treat your treatments as the practice of medicine. Any one of these authorities can issue a letter based on a single Instagram caption or homepage phrase. RegenCompliance is built to catch the specific patterns each one targets - not as a generic marketing check, but as a med-spa-specific compliance gate.",
  enforcementExamples: [
    {
      title: "FDA warning letters on off-label filler and toxin marketing",
      body: "The FDA has issued letters to med spas marketing dermal fillers and neurotoxins for indications not included in the product labeling - 'non-surgical rhinoplasty' claims on fillers not FDA-approved for nasal use, or 'chin slimming' on neurotoxins approved for glabellar lines. These are disease-state adjacent claims that the FDA reads as unapproved use promotion.",
    },
    {
      title: "FTC actions on before/after photo practices",
      body: "The FTC Endorsement Guides require that before/after images fairly represent typical results. Med spa before/afters curated to show best-case outcomes - lighting, posing, Photoshop enhancement, or unrepresentative patient selection - have been cited as deceptive when paired with efficacy claims.",
    },
    {
      title: "State medical board discipline on unsupervised treatment marketing",
      body: "Most states require physician supervision for med-spa treatments. Marketing that implies aestheticians or nurse injectors operate independently - 'our licensed injectors,' 'book directly with your nurse' - has triggered state medical board investigations in California, Texas, Florida, and New York in particular.",
    },
    {
      title: "FDA warning letters on laser energy marketing",
      body: "'FDA-approved' and 'FDA-cleared' carry specific legal meanings. Using 'FDA-approved' on a laser device that is FDA-cleared but not approved, or marketing a cleared device for non-cleared indications, has generated letters across the aesthetic laser industry.",
    },
  ],
  bannedPhrases: [
    {
      phrase: "FDA-approved filler",
      why: "Most fillers are FDA-cleared, not approved. These are legally distinct categories.",
      alternative: "FDA-cleared for [specific labeled indication]",
      risk: "HIGH",
    },
    {
      phrase: "Permanent results with one treatment",
      why: "Efficacy and duration claims without substantiation; also conflicts with label data for most products.",
      alternative: "Results typically last [range] for most patients; individual outcomes vary",
      risk: "HIGH",
    },
    {
      phrase: "No side effects",
      why: "Flat-out absence-of-harm claim is rarely substantiable and conflicts with prescribing information.",
      alternative: "Most patients tolerate treatment well; potential side effects are discussed during consultation",
      risk: "HIGH",
    },
    {
      phrase: "Non-surgical rhinoplasty",
      why: "Implies the filler is approved for nasal reshaping; most are not.",
      alternative: "Filler treatment to address concerns in the nasal area - limitations and candidacy discussed at consultation",
      risk: "HIGH",
    },
    {
      phrase: "Reverses aging",
      why: "Reversal / cure language on aesthetic concerns crosses into disease-claim territory.",
      alternative: "Can improve the appearance of fine lines and restore volume for many patients",
      risk: "MEDIUM",
    },
    {
      phrase: "Guaranteed results",
      why: "Guarantee claims are almost never substantiable in aesthetic medicine.",
      alternative: "Our patients typically report high satisfaction with their results",
      risk: "HIGH",
    },
    {
      phrase: "Cures acne scarring",
      why: "Disease-state cure language subject to FDA disease-claim rules.",
      alternative: "Can significantly improve the appearance of acne scarring",
      risk: "HIGH",
    },
    {
      phrase: "Book directly with our nurse injector",
      why: "Implies independent practice in states requiring physician supervision of injectable treatments.",
      alternative: "Consultations with our medical team, under the supervision of our medical director",
      risk: "MEDIUM",
    },
    {
      phrase: "Revolutionary technology",
      why: "Unsubstantiated superiority claim; also commonly flagged under FTC deceptive-advertising review.",
      alternative: "Advanced technology proven in clinical use for [specific indication]",
      risk: "MEDIUM",
    },
    {
      phrase: "Medical-grade at home results",
      why: "Equivalence-to-medical-treatment claim without substantiation; misleads consumers about outcome comparability.",
      alternative: "In-office treatments using professional-strength formulations not available over-the-counter",
      risk: "MEDIUM",
    },
    {
      phrase: "Safer than surgery",
      why: "Comparative safety claim requires head-to-head clinical evidence; rarely substantiable.",
      alternative: "A non-surgical option for patients seeking [specific outcome]",
      risk: "MEDIUM",
    },
    {
      phrase: "No downtime",
      why: "Absolute claim; nearly every treatment has some downtime for some patients.",
      alternative: "Minimal downtime - most patients return to normal activities within [timeframe]",
      risk: "LOW",
    },
  ],
  commonCatches: [
    {
      title: "Instagram captions with 'before treatment / after treatment'",
      body: "Short-form caption language is where FTC typical-experience disclosures are most often missed. Our scanner catches missing disclosures and suggests the exact insert text.",
    },
    {
      title: "Injector bio pages claiming outcomes",
      body: "Staff bio pages that claim clinical outcomes ('Nurse Smith has helped hundreds of patients achieve younger-looking skin') slip past most review because they are about the staff member - but they are still marketing claims subject to the same rules.",
    },
    {
      title: "Pre-treatment consent language repurposed as marketing",
      body: "Copy that works on a consent form - detailing treatment benefits to an already-committed patient - violates marketing rules when reused on a public service page.",
    },
    {
      title: "Device manufacturer marketing reused verbatim",
      body: "Many med spas copy device manufacturer marketing onto their own sites. Manufacturer marketing is written for B2B to clinics and often does not meet end-consumer rules. Our scanner catches this automatically.",
    },
    {
      title: "Seasonal promotions layered with outcome claims",
      body: "A 'Summer Skin' or 'New Year New You' promotion that layers a package deal on top of unsubstantiated outcome language is a common pattern in med spa marketing - and a common target for state medical board review.",
    },
  ],
  caseStudy: {
    title: "A typical first scan on a med spa homepage",
    before:
      "Our revolutionary non-surgical rhinoplasty uses FDA-approved fillers to permanently reshape your nose with no side effects and no downtime. Book directly with our expert nurse injectors for guaranteed results - safer than surgery, proven to reverse signs of aging.",
    after:
      "Our non-surgical approach uses FDA-cleared fillers to address concerns in the nasal area - candidacy and limitations discussed at consultation. Results typically last [range] for most patients; individual outcomes vary. Consultations with our medical team, under the supervision of our medical director. Most patients tolerate treatment well; potential side effects are reviewed during your consultation.",
    outcome:
      "Score went from 18 to 87 across 9 flagged phrases. Full PDF audit report generated for the compliance file. No language removed - every phrase rewritten to be compliant while still converting.",
  },
  uniqueValue:
    "Med spa marketing lives in the overlap of FDA device-labeling rules, FTC endorsement rules, and state medical board supervision rules. A generic compliance tool might catch the obvious FDA disease claims; it will miss the supervision-implication language that state medical boards target and the typical-experience gaps that the FTC targets. RegenCompliance is built for the intersection, not just one dimension.",
  whoThisIsFor: [
    "Solo-owner med spas and medical-director-led practices",
    "Multi-location med spa groups with unified marketing",
    "Nurse-injector-led practices with physician supervision",
    "Laser-focused aesthetic practices",
    "Plastic surgery practices with med spa divisions",
    "Dermatology practices offering med spa services",
    "Franchise med spa operators",
    "Med spa marketing agencies",
  ],
  faqs: [
    {
      q: "What makes med spa compliance different from other healthcare marketing?",
      a: "The overlap of three authorities. The FDA regulates your injectables and devices as medical products with specific labeled indications. The FTC regulates your before/after photos and testimonials under the Endorsement Guides. Your state medical board regulates supervision requirements on the underlying treatments. Any of the three can issue a letter on the same piece of marketing. Most compliance tools model one of these dimensions; med spas need all three.",
    },
    {
      q: "Does the scanner know the difference between FDA-approved and FDA-cleared?",
      a: "Yes. This is one of the most common med spa compliance failures - 'FDA-approved' applied to an FDA-cleared device. The scanner flags it every time and offers the correct alternative. Same for '510(k)-cleared,' 'FDA-registered,' and similar phrases that carry specific legal meanings.",
    },
    {
      q: "What about before/after photo compliance?",
      a: "Our scanner does not analyze images directly. It analyzes the caption, surrounding copy, and disclosure text. The FTC Endorsement Guides require typical-experience disclosures near before/after images; most med spa pages are missing the disclosure, have it in fine print, or place it somewhere the FTC does not consider 'clear and conspicuous.' The scanner flags these patterns and suggests compliant disclosure language.",
    },
    {
      q: "Can I scan Instagram and TikTok content?",
      a: "Yes. Paste any caption, script, or ad copy into the scanner - it treats social copy as first-class content, not a second-tier surface. Short-form captions are where most med spa compliance failures actually happen because they bypass the review process that website pages get.",
    },
    {
      q: "Does the tool help with state medical board supervision language?",
      a: "Yes. The scanner is trained on the supervision-implication patterns that California, Texas, Florida, and New York state medical boards most commonly target - 'book with your nurse,' 'our licensed injectors,' 'independently owned' when supervision is actually in place. It flags the pattern and suggests a compliant reframing. Note: final state-law interpretation should always involve an attorney licensed in your state.",
    },
    {
      q: "What does a med spa compliance audit typically cost without software?",
      a: "Healthcare marketing attorneys quote $5K–$25K for a med spa audit, depending on practice size and number of pages. Ongoing pre-publish review at attorney rates ($400–$800/hr) is economically infeasible for most practices, which is why most med spa content goes out without pre-publish legal review. The software model is designed to change that economic ratio.",
    },
    {
      q: "Can my injectors and front-desk team use this?",
      a: "Yes. Founding plan includes 3 team seats, and the scanner is designed for non-technical users - paste content, get a score and rewrites. Many practices give front-desk and marketing staff access to scan social posts and email templates before publishing. The audit trail captures who scanned what, when.",
    },
    {
      q: "What if I run multiple med spa locations?",
      a: "The current subscription covers a single practice account with 3 seats. For multi-location groups, we are building multi-location pricing and rollout tooling. Contact us for a walkthrough if you run 3+ locations - we have been building the specific workflow (shared rule set, per-location audit trail, centralized compliance officer view) for groups.",
    },
    {
      q: "Do I still need a healthcare marketing attorney?",
      a: "Yes, for judgment calls and anything approaching a regulatory response. Our tool handles the high-volume pattern-matching work - the part attorneys cannot feasibly do per-item at their billing rate. Most med spas using both together reduce their attorney spend on routine marketing review by 40–60% while improving overall compliance coverage.",
    },
  ],
  relatedBlogSlugs: [
    "med-spa-marketing-compliance-risk",
    "before-after-photos-compliance",
    "banned-words-healthcare-marketing-2026",
  ],
  keywords: [
    "med spa compliance software",
    "med spa FDA compliance",
    "medical spa FTC marketing",
    "med spa before after photos compliance",
    "medical spa marketing attorney alternative",
    "nurse injector marketing compliance",
    "injectable marketing compliance",
  ],
}
