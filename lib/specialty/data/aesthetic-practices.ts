import type { SpecialtyMeta } from "../types"

export const meta: SpecialtyMeta = {
  slug: "aesthetic-practices",
  specialty: "Aesthetic & Plastic Surgery Practices",
  specialtyLong: "Aesthetic Surgery and Cosmetic Dermatology Practices",
  title: "FDA/FTC Compliance Software for Aesthetic Practices - RegenCompliance",
  description:
    "Purpose-built compliance scanning for aesthetic surgery and cosmetic dermatology practices. Catches FDA device-claim issues, FTC before/after and testimonial rules, and the state-specific physician advertising patterns under enforcement.",
  heroBadge: "For aesthetic practices",
  heroTagline:
    "Aesthetic and plastic surgery practices carry the most visual marketing of any healthcare specialty - before/after photos, patient transformation content, and surgical outcome claims. That visual surface is also the densest FTC enforcement target.",
  riskSummary:
    "Aesthetic practices operate at the intersection of FDA device rules (lasers, energy devices, surgical instruments), FTC outcome-claim rules (before/after photos, patient testimonials, transformation content), and state medical board physician-advertising rules (specialty claims, board-certification rules, physician-of-record supervision). Visual marketing is both the primary sales channel and the primary regulatory exposure. Aesthetic-specific enforcement has tightened significantly as social media transformation content has become the industry-standard marketing approach. Our rule set is built for the full visual-plus-textual surface these practices publish across.",
  enforcementExamples: [
    {
      title: "FTC enforcement on patient transformation content",
      body: "Before/after transformation content is the most scrutinized aesthetic marketing surface. The FTC requires that transformations fairly represent typical results, with clear and conspicuous typical-experience disclosure. Aesthetic practices showing best-case transformations without compliant disclosure are a consistent enforcement pattern.",
    },
    {
      title: "FDA actions on non-FDA-cleared device marketing",
      body: "Marketing non-FDA-cleared aesthetic devices as 'FDA-approved' or 'FDA-cleared,' or marketing FDA-cleared devices beyond their labeled indications, has produced warning letters in the aesthetic supply chain and to clinics reusing supplier marketing.",
    },
    {
      title: "State medical board actions on 'board-certified plastic surgeon' language",
      body: "'Board-certified' carries specific meaning under state medical board rules. Non-board-certified physicians or physicians certified by non-ABMS boards using 'board-certified' language in aesthetic marketing has drawn state medical board discipline in multiple states.",
    },
    {
      title: "FTC actions on surgical outcome claims",
      body: "Specific surgical outcome claims ('permanent facelift,' 'scarless breast augmentation,' 'no downtime rhinoplasty') have generated FTC consent decrees in the aesthetic and plastic surgery category over the past decade. Pattern is ongoing.",
    },
    {
      title: "State AG actions on package pricing and consumer disclosure",
      body: "Aesthetic package pricing - advertised flat rates for complex procedures - has drawn state AG consumer-protection attention when actual totals diverge significantly from advertised prices due to add-ons, anesthesia, facility fees, or follow-up costs.",
    },
  ],
  bannedPhrases: [
    {
      phrase: "Scarless breast augmentation",
      why: "All surgical procedures produce scars; absolute 'scarless' claim is deceptive.",
      alternative: "Surgical approach designed to minimize visible scarring",
      risk: "HIGH",
    },
    {
      phrase: "Permanent facelift",
      why: "Aging continues after surgery; 'permanent' overstates the durability of results.",
      alternative: "Long-lasting facial rejuvenation - aging continues naturally over time",
      risk: "HIGH",
    },
    {
      phrase: "No downtime surgery",
      why: "All surgery has recovery periods; absolute claim is deceptive.",
      alternative: "Reduced downtime compared to traditional approaches - specific recovery discussed at consultation",
      risk: "HIGH",
    },
    {
      phrase: "Board-certified [specialty]",
      why: "Requires specific ABMS or equivalent certification; misuse is a state medical board enforcement target.",
      alternative: "Certified by [specific board name] - which is [ABMS-member board / other certification]",
      risk: "HIGH",
    },
    {
      phrase: "Painless [procedure]",
      why: "Absolute no-pain claim conflicts with surgical reality.",
      alternative: "Our sedation and technique options help most patients experience minimal discomfort",
      risk: "HIGH",
    },
    {
      phrase: "Guaranteed satisfaction",
      why: "Satisfaction guarantees are rarely substantiable in surgical practice.",
      alternative: "Most of our patients report high satisfaction with their results - our consultation process aims to set realistic expectations",
      risk: "HIGH",
    },
    {
      phrase: "Reverses 20 years of aging",
      why: "Quantified age-reversal claim without substantiation.",
      alternative: "Can create a refreshed, more youthful appearance",
      risk: "HIGH",
    },
    {
      phrase: "Celebrity facelift",
      why: "Implied celebrity endorsement without FTC-required material-connection disclosure.",
      alternative: "(Remove entirely unless documented paid endorser with proper disclosures)",
      risk: "HIGH",
    },
    {
      phrase: "Best plastic surgeon in [city]",
      why: "Superlative without substantiation - FTC and state medical board enforcement target.",
      alternative: "[Practice Name] - a leading aesthetic practice in [city]",
      risk: "MEDIUM",
    },
    {
      phrase: "Revolutionary new technique",
      why: "Unsubstantiated superiority claim - common FTC target in aesthetic marketing.",
      alternative: "A technique our practice uses for [specific indication] based on [specific training or development]",
      risk: "MEDIUM",
    },
    {
      phrase: "Actual patient - no retouching",
      why: "Defensive overclaim that often isn't strictly true (lighting, positioning, cropping). FTC rules require typical-experience framing, not authenticity defenses.",
      alternative: "Actual patient, [N] weeks post-procedure. Individual results vary - typical outcomes depend on candidacy and aftercare.",
      risk: "MEDIUM",
    },
    {
      phrase: "Dr. [Name] is the expert in [procedure]",
      why: "'Expert' superlative without substantiation; also implies a credential that may not formally exist.",
      alternative: "Dr. [Name] has performed [N] [procedures] and has focused training in [area]",
      risk: "MEDIUM",
    },
  ],
  commonCatches: [
    {
      title: "Before/after image captions without typical-experience disclosure",
      body: "Every before/after image needs clear-and-conspicuous typical-experience language. Most aesthetic practice captions use 'results may vary' in fine print - which the FTC does not consider adequate. Our scanner catches the missing disclosure and inserts compliant language matching FTC-accepted patterns.",
    },
    {
      title: "Patient transformation videos with outcome claims",
      body: "Transformation videos embed outcome claims in the captioning, voiceover, and on-screen text. Our scanner catches the claim content regardless of format and suggests compliant voiceover/caption alternatives.",
    },
    {
      title: "'Board-certified' language misuse",
      body: "State medical boards actively enforce 'board-certified' terminology rules. Our scanner flags claims that do not specify the certifying board and suggests compliant framings that disclose the specific certification.",
    },
    {
      title: "Package pricing without consumer-disclosure language",
      body: "Advertised package prices without disclosure of add-ons (anesthesia, facility fees, follow-up costs) trigger state AG consumer-protection patterns. Our scanner flags missing disclosures.",
    },
    {
      title: "Device marketing with 'FDA-approved' misuse",
      body: "Laser and energy device marketing confusing 'FDA-cleared' with 'FDA-approved' is one of our highest-flagged patterns in aesthetic practices reusing supplier marketing.",
    },
  ],
  caseStudy: {
    title: "A typical first scan on an aesthetic practice homepage",
    before:
      "Dr. Smith is the best plastic surgeon in Miami - board-certified and the expert in scarless breast augmentation, painless rhinoplasty, and permanent facelifts with no downtime. Reverses 20 years of aging with our revolutionary new technique. Celebrity facelift favorite, guaranteed satisfaction, actual patient photos with no retouching.",
    after:
      "Dr. Smith leads [Practice Name], a leading aesthetic practice in Miami. Certified by the American Board of Plastic Surgery (an ABMS-member board). Focused training and experience in breast augmentation, rhinoplasty, and facial rejuvenation. Surgical approach designed to minimize visible scarring, with reduced downtime compared to traditional approaches - specific recovery discussed at consultation. Our sedation and technique options help most patients experience minimal discomfort. Most of our patients report high satisfaction - our consultation process aims to set realistic expectations. Actual patient, 6 weeks post-procedure. Individual results vary - typical outcomes depend on candidacy and aftercare.",
    outcome:
      "Score moved from 14 to 91 across 12 flagged phrases. Every core marketing message preserved - superlative and guarantee language replaced with substantiable framings, board-certification language rewritten to meet state medical board standards, before/after caption rewritten to FTC-compliant typical-experience framing. PDF audit trail generated.",
  },
  uniqueValue:
    "Aesthetic practices publish the highest volume of visual marketing of any healthcare specialty - and that visual marketing is where the densest FTC enforcement lives. Our rule set is specifically trained on the before/after caption, transformation video, and board-certification claim patterns that drive enforcement in this category. State-specific physician-advertising rules layered on top (California, Texas, Florida, New York have the strictest medical board rules) are part of what we flag.",
  whoThisIsFor: [
    "Plastic and reconstructive surgery practices",
    "Cosmetic dermatology practices",
    "Aesthetic medicine practices",
    "Facial plastic surgery practices (ENT-based aesthetic)",
    "Oculoplastic practices",
    "Hair restoration practices",
    "Body contouring specialty practices",
    "Multi-specialty aesthetic groups",
    "Surgeon-owned med spa divisions",
    "Aesthetic marketing agencies and consultancies",
  ],
  faqs: [
    {
      q: "Does the scanner understand 'board-certified' language rules?",
      a: "Yes. Our rule set includes the ABMS-member boards, the commonly-used non-ABMS boards, and the state medical board positions on using 'board-certified' language. We flag common misuse patterns and suggest framings that disclose the specific certifying board (which is the core compliance structure across most states).",
    },
    {
      q: "How does before/after caption compliance work?",
      a: "The FTC requires typical-experience disclosure to be clear and conspicuous - specific positioning, font size, and framing standards apply. 'Results may vary' in fine print at the bottom of a post is not considered adequate. Our scanner catches the pattern and inserts caption language in the specific formats the FTC has accepted in similar enforcement contexts. We also flag transformations that appear to show atypical results based on caption context.",
    },
    {
      q: "What about consent for patient photos?",
      a: "Patient photo consent is a HIPAA and patient-rights issue that happens before the photo enters your marketing. Our scanner does not manage consent workflows - that is your internal process with your compliance officer or attorney. What we do is flag the marketing-side patterns (caption, disclosure, claim language) around the photos you publish.",
    },
    {
      q: "Do you handle state-specific physician advertising rules?",
      a: "We flag the most commonly cited state medical board patterns - California, Texas, Florida, and New York have the strictest physician-advertising rules and we model those specifically. State-specific advice on your marketing should involve counsel licensed in your state; our scanner handles the pattern-matching high-volume work.",
    },
    {
      q: "Can the scanner work with video content?",
      a: "Yes, via text. Paste the video script, voiceover transcript, and on-screen text content into the scanner - it handles the textual content of video marketing. We do not analyze video frames directly (image and video analysis is a different technology), but the caption and narrative content is where the claim content lives and where regulators focus their review.",
    },
    {
      q: "What about package pricing and consumer disclosure?",
      a: "Our scanner flags package-pricing patterns that commonly miss required disclosures (anesthesia fees, facility fees, add-ons, follow-up costs). State AGs have pursued aesthetic practices specifically on this pattern. We suggest standard-format disclosure language that meets the clear-and-conspicuous standard most state consumer-protection offices look for.",
    },
    {
      q: "Does the scanner work for non-surgical aesthetic services (laser, injectables, body contouring)?",
      a: "Yes. Non-surgical aesthetic marketing overlaps significantly with the med spa rule set (injectables, lasers, body devices). If your practice mixes surgical and non-surgical offerings, the scanner handles both - same rule set, different sub-categories of flags.",
    },
    {
      q: "Do I still need a plastic-surgery-marketing attorney?",
      a: "Yes, for judgment calls and any regulatory response. Our tool handles the high-volume pattern-matching - the part attorney review cannot feasibly do per-item at their billing rate. Most aesthetic practices using both together reduce routine attorney review spend and use those hours on strategic questions (board-certification structure, multi-state expansion, package-structure review) where judgment matters.",
    },
  ],
  relatedBlogSlugs: [
    "before-after-photos-compliance",
    "healthcare-testimonial-compliance",
    "med-spa-marketing-compliance-risk",
  ],
  keywords: [
    "plastic surgery marketing compliance",
    "aesthetic practice compliance software",
    "cosmetic surgery marketing rules",
    "before after photo FTC compliance",
    "board-certified advertising rules",
    "aesthetic marketing compliance attorney",
    "aesthetic practice FTC compliance",
  ],
}
