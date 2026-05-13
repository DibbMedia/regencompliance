// FAQ data for the /for hub page. Lives in a plain TS module so both the
// server page (JSON-LD generation) and the "use client" FAQ accordion can
// import it without crossing the RSC client boundary. Importing this kind
// of value from a "use client" module breaks at runtime under Next.js 16 +
// Turbopack — caught when /for returned 500 on www in May 2026.

export interface HubFaq {
  q: string
  a: string
}

export const SPECIALTY_HUB_FAQS: HubFaq[] = [
  {
    q: "Why does specialty-specific compliance matter?",
    a: "Because enforcement is specialty-specific. The FDA's med spa warning letters focus on different claim patterns than its regen medicine letters. FTC weight-loss enforcement has different typical-experience rules (from Jenny Craig precedent) than general aesthetic enforcement. State medical boards apply different specialty-claim rules to dental, plastic surgery, and general medicine. A single-rule-set tool that averages across all healthcare misses the specific patterns your specialty actually faces.",
  },
  {
    q: "What if my specialty isn't listed?",
    a: "The core FDA and FTC rules apply to every healthcare specialty - so the scanner still catches disease claims, testimonial-disclosure issues, and guarantee language regardless of specialty. Specialty-specific pages cover the claim categories unique to each area. Additional specialties are added as the rule set grows - functional medicine, hormone therapy, chiropractic, dermatology, and hair restoration are on the expansion list.",
  },
  {
    q: "Can one practice use multiple specialty rule sets?",
    a: "Yes. Practices that span specialties (e.g., a med spa that also offers weight loss programs) automatically get both rule sets applied. The scanner doesn't force you to pick one specialty - it applies every relevant rule based on content.",
  },
  {
    q: "Do DSOs and multi-location groups use these pages?",
    a: "Yes. Corporate compliance teams at DSOs, med spa franchises, and multi-location groups use specialty pages to calibrate their internal review processes, train new marketing staff, and audit per-location marketing for specialty-specific patterns.",
  },
  {
    q: "How often are specialty rules updated?",
    a: "The underlying rule set updates daily as new FDA warning letters and FTC enforcement actions are published. Specialty-specific pages are reviewed quarterly for major updates when enforcement patterns shift (e.g., the 2024-2026 GLP-1 enforcement wave materially changed weight-loss clinic rules).",
  },
  {
    q: "Does this replace my marketing agency or in-house team?",
    a: "No. We handle the compliance gate between their output and your publishing. If your agency writes, runs ads, or handles content strategy, they continue doing that work. Several healthcare-specialty marketing agencies actually use RegenCompliance internally to check their own deliverables before sending to clinic clients.",
  },
  {
    q: "Is the scanner trained on my specialty's specific patterns or just on generic healthcare patterns?",
    a: "Both. There's a base rule layer that covers FDA disease-claim, structure-function, testimonial-disclosure, and guarantee-language patterns universal to all healthcare advertising. On top of that, each specialty has its own layered rule set built from real enforcement actions in that specialty - so med spa scans flag injectable-supervision language patterns, weight loss scans flag GLP-1 brand-equivalence patterns, and so on.",
  },
  {
    q: "What about state-specific specialty rules?",
    a: "State-specific patterns layer on top of specialty-specific patterns. Med spa marketing in California gets the med spa rule set plus California Medical Board supervision-disclosure rules. Weight loss marketing in Texas gets the weight loss rule set plus Texas DTPA and TMB rules. The scanner applies all relevant layers automatically - you don't have to pick.",
  },
  {
    q: "How quickly does a new specialty page get added when the enforcement landscape shifts?",
    a: "When a new specialty starts attracting concentrated enforcement (the way regen medicine did 2017-2023, weight loss did 2023-2025, hair restoration is starting to in 2026), we build out a dedicated specialty page within 60 to 90 days of identifying the pattern. The underlying rule set picks up new patterns within 24 hours of each enforcement action, so the scanner's current even when the page hasn't shipped yet.",
  },
]
