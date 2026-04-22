import type { ToolMeta } from "../types"

export const meta: ToolMeta = {
  slug: "compliance-library",
  name: "Compliance Library (300+ Rules)",
  category: "Rule database",
  title: "Compliance Library — 300+ Banned Phrases & Rules from Real FDA/FTC Enforcement | RegenCompliance",
  description:
    "A searchable database of 300+ active compliance rules sourced from actual FDA warning letters, FTC settlements, and state medical board actions. Every rule includes the phrase, the risk level, the source, and the compliant alternative.",
  heroBadge: "Rule database",
  heroTagline:
    "The same 300+ rule database the scanner uses, exposed as a searchable library. Every rule is sourced from real enforcement — FDA warning letters, FTC settlements, state board actions. Updated daily.",
  shortVerdict:
    "Most practices learn compliance by trial and error. The library is the condensed version of what 1,200+ warning letters taught the industry.",
  whatItIs:
    "The compliance library is a searchable database of every active rule the scanner applies — 300+ banned phrases and patterns, each sourced from actual enforcement action. Browse by specialty, claim category, or source authority. Search for specific language to see how regulators have handled it. The library is both reference material and the backbone of the scanner's rule engine.",
  capabilities: [
    {
      title: "300+ active rules",
      body: "Current rule count across specialties and claim categories. Every rule is tied to specific enforcement evidence — a warning letter, settlement, or equivalent — not hypothetical patterns.",
    },
    {
      title: "Sourced from real enforcement",
      body: "Each rule cites the source authority and, where applicable, the specific enforcement action that established the pattern. Not 'we think this might be a problem' — 'this specific phrasing produced this specific warning letter.'",
    },
    {
      title: "Searchable by phrase, category, specialty, authority",
      body: "Search for 'FDA-approved' to see every rule category that term can trigger. Filter by specialty (med spa, weight loss, regen). Filter by source (FDA, FTC, state). The library surfaces the relevant rules for your specific question.",
    },
    {
      title: "Compliant alternatives built in",
      body: "Every rule includes compliant alternative language. Not just 'don't say this' — 'don't say this, say this instead, here's why the alternative works.'",
    },
    {
      title: "Risk level per rule (HIGH/MEDIUM/LOW)",
      body: "Some rules are immediate enforcement triggers; others are substantiation issues or disclosure gaps. Risk level helps prioritize which rules matter most for your specific content.",
    },
    {
      title: "Daily updates from live enforcement",
      body: "The library ingests new FDA warning letters and FTC actions every day. New enforcement patterns become new library entries within 24 hours of publication. The library is never more than a day out of date.",
    },
  ],
  howItWorks: [
    {
      title: "1. Browse or search",
      body: "Start from the library index (browse by category) or search directly. Phrase searches return every rule mentioning the phrase. Category searches return all rules in that category.",
    },
    {
      title: "2. Review the rule detail",
      body: "Each rule includes: the banned phrase or pattern, why it's problematic, the source authority, specific enforcement citations, the compliant alternative, and the risk level.",
    },
    {
      title: "3. Use in context",
      body: "Copy compliant alternatives directly into your marketing. Share specific rules with your team for training. Reference the library during quarterly reviews.",
    },
    {
      title: "4. Subscribe to updates",
      body: "Email notifications when new rules are added to categories you care about. New med spa rules ping your med spa compliance team; new weight loss rules ping weight loss practices.",
    },
  ],
  useCases: [
    {
      title: "Team training material",
      body: "The library is ready-made training content. Walk new marketing hires through the specialty-relevant rule categories; they internalize the patterns faster than abstract compliance training produces.",
    },
    {
      title: "Pre-publish reference",
      body: "When your team hesitates on a specific phrase, the library gives them the answer in seconds. Search the phrase, read the rule, pick the compliant alternative. Faster than asking the compliance officer.",
    },
    {
      title: "Style guide foundation",
      body: "Most healthcare practices should maintain a written compliance style guide. The library is the source material — the banned phrases, compliant alternatives, and specialty-specific rules that belong in the guide.",
    },
    {
      title: "Marketing agency calibration",
      body: "Share specialty-relevant library sections with your marketing agency so they calibrate their work to your specific compliance environment. Faster onboarding, fewer iteration cycles.",
    },
    {
      title: "Content audit tool",
      body: "Use library categories as an audit checklist. Walk through each category on your existing content. Most practices find 10-25 specific library-matched issues on a first audit.",
    },
  ],
  included: [
    "Full access to 300+ active rules",
    "Daily updates from live enforcement",
    "Search across phrases, categories, specialties",
    "Specialty-specific rule filtering",
    "Source citations (FDA, FTC, state authorities)",
    "Risk level per rule",
    "Compliant alternative for every rule",
    "Email notifications on new rules in your categories",
  ],
  whatItIsnt: [
    "Not exhaustive — 300+ rules covers the high-frequency enforcement patterns; long-tail rules and edge cases may not have library entries yet. Your attorney handles the edge cases.",
    "Not a legal source of truth — the library is a working reference; regulatory interpretation in specific contexts requires attorney review.",
    "Not the only rule set — the scanner applies additional context-aware logic beyond the library's literal phrase matching. The library is a subset of the full rule engine.",
    "Not prescriptive — rules flag patterns that have produced enforcement; that doesn't mean every use of every phrase is always wrong. Context matters.",
  ],
  faqs: [
    {
      q: "Where do the 300+ rules come from?",
      a: "Primary sources: FDA warning letters (1,200+ analyzed to date), FTC settlements and consent decrees, state medical board disciplinary actions, and related regulatory guidance. Each rule is tied to specific source material. We don't include rules based on 'common advice' that doesn't trace to actual enforcement.",
    },
    {
      q: "How often is the library updated?",
      a: "Daily ingestion pipeline. New FDA warning letters are typically live in the library within 24 hours of publication on the FDA site. FTC actions similarly. State actions tracked on a per-state monitoring schedule.",
    },
    {
      q: "Can I suggest rules or flag missing patterns?",
      a: "Yes. Library users can flag content they expected the scanner to catch and suggest new rules. We review submissions against source enforcement and add validated patterns.",
    },
    {
      q: "Is the library the same thing as the scanner?",
      a: "The library is the human-browsable version of the rule set. The scanner is the automated engine that applies rules to your content. Both draw from the same underlying rule database, but the scanner also applies context-aware logic and specialty calibration that aren't purely literal rule matches.",
    },
    {
      q: "Can I export library content for my style guide?",
      a: "Yes. Selected rules export as formatted text or PDF for inclusion in internal compliance documents. Most practices export the rules most relevant to their specialty as a condensed internal reference.",
    },
    {
      q: "Does the library cover state-specific rules?",
      a: "Partially. State medical board and state AG actions are included as source material. Specific state advertising rules (e.g., California B&P 17500) are represented where they've produced specific enforceable patterns. The state coverage expands over time.",
    },
    {
      q: "What about rules for emerging treatments (NAD+, peptides, etc.)?",
      a: "The library tracks emerging enforcement patterns. NAD+, compounded GLP-1, peptides, exosomes all have growing rule sets as FTC enforcement in these categories develops. Library updates keep pace with the enforcement wave.",
    },
  ],
  relatedBlogSlugs: [
    "banned-words-healthcare-marketing-2026",
    "most-cited-phrases-fda-warning-letters",
    "structure-function-vs-disease-claims",
  ],
  relatedToolSlugs: ["scanner", "ai-rewriter", "enforcement-alerts"],
  keywords: [
    "FDA banned phrases database",
    "healthcare compliance library",
    "FTC healthcare marketing rules",
    "medical marketing banned words",
    "healthcare compliance database",
  ],
}
