import type { SpecialtyMeta } from "../types"

export const meta: SpecialtyMeta = {
  slug: "dental-practices",
  specialty: "Dental Practices",
  specialtyLong: "Dental and Dental Specialty Practices",
  title: "Dental Marketing Compliance Software — RegenCompliance",
  description:
    "Purpose-built compliance scanning for dental practices. Catches FDA/FTC violations, state dental board marketing rules, whitening and implant claim issues, and the testimonial patterns dental boards enforce.",
  heroBadge: "For dental practices",
  heroTagline:
    "Dental marketing has three overlapping regulators — FDA on devices and treatments, FTC on claims and testimonials, and your state dental board on specialty claims and supervision. One tool built for that full surface.",
  riskSummary:
    "Dental marketing is less-publicized than med spa or regen enforcement, but it has its own dense regulatory structure. State dental boards in California, Texas, Florida, New York, and others have active enforcement on specialty claim language ('cosmetic dentist' in states that do not recognize the specialty, implant and endodontic claims by general dentists). The FTC enforces testimonial rules identically to other healthcare specialties. The FDA regulates dental devices (implants, CBCT, intraoral scanners, whitening products) and marketing that misrepresents their labeling. And 'longevity' and 'dental-systemic health' marketing has been a specific growth area that is drawing early attention.",
  enforcementExamples: [
    {
      title: "State dental board actions on specialty-claim language",
      body: "Multiple state dental boards restrict who can describe themselves as a 'cosmetic dentist,' 'implant dentist,' or 'sleep dentist.' General dentists using specialty language without the corresponding ADA-recognized specialty (there is no ADA-recognized cosmetic dentistry specialty) have faced board discipline in several states.",
    },
    {
      title: "FTC actions on dental outcome-claim testimonials",
      body: "Testimonials claiming specific dental outcomes ('my implant lasted 20 years,' 'my veneers are permanent,' 'whitening took 10 years off') are subject to the same FTC Endorsement Guide rules as any other medical specialty. Enforcement of these rules against dental practices has historically been lighter, but the rules apply equally.",
    },
    {
      title: "State AG actions on whitening and cosmetic claim substantiation",
      body: "State AGs have pursued consumer-protection cases against dental practices advertising specific whitening outcomes ('shades whiter in one visit,' 'permanent whitening') without substantiation meeting state consumer-protection rules.",
    },
    {
      title: "FDA letters on dental device marketing outside labeled indications",
      body: "Marketing dental devices (implants, lasers, intraoral scanners, specific material systems) with claims outside their labeled indications generates FDA letters in the dental supply chain. Clinics that reuse supplier marketing inherit this exposure.",
    },
    {
      title: "Growing scrutiny on oral-systemic longevity claims",
      body: "Dental practices marketing oral-systemic health links ('your oral health affects your heart,' 'gum disease causes Alzheimer's,' 'dental longevity') are moving into an area of early regulatory attention. Claims that cross into disease-treatment territory based on dental intervention are the specific pattern under watch.",
    },
  ],
  bannedPhrases: [
    {
      phrase: "Best cosmetic dentist in [city]",
      why: "'Cosmetic dentist' is not an ADA-recognized specialty; superlative claims also fail substantiation.",
      alternative: "[Practice Name] — general dentistry with a focus on aesthetic treatment",
      risk: "HIGH",
    },
    {
      phrase: "Permanent whitening",
      why: "Whitening effects are not permanent under any protocol; this is an unsupportable efficacy claim.",
      alternative: "Long-lasting whitening results — maintenance protocols discussed at consultation",
      risk: "HIGH",
    },
    {
      phrase: "Prevents heart disease",
      why: "Disease prevention claim based on dental intervention is an FDA disease-claim pattern.",
      alternative: "Supports overall oral health, which is one component of overall wellness",
      risk: "HIGH",
    },
    {
      phrase: "Cures gum disease",
      why: "Gum disease is a medical diagnosis; 'cure' is an FDA-prohibited claim category in this framing.",
      alternative: "Our treatment protocols can significantly improve gum health for many patients",
      risk: "HIGH",
    },
    {
      phrase: "Pain-free dentistry",
      why: "Absolute no-pain claim is rarely substantiable and has drawn state dental board attention.",
      alternative: "Our sedation and technique options help most patients experience minimal discomfort",
      risk: "MEDIUM",
    },
    {
      phrase: "Implant dentist",
      why: "General dentists using specialty-implying language without the specialty can face state dental board review.",
      alternative: "General dentist with advanced training in dental implant placement",
      risk: "MEDIUM",
    },
    {
      phrase: "Shades whiter in one visit",
      why: "Quantified outcome claim requires substantiation that most practices do not have on file.",
      alternative: "Noticeable whitening in a single visit for most patients — individual results vary",
      risk: "MEDIUM",
    },
    {
      phrase: "Reverses aging with dental work",
      why: "Reversal-of-aging claims cross into cosmetic-medicine disease-claim territory.",
      alternative: "Can enhance the aesthetic of your smile",
      risk: "HIGH",
    },
    {
      phrase: "Guaranteed lifetime implants",
      why: "Guarantee claim conflicts with dental literature on implant survival and failure rates.",
      alternative: "Implants have high long-term success rates in clinical literature; we offer [specific warranty terms]",
      risk: "HIGH",
    },
    {
      phrase: "Best in [city]",
      why: "Superlative without substantiation fails FTC and state consumer-protection standards.",
      alternative: "A leading [type] practice in [city]",
      risk: "MEDIUM",
    },
    {
      phrase: "ADA-approved",
      why: "The ADA's 'Seal of Acceptance' applies to specific products, not practices or services.",
      alternative: "We use products and materials that hold the ADA Seal of Acceptance where applicable",
      risk: "MEDIUM",
    },
    {
      phrase: "Adds 10 years to your life",
      why: "Longevity/mortality claim based on dental intervention is an FDA disease-claim risk.",
      alternative: "Good oral health is one component of overall wellness",
      risk: "HIGH",
    },
  ],
  commonCatches: [
    {
      title: "'Cosmetic dentist' bio pages",
      body: "Staff bio pages using specialty language ('cosmetic dentist,' 'implant dentist,' 'sleep dentist') without ADA-recognized credentials are one of the most common patterns our scanner flags in dental marketing.",
    },
    {
      title: "Veneer and implant testimonials with outcome specifics",
      body: "Long-duration testimonials ('my veneers still look great after 10 years') are functional outcome claims subject to the FTC Endorsement Guides. Our scanner catches the claim-bearing testimonial pattern.",
    },
    {
      title: "Whitening ads with shade-specific promises",
      body: "Ad copy promising specific shade improvements is a common state consumer-protection issue. Our scanner catches quantified-outcome language and suggests compliant alternatives.",
    },
    {
      title: "Oral-systemic longevity marketing",
      body: "Dental pages linking oral health to heart disease, Alzheimer's, or longevity generally cross into disease-claim territory. Our scanner catches the specific phrasings the FDA and FTC have flagged in similar marketing.",
    },
    {
      title: "Sleep dentistry and airway marketing",
      body: "Sleep dentistry and airway health marketing often includes disease-treatment claims for sleep apnea that are outside dental scope. Our scanner flags these patterns and suggests framings that stay within dental practice authority.",
    },
  ],
  caseStudy: {
    title: "A typical first scan on a dental practice homepage",
    before:
      "Dr. Smith is the best cosmetic dentist in Austin — offering pain-free dentistry, permanent whitening, and guaranteed lifetime implants. Our advanced sleep dentistry cures gum disease, prevents heart disease, and can add 10 years to your life. Shades whiter in one visit, ADA-approved, and designed to reverse aging with dental work.",
    after:
      "Dr. Smith leads [Practice Name] — a general dentistry practice in Austin with a focus on aesthetic treatment. Our sedation and technique options help most patients experience minimal discomfort. Long-lasting whitening results with maintenance protocols discussed at consultation. Implants have high long-term success rates in clinical literature — we offer [specific warranty terms]. Our treatment protocols can significantly improve gum health for many patients, and good oral health is one component of overall wellness. Noticeable whitening in a single visit for most patients — individual results vary. We use products and materials that hold the ADA Seal of Acceptance where applicable.",
    outcome:
      "Score moved from 22 to 90 across 11 flagged phrases. Specialty-language issues reframed. Guarantee and longevity claims replaced with substantiable alternatives. PDF audit trail generated for the practice's compliance file.",
  },
  uniqueValue:
    "Dental marketing compliance requires overlapping knowledge of FDA claim rules, FTC Endorsement Guides, state dental board specialty-claim rules, and state consumer-protection law. Generic compliance tools model none of these specifically for dental. Our rule set includes dental-specific state board patterns and the specific claim categories that have generated enforcement in the dental specialty.",
  whoThisIsFor: [
    "General dentistry practices",
    "Cosmetic-focused dental practices",
    "Orthodontic practices (including DSO-owned)",
    "Implant-focused practices",
    "Pediatric dental practices",
    "Periodontal specialty practices",
    "Endodontic practices",
    "Dental sleep medicine practices",
    "Airway and orthodontic-integrated practices",
    "DSO corporate marketing teams",
  ],
  faqs: [
    {
      q: "Does the scanner know what the ADA-recognized specialties are?",
      a: "Yes. Our rule set includes the current ADA-recognized specialties (endodontics, oral and maxillofacial surgery, orthodontics and dentofacial orthopedics, pediatric dentistry, periodontics, prosthodontics, and the others). It flags specialty-language patterns that are not ADA-recognized (like 'cosmetic dentist') and suggests compliant alternatives. State dental board rules on specialty-language vary; we flag the most commonly cited patterns.",
    },
    {
      q: "What about 'Doctor' title usage and advertising?",
      a: "Most states have specific rules on how dentists can use the 'Doctor' title in advertising (requiring DDS/DMD qualifier, prohibiting implied medical-doctor status, etc.). Our scanner flags common violations and suggests compliant phrasings. State-specific rules vary and are not fully encoded — for close calls, your attorney should advise based on your specific state.",
    },
    {
      q: "What about dental-systemic health marketing?",
      a: "Dental-systemic health claims — linking oral care to heart disease, diabetes, Alzheimer's, longevity — are a current area of early regulatory attention. The underlying science is real but the causal marketing framing ('prevents,' 'cures,' 'protects from') crosses into FDA disease-claim territory. Our scanner catches these patterns and suggests framings that stay within dental-practice authority while preserving the informational value.",
    },
    {
      q: "Do DSOs use this?",
      a: "Yes. DSO (Dental Service Organization) marketing teams use the scanner at the corporate level to review campaign materials before rollout to practice locations. The founding plan's 3 seats suit most DSO compliance teams; larger DSOs can contact us for a multi-seat walkthrough.",
    },
    {
      q: "Can the scanner check patient-facing content like intake forms and after-visit instructions?",
      a: "Yes. The scanner treats any patient-facing text the same way — if it makes efficacy, safety, or outcome claims, those claims need to be compliant regardless of whether the surface is a public website or an intake form.",
    },
    {
      q: "What about orthodontic and clear aligner marketing?",
      a: "Orthodontic marketing has its own claim patterns — 'straighter in 6 months,' 'without traditional braces,' guarantees and quantified timelines. Our scanner catches the specific patterns that have generated FTC attention in the clear aligner category. It also flags the 'doctor supervision' implication issues that state dental boards have raised regarding some direct-to-consumer aligner models.",
    },
    {
      q: "Does the scanner work for sleep dentistry and airway marketing?",
      a: "Yes. Sleep dentistry is a growing area where disease-treatment claims (especially around sleep apnea) frequently cross outside dental scope of practice. Our rule set flags these patterns and suggests framings that describe appliance-based therapy without implying primary medical treatment of diagnosed conditions.",
    },
    {
      q: "Does the scanner understand state-specific dental board rules?",
      a: "We flag the most commonly cited state dental board patterns (California, Texas, Florida, New York, Illinois, Pennsylvania). State-specific advice on your marketing should involve counsel licensed in your state; our scanner handles the pattern-matching high-volume work.",
    },
  ],
  relatedBlogSlugs: [
    "dental-longevity-claims-compliance",
    "healthcare-testimonial-compliance",
    "banned-words-healthcare-marketing-2026",
  ],
  keywords: [
    "dental marketing compliance software",
    "dental practice FTC compliance",
    "dental board marketing rules",
    "cosmetic dentist marketing compliance",
    "dental testimonial compliance",
    "dental implant marketing rules",
    "dental longevity claims",
  ],
}
