import type { CompetitorMeta } from "../types"

export const meta: CompetitorMeta = {
  slug: "perplexity",
  competitor: "Perplexity",
  competitorLong: "Perplexity AI",
  categoryLabel: "AI research tool",
  title:
    "RegenCompliance vs Perplexity for Healthcare Marketing Compliance (2026)",
  description:
    "Perplexity is excellent for finding what a regulation says. It is not built to scan your marketing copy against an evolving FDA/FTC rule set. Here is the honest comparison between Perplexity and a purpose-built compliance scanner.",
  heroBadge: "Head to head",
  heroTagline:
    "Perplexity researches. RegenCompliance operationalizes - it checks your actual copy against current FDA and FTC enforcement, not just what the rule says in theory.",
  bottomLine:
    "Perplexity is an excellent research tool - better than Google for finding sources fast. Useful for understanding what a regulation says. It is not built to scan your marketing copy against an evolving rule set, flag specific compliance violations in your text, suggest compliant rewrites, or generate an audit trail. Perplexity is the research layer; RegenCompliance is the operational layer. The two tools answer completely different questions and most healthcare practices benefit from both.",
  shortVerdict:
    "Perplexity tells you what the rule says. RegenCompliance tells you which sentences in your homepage break the rule.",
  theirStrengths: [
    {
      title: "Best-in-class for regulatory research",
      body: "Asking 'what does the FDA say about stem cell marketing?' or 'what FTC consent decrees apply to weight-loss claims?' returns linked, sourced answers faster than any Google search. For understanding a regulation, Perplexity is genuinely excellent.",
    },
    {
      title: "Real-time web access with citations",
      body: "Unlike most LLMs, Perplexity searches the live web for every query and shows its sources. That fixes the stale-knowledge problem that hurts general-purpose AI on regulation questions, and lets you verify each claim against the linked source.",
    },
    {
      title: "Useful for warning-letter precedent research",
      body: "If you want to find similar warning letters or FTC actions against your specific treatment category, Perplexity gives you a fast way to dig into the FDA database and trade-press coverage. That research is genuinely useful before a content strategy decision.",
    },
    {
      title: "Free tier is functional",
      body: "Perplexity's free tier handles most research queries. The Pro tier ($20/mo) adds longer reasoning, file uploads, and unlimited Pro searches. For research-only use, the cost is minimal.",
    },
  ],
  ourStrengths: [
    {
      title: "Scans your actual copy, not the abstract regulation",
      body: "Perplexity tells you what the FDA says about disease claims in general. RegenCompliance tells you that line 14 of your homepage contains a disease claim and offers three compliant rewrites. The difference between research and operations is the difference between knowing the speed limit and not getting a ticket.",
    },
    {
      title: "Trained on enforcement patterns, not just rule text",
      body: "Perplexity surfaces what the rule says. RegenCompliance is trained on which specific phrases triggered enforcement - the gap between what a rule says in plain text and what FDA/FTC actually pursue is enormous, and only a tool trained on actual warning letters captures that gap.",
    },
    {
      title: "Compliant rewrites with reasoning",
      body: "When we flag a phrase, we offer multiple compliant alternatives that keep your clinic's tone intact, with the rule citation and the warning-letter precedent attached. Perplexity does research; it does not rewrite your marketing copy to make it compliant.",
    },
    {
      title: "0-100 compliance score per piece of content",
      body: "Every scan returns a numeric score, severity breakdown, and per-violation detail. You can prioritize what to fix first. Perplexity is a research interface - it has no concept of scoring your content.",
    },
    {
      title: "Permanent audit trail",
      body: "Every scan is permanently logged with timestamp, score, and flagged-phrase detail, exportable as PDF. If you ever need to demonstrate pre-publish due diligence in a warning-letter response, that trail is the evidence. A Perplexity research session is not a regulatory audit trail.",
    },
    {
      title: "Specialty and state rule layering",
      body: "Med spa rules differ from regen clinic rules differ from weight-loss clinic rules. State medical board rules layer on top of FDA/FTC. RegenCompliance applies the right rule set per scan. Perplexity is a research tool - it has no concept of your practice's specialty or state.",
    },
  ],
  honestLimitations: [
    "If you need to understand what a regulation says, what enforcement looks like in your specialty, or what precedent exists for a specific claim, Perplexity is genuinely better than us. We are not a research tool.",
    "Perplexity's citation discipline is real and useful. For early research before a content-strategy decision, or when you want to understand why a specific phrase is risky, Perplexity is the right starting point.",
    "If your only need is occasional regulatory questions and you do not publish marketing content frequently, Perplexity Pro at $20/mo may be enough on its own - though one warning letter response costs more than a decade of RegenCompliance.",
    "Neither tool replaces final legal review. We catch pattern-matchable violations against current enforcement. A healthcare marketing attorney handles judgment calls specific to your state, specialty, and treatment mix.",
  ],
  useCases: [
    {
      scenario: "'What does the FDA say about stem cell marketing?'",
      winner: "them",
      recommendation:
        "Use Perplexity. It is the right tool for understanding the regulatory landscape with linked sources. RegenCompliance does not answer regulatory-research questions - it scans copy against the rules.",
    },
    {
      scenario: "'Is line 14 of my homepage compliant?'",
      winner: "us",
      recommendation:
        "Use RegenCompliance. Perplexity will give you a thoughtful general answer about whether the type of claim is risky. It will not point at the specific phrasing in your draft, score it, and offer compliant rewrites with rule citations.",
    },
    {
      scenario: "Researching precedent before a new service launch",
      winner: "both",
      recommendation:
        "Start with Perplexity to understand enforcement history for the treatment category. Then draft your launch copy in any tool, and run it through RegenCompliance before publishing. Research first, operational check second.",
    },
    {
      scenario: "Auditing existing site copy for FDA/FTC violations",
      winner: "us",
      recommendation:
        "Perplexity has no scan-your-copy mode. Paste each page into RegenCompliance, get a compliance score and flagged-phrase report per page, accept rewrites, export the audit trail.",
    },
    {
      scenario: "Responding to an FDA warning letter",
      winner: "us",
      recommendation:
        "RegenCompliance produces a full audit of every marketing surface, with exportable records and a paper trail of pre-letter scans. Perplexity is a research interface - useful for understanding the warning letter, not for documenting your remediation effort.",
    },
    {
      scenario: "Quickly checking 'what state advertising rules apply to my Texas med spa?'",
      winner: "them",
      recommendation:
        "Use Perplexity to research the Texas Medical Board's advertising guidance and recent enforcement. RegenCompliance will apply Texas state board rules per scan, but Perplexity is the better tool for understanding why a rule exists.",
    },
  ],
  featureMatrix: [
    { feature: "Healthcare-specific rule set", us: true, them: false },
    { feature: "Sourced from real FDA warning letters", us: true, them: "Searchable, not pre-indexed for your copy" },
    { feature: "Sourced from real FTC enforcement actions", us: true, them: "Searchable, not pre-indexed for your copy" },
    { feature: "Specialty-specific rule layering", us: true, them: false },
    { feature: "State medical board overlay", us: true, them: false },
    { feature: "Scans your actual copy for violations", us: true, them: false },
    { feature: "Flags specific phrases with rule citations", us: true, them: false },
    { feature: "Compliant rewrites for flagged phrases", us: true, them: false },
    { feature: "0-100 compliance score per piece of content", us: true, them: false },
    {
      feature: "Rule freshness",
      us: "Daily ingestion of live enforcement",
      them: "Real-time web search per query",
    },
    { feature: "Permanent audit trail", us: true, them: false },
    { feature: "PDF export for legal review", us: true, them: false },
    { feature: "CSV export", us: true, them: false },
    { feature: "Free-form regulatory research with citations", us: false, them: true },
    { feature: "Live web search for any query", us: false, them: true },
    { feature: "General research outside healthcare", us: false, them: true },
    {
      feature: "Monthly cost",
      us: "$297 founding / $497 standard",
      them: "Free / $20 (Pro)",
    },
    { feature: "Team seats included", us: "3", them: "Per-seat billing" },
    {
      feature: "Zero patient data exposure commitment",
      us: "Yes - marketing content only",
      them: "Per-plan; consumer plan default differs from Enterprise",
    },
  ],
  pricing: {
    us: {
      label: "RegenCompliance (Founding)",
      price: "$297/mo",
      sub: "Locked for life · 3 seats · unlimited scans · audit trail · PDF export",
    },
    them: {
      label: "Perplexity Pro",
      price: "$20/mo",
      sub: "Per user · live web research with citations · zero healthcare compliance logic",
    },
  },
  faqs: [
    {
      q: "Can Perplexity scan my homepage and tell me which sentences violate FDA rules?",
      a: "No. Perplexity is a research interface, not a content scanner. You can ask Perplexity 'what does the FDA say about disease claims?' and get a thoughtful sourced answer. You cannot paste your homepage and have Perplexity return a per-sentence compliance score with rule citations and rewrites. Those are different jobs and different products.",
    },
    {
      q: "Doesn't Perplexity have real-time web access? So it knows last week's FDA warning letters, right?",
      a: "It can search the FDA warning-letter database in real time when you ask. That is genuinely useful for research. It does not pre-index every warning letter, FTC consent decree, and state board action against an enforcement pattern library that is then applied automatically to your copy. The difference is between 'I can search' and 'I have already analyzed every enforcement action and built a rule set from it.' Perplexity is the former; RegenCompliance is the latter.",
    },
    {
      q: "Can I use Perplexity instead of RegenCompliance to save money?",
      a: "Only if your job is regulatory research, not content publishing. The moment you publish marketing copy that goes to patients, you need a compliance check on the actual copy. Perplexity does not do that. Most clinics that try to substitute research tools for compliance scanning end up with confidently wrong copy - the research told them the rule, but they had no automated check to catch the specific phrasings that violate it.",
    },
    {
      q: "Is Perplexity better than RegenCompliance at finding warning-letter precedent?",
      a: "Yes, for free-form research. If you want to read every FDA warning letter against stem cell clinics from 2020-2026, Perplexity is the better interface. RegenCompliance has already absorbed that precedent into its rule set, so the rules apply automatically to your scans - but if you want to read the actual letters yourself, Perplexity is the research tool.",
    },
    {
      q: "Could I just paste my homepage into Perplexity and ask 'is this compliant?'",
      a: "You can ask, and Perplexity will give you a thoughtful answer with citations. The answer will be a mix of accurate rules, missed phrasings (because Perplexity is not pre-indexed against an enforcement library), and general guidance that does not match how FDA/FTC actually enforce in your specialty. Research-grade answers and operational compliance scans are not the same thing - that gap is the entire reason RegenCompliance exists.",
    },
    {
      q: "Does RegenCompliance use Perplexity under the hood?",
      a: "No. We use Anthropic's Claude models (Haiku for scans, Sonnet for rewrites) with our healthcare-specific rule set layered on top, plus a daily ingestion pipeline that pulls new FDA warning letters and FTC enforcement actions into the rule library. Perplexity is a different category of tool - we are not built on top of it.",
    },
    {
      q: "Will Perplexity eventually add a 'scan my copy' feature for healthcare?",
      a: "It might add a 'check this content' feature as a generic capability. It will not build a healthcare-specific rule set sourced from FDA warning letters, daily-updated from active enforcement, with per-treatment rule scoping, state medical board overlays, and a per-scan audit trail. That is what purpose-built compliance tools do. Research tools and compliance tools are different products that solve different jobs.",
    },
    {
      q: "Can RegenCompliance pull in live web sources the way Perplexity does?",
      a: "Our daily rule ingestion already does this for FDA warning letters, FTC press releases, and state medical board actions - we just absorb the data into the rule set rather than surfacing it as a chat interface. If you want to read source material directly, Perplexity is the better interface for that step.",
    },
    {
      q: "What is the realistic stack for a healthcare practice in 2026?",
      a: "Perplexity or similar for ad-hoc regulatory research (often the free tier is enough) + Claude or ChatGPT for drafting + RegenCompliance for the operational compliance check on every piece of copy that gets published + a healthcare marketing attorney on retainer for judgment calls. Each tool owns a different job. The combined cost is a small fraction of what a single FDA warning letter response runs in legal fees ($50,000 to $150,000 typical).",
    },
  ],
  relatedBlogSlugs: [
    "banned-words-healthcare-marketing-2026",
    "healthcare-website-compliance-audit-framework",
    "structure-function-vs-disease-claims",
  ],
  keywords: [
    "Perplexity healthcare compliance",
    "Perplexity FDA research",
    "Perplexity AI healthcare marketing",
    "RegenCompliance vs Perplexity",
    "healthcare marketing AI comparison",
    "AI research vs compliance scanner",
  ],
}
