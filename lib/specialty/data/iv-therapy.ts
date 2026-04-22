import type { SpecialtyMeta } from "../types"

export const meta: SpecialtyMeta = {
  slug: "iv-therapy",
  specialty: "IV Therapy & Wellness Clinics",
  specialtyLong: "IV Therapy, Hydration, and Wellness Clinics",
  title: "FDA/FTC Compliance Software for IV Therapy Clinics — RegenCompliance",
  description:
    "Purpose-built compliance scanning for IV therapy and wellness clinics. The IV therapy rule set — vitamin, NAD+, hydration, and mobile IV marketing checked against FDA drug-claim and FTC substantiation rules.",
  heroBadge: "For IV therapy clinics",
  heroTagline:
    "IV therapy sits in a uniquely exposed regulatory position — compounded drug rules, FDA drug-claim rules, FTC substantiation rules, and nursing-scope regulations all apply at once.",
  riskSummary:
    "IV therapy and vitamin-infusion clinics have been a growth category in both patient volume and enforcement interest. The FDA reads most IV therapy offerings under drug-regulatory authority (many IV formulations are legally drugs, whether branded or compounded). The FTC applies substantiation rules to every benefit claim — 'boosts immunity,' 'cures hangovers,' 'improves energy.' State boards of nursing and medicine scrutinize who can administer IVs, under what supervision, and what medical evaluation must precede treatment. And NAD+ marketing specifically has been a growing FTC focus. RegenCompliance is built to catch the specific patterns each authority targets.",
  enforcementExamples: [
    {
      title: "FDA drug-claim enforcement on IV formulations",
      body: "IV formulations with specific active ingredients (glutathione, NAD+, certain compounded vitamin combinations) are legally drugs. Marketing them with disease-claim language ('treats,' 'cures,' 'prevents') triggers the same FDA drug-advertising rules as any prescription drug — a regulatory surface most IV clinics market as if it does not apply.",
    },
    {
      title: "FTC substantiation enforcement on immune, energy, and hangover claims",
      body: "'Boosts your immune system,' 'cures hangovers,' 'improves athletic performance' — these are all FTC substantiation targets. Clinical evidence for IV formulations meeting the FTC 'competent and reliable scientific evidence' bar is often sparse or absent. Marketing as if the evidence exists is a direct FTC pattern.",
    },
    {
      title: "State nursing board actions on standing-order and supervision issues",
      body: "IV therapy clinics operating on standing orders, nurse-led mobile models, or non-physician-supervised structures have drawn state nursing and medical board attention in several states. Marketing language that minimizes medical-evaluation steps is a factor in enforcement.",
    },
    {
      title: "FTC actions on NAD+ anti-aging and cognitive claims",
      body: "NAD+ marketing making anti-aging, cognitive enhancement, and longevity claims has been a specific FTC focus in 2024–2026. 'Reverses aging,' 'boosts cognition,' 'extends lifespan' on NAD+ product pages are active enforcement targets.",
    },
    {
      title: "State AG actions on mobile IV pricing and consumer protection",
      body: "Mobile IV services have drawn state AG attention on advertised pricing (base rate vs. actual total) and consumer-protection disclosure. Marketing that advertises a base price without disclosure of add-ons has been cited.",
    },
  ],
  bannedPhrases: [
    {
      phrase: "Boosts your immune system",
      why: "Immune-boosting claims are FTC substantiation targets and often cross into drug-claim territory.",
      alternative: "Supports your body's normal immune function — actual results vary by individual",
      risk: "HIGH",
    },
    {
      phrase: "Cures hangovers",
      why: "Disease-cure claim on a category FTC has specifically targeted in IV marketing.",
      alternative: "May help support rehydration and recovery after dehydration",
      risk: "HIGH",
    },
    {
      phrase: "Reverses aging with NAD+",
      why: "Anti-aging reversal claim — direct FTC target in current NAD+ enforcement wave.",
      alternative: "Supports cellular metabolism — research on NAD+ biology continues",
      risk: "HIGH",
    },
    {
      phrase: "FDA-approved IV therapy",
      why: "Most IV formulations marketed by wellness clinics are not FDA-approved for the claimed indications.",
      alternative: "Administered by licensed medical professionals using [specific products or compounded formulations]",
      risk: "HIGH",
    },
    {
      phrase: "Guaranteed energy boost",
      why: "Guarantee claim without substantiation.",
      alternative: "Most of our patients report feeling more energized after treatment; individual experiences vary",
      risk: "HIGH",
    },
    {
      phrase: "Cures chronic fatigue",
      why: "Disease-cure claim on a specific medical diagnosis.",
      alternative: "May help support energy and wellness as part of a broader medical approach to chronic fatigue",
      risk: "HIGH",
    },
    {
      phrase: "10 years younger",
      why: "Quantified age-reversal claim without any clinical support.",
      alternative: "(Remove entirely — no compliant reframe for quantified age-reversal)",
      risk: "HIGH",
    },
    {
      phrase: "Pharmaceutical-grade",
      why: "Implies FDA approval or pharmaceutical-equivalency without substantiation.",
      alternative: "Prepared by a licensed compounding pharmacy meeting [specific standards]",
      risk: "MEDIUM",
    },
    {
      phrase: "Proven to improve performance",
      why: "'Proven' requires clinical evidence meeting the FTC substantiation bar.",
      alternative: "Some athletes and active patients report perceived improvements; individual experiences vary",
      risk: "MEDIUM",
    },
    {
      phrase: "Weight loss IV",
      why: "Implies IV therapy as a weight-loss treatment — crosses into off-label drug marketing for compounded formulations.",
      alternative: "Some formulations may support metabolism as part of a broader weight management program under medical guidance",
      risk: "MEDIUM",
    },
    {
      phrase: "Celebrity favorite",
      why: "Implied endorsement without FTC material-connection disclosure.",
      alternative: "(Remove unless documented paid endorsement with proper disclosure)",
      risk: "HIGH",
    },
    {
      phrase: "Detox your body",
      why: "Detox claims are FTC substantiation targets; mechanism is rarely substantiable.",
      alternative: "Supports hydration and nutrient replenishment",
      risk: "MEDIUM",
    },
  ],
  commonCatches: [
    {
      title: "Menu-page benefit columns with disease/condition claims",
      body: "IV menu pages typically list each formulation with a benefit column — 'Immunity Boost: prevents colds, cures flu.' The condition-specific benefit column is where most disease claims enter IV marketing. Our scanner catches these systematically.",
    },
    {
      title: "Social media ads for hangover, recovery, and party-goer IVs",
      body: "Hangover and party-recovery IV ads are an FTC focus area. Marketing these IVs specifically as hangover cures has triggered enforcement. Our scanner catches the common patterns and suggests compliant 'rehydration and recovery support' framings.",
    },
    {
      title: "NAD+ marketing with anti-aging, longevity, and cognitive claims",
      body: "NAD+ is our single most-flagged IV category. Our rule set catches the reversal, longevity, cognitive, and energy-ageless framings that are under active FTC enforcement.",
    },
    {
      title: "Athlete and performance IV marketing",
      body: "Performance IV marketing to athletes and active patients crosses into sports-supplement territory where FTC substantiation rules are strictly enforced. Our scanner catches quantified performance claims.",
    },
    {
      title: "Mobile IV pricing disclosure issues",
      body: "Mobile IV services often advertise base prices without adequate disclosure of add-ons, service fees, and location surcharges — a state AG enforcement pattern. Our scanner catches missing-disclosure patterns and suggests standard-format disclosure language.",
    },
  ],
  caseStudy: {
    title: "A typical first scan on an IV therapy clinic menu page",
    before:
      "Our Immunity Boost IV cures colds and prevents flu. The Hangover Cure IV cures hangovers and reverses alcohol damage. Our NAD+ therapy reverses aging by 10 years, cures chronic fatigue, and is pharmaceutical-grade. Weight loss IV — guaranteed results, celebrity favorite, detoxes your body. FDA-approved formulations proven to improve performance.",
    after:
      "Our Immunity Support IV is formulated to support your body's normal immune function — individual results vary. The Recovery IV is designed to support rehydration after dehydration. Our NAD+ infusion supports cellular metabolism — research into NAD+ biology continues, and individual experiences vary. Our metabolism-support formulations may be appropriate as part of a broader weight-management program under medical guidance. Administered by licensed medical professionals using formulations prepared by licensed compounding pharmacies. Most patients report feeling refreshed after treatment — individual results vary.",
    outcome:
      "Score went from 9 to 88 across 15 flagged phrases. Every core menu item retained — benefit language translated into substantiable framings that match FTC substantiation rules and current NAD+ enforcement patterns. PDF audit trail exported.",
  },
  uniqueValue:
    "IV therapy is where FDA drug rules, FTC substantiation rules, state nursing/medical board rules, and state consumer-protection rules all apply simultaneously — and where most marketing is written as if none of them apply. Our rule set specifically handles the IV therapy claim patterns (immunity, energy, detox, anti-aging, hangover, performance) under active enforcement in 2026. A generic healthcare compliance tool would not catch the category-specific patterns.",
  whoThisIsFor: [
    "In-clinic IV therapy practices",
    "Mobile IV therapy services",
    "NAD+ and longevity-focused clinics",
    "Wellness and integrative medicine practices with IV offerings",
    "Med spa IV service lines",
    "Sports medicine and recovery-focused practices",
    "Franchise IV therapy operators",
    "Concierge medicine practices",
  ],
  faqs: [
    {
      q: "Are IV formulations legally drugs?",
      a: "Most are. IV formulations with active pharmaceutical ingredients are drugs under FDA definition, whether branded (vitamin B12 injections under standard labeling) or compounded (custom formulations made by a licensed compounding pharmacy). Marketing them triggers FDA drug-advertising rules, which most IV clinics do not structure their marketing around. Our scanner catches the disease-claim, off-label, and unsubstantiated-efficacy patterns that those rules target.",
    },
    {
      q: "What about the NAD+ specific enforcement wave?",
      a: "NAD+ is a current FTC focus. Marketing NAD+ with anti-aging reversal, cognitive enhancement, longevity, and cellular-damage-repair claims is under active enforcement. Our rule set specifically handles NAD+ marketing patterns and suggests framings that discuss NAD+ biology and cellular metabolism accurately without crossing into unsubstantiated efficacy or disease territory.",
    },
    {
      q: "Do FTC rules apply to IV therapy testimonials?",
      a: "Yes — identically to any other healthcare testimonial. 'Your energy is back in 20 minutes,' 'your hangover cured,' 'feel 10 years younger' testimonials require typical-experience disclosures. Our scanner catches peak-outcome testimonials and suggests compliant framings.",
    },
    {
      q: "What about mobile IV services specifically?",
      a: "Mobile IV services have additional exposure on pricing disclosure (base vs. actual total), supervision model (physician review of patient histories, nursing scope in your state), and marketing that implies on-demand prescribing. Our scanner catches the common patterns and suggests compliant alternatives, but state-specific supervision questions should involve counsel licensed in your state.",
    },
    {
      q: "Do the rules apply to my social media ads too?",
      a: "Yes. Instagram and TikTok ads are the specific channels the FTC has called out for 2024–2026 enforcement priority. IV therapy is one of the most TikTok-heavy healthcare marketing categories. Our scanner treats short-form caption text the same as website copy — the rules apply to both.",
    },
    {
      q: "What about compounded formulations specifically?",
      a: "Compounded formulations are legally distinct products from FDA-approved medications. Marketing them as equivalent to approved drugs is the same pattern that triggers enforcement in GLP-1 compounding. Our scanner flags compounded-to-approved equivalency language.",
    },
    {
      q: "Can I describe what is in each IV formulation?",
      a: "Yes — accurate ingredient descriptions are generally safe. The issue is benefit/efficacy language, not ingredient language. 'Contains vitamin C, B-complex, and glutathione' is fine. 'Boosts immunity, fights illness, and prevents aging' is not. Our scanner separates the two.",
    },
    {
      q: "What about athlete and performance IV marketing?",
      a: "Performance claims for athletes bring in an additional FTC substantiation surface and sometimes trigger anti-doping considerations. Our scanner catches the specific performance-claim patterns and suggests framings that describe hydration and nutrient support without unsubstantiated performance promises.",
    },
  ],
  relatedBlogSlugs: [
    "banned-words-healthcare-marketing-2026",
    "healthcare-testimonial-compliance",
    "healthcare-website-compliance-audit-framework",
  ],
  keywords: [
    "IV therapy clinic compliance",
    "IV therapy marketing FDA",
    "NAD+ marketing compliance",
    "IV therapy FTC rules",
    "hangover IV marketing compliance",
    "mobile IV marketing rules",
    "wellness clinic FDA compliance",
  ],
}
