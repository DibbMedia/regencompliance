import type { CompetitorMeta } from "../types"

export const meta: CompetitorMeta = {
  slug: "grammarly",
  competitor: "Grammarly",
  competitorLong: "Grammarly and Grammarly Business",
  categoryLabel: "Grammar and style assistant",
  title: "RegenCompliance vs Grammarly for Healthcare Compliance (2026)",
  description:
    "Grammarly catches grammar, spelling, and style issues. It does not catch FDA or FTC violations. Why grammar tools miss the exact mistakes that trigger warning letters - and what to use instead.",
  heroBadge: "Beyond grammar",
  heroTagline:
    "Grammarly will catch 'principle' vs 'principal' and fix your comma splice. It will not catch 'FDA-approved stem cells' - a phrase that has been the basis for warning letters for years.",
  bottomLine:
    "Grammarly is an outstanding grammar and style tool. It was never designed as a regulatory compliance tool, and it does not function as one. Running healthcare marketing copy through Grammarly will improve its grammar and style with high reliability. It will not reduce your FDA or FTC enforcement exposure, because Grammarly does not model that problem. Keep Grammarly. Add RegenCompliance. They solve different problems at different layers.",
  shortVerdict:
    "Grammarly fixes grammar. RegenCompliance catches the phrases that trigger federal enforcement. Completely different problems.",
  theirStrengths: [
    {
      title: "Grammar, spelling, and punctuation - best in class",
      body: "Grammarly's core grammar and spelling engine is genuinely among the best in software. For catching typos, comma splices, subject-verb mismatches, and punctuation issues, it is hard to beat.",
    },
    {
      title: "Style and clarity improvements",
      body: "Grammarly flags passive voice, wordy sentences, hedge words, unclear antecedents. For making writing tighter and more readable, the style engine is genuinely useful.",
    },
    {
      title: "Tone detection",
      body: "The tone detector is good at catching unintentionally aggressive or overly formal language. Useful for patient-facing communication where tone matters as much as content.",
    },
    {
      title: "Works inside every writing surface you already use",
      body: "Browser extension, Word, Google Docs, email clients, Slack. Grammarly shows up wherever you type, which makes adoption frictionless in a way that requires-paste-in tools do not match.",
    },
  ],
  ourStrengths: [
    {
      title: "Catches the phrases that get clinics warning letters",
      body: "Our rule set starts with the specific phrases cited in actual FDA warning letters and FTC settlements. 'Cures,' 'heals,' 'FDA-approved' applied to a non-approved product, 'guaranteed results,' 'proven to reverse,' typical-experience testimonials without disclosure. Grammarly flags none of these.",
    },
    {
      title: "Understands regulatory context, not just word-level issues",
      body: "Compliance is not a word-level problem. 'Our patients report feeling better' is compliant. 'Our treatment helps patients feel better' is structure-function. 'Our treatment treats chronic fatigue' is a disease claim. Same topic, three different regulatory categories. Our engine is built around these distinctions.",
    },
    {
      title: "Current enforcement data, not a frozen rulebook",
      body: "Every week, the FDA issues new warning letters and the FTC announces new enforcement actions. Our rule set ingests these daily. A grammar tool's rule set is grammar - which does not need weekly updates, because grammar does not change.",
    },
    {
      title: "Audit trail built for regulatory response",
      body: "Grammarly saves documents and edit history, but that history is not structured as pre-publish compliance evidence. Our scan records are exactly that structure: timestamp, score, flagged phrases, rule citations, PDF export. Designed for warning-letter response, not for content collaboration.",
    },
  ],
  honestLimitations: [
    "Grammarly catches grammar and spelling that we do not. Our scanner is not a grammar check.",
    "Grammarly's real-time inline editor is a different UX from our paste-and-scan workflow. For live writing, Grammarly's surface is more convenient.",
    "If all you write is internal memos, operations docs, and non-medical patient comms - Grammarly alone is fine.",
    "We do not compete on tone detection, brevity scoring, or readability grades. Grammarly is the better tool for those.",
  ],
  useCases: [
    {
      scenario: "Writing a new treatment page",
      winner: "both",
      recommendation:
        "Use Grammarly inline while you write (grammar, tone, clarity). When the draft is done, paste into RegenCompliance for the compliance scan. Different passes, different tools.",
    },
    {
      scenario: "Patient intake forms and after-visit instructions",
      winner: "both",
      recommendation:
        "Grammarly for readability and plain-language checks. RegenCompliance for the 'treats,' 'heals,' 'cures' language that sometimes slips into what should be educational copy.",
    },
    {
      scenario: "Social media captions",
      winner: "us",
      recommendation:
        "Captions are short enough that grammar issues are already obvious. The compliance exposure is the hidden problem - short captions violate the FTC Endorsement Guides, typical-experience rules, and structure-function boundary constantly.",
    },
    {
      scenario: "Internal SOPs and operations docs",
      winner: "them",
      recommendation:
        "No public audience, no regulatory exposure. Grammarly is the right tool. Do not run internal docs through RegenCompliance - it is not that kind of check.",
    },
    {
      scenario: "Email to a prospective patient",
      winner: "both",
      recommendation:
        "Grammarly for tone. RegenCompliance for any outcome or efficacy language. Individual patient emails are considered marketing under the FTC's definition when they describe treatments or outcomes.",
    },
  ],
  featureMatrix: [
    { feature: "Healthcare-specific rule set", us: true, them: false },
    { feature: "FDA warning letter data", us: true, them: false },
    { feature: "FTC enforcement data", us: true, them: false },
    { feature: "Compliant-alternative rewrites with reasoning", us: true, them: false },
    { feature: "0–100 compliance score", us: true, them: false },
    { feature: "Pre-publish audit trail with PDF export", us: true, them: false },
    { feature: "Grammar and spelling check", us: false, them: true },
    { feature: "Tone detection", us: false, them: true },
    { feature: "Readability scoring", us: false, them: true },
    { feature: "Inline real-time editor", us: false, them: true },
    { feature: "Plagiarism detection", us: false, them: true },
    { feature: "Word choice & clarity suggestions", us: false, them: true },
    { feature: "Monthly cost", us: "$297 founding / $497 standard", them: "$12–$25 per seat" },
  ],
  pricing: {
    us: {
      label: "RegenCompliance (Founding)",
      price: "$297/mo",
      sub: "Locked for life · 3 seats · unlimited scans · FDA/FTC rule engine · audit trail",
    },
    them: {
      label: "Grammarly Premium / Business",
      price: "$12–$25/mo per seat",
      sub: "Per seat billing · grammar, style, tone · no regulatory rules",
    },
  },
  faqs: [
    {
      q: "Will Grammarly eventually add FDA/FTC compliance checks?",
      a: "Nothing about Grammarly's product direction suggests they will. Their roadmap centers on writing assistance across all industries - grammar, style, tone, clarity, plagiarism, generative drafting. Purpose-built regulatory compliance is a categorically different product with a different data model, different enforcement-monitoring infrastructure, and different audit-trail requirements. The horizontal-tool-adds-vertical-feature pattern does not typically produce best-in-class vertical tools.",
    },
    {
      q: "Is there overlap between the two tools?",
      a: "Almost none. Grammarly does not flag structure-function claims, FTC endorsement rules, disease claims, or typical-experience disclosure issues. RegenCompliance does not flag comma splices, passive voice, or tone. The overlap is that both operate on written text. The output is non-overlapping.",
    },
    {
      q: "Does Grammarly Business have any compliance features?",
      a: "Grammarly Business adds style guides, brand tone, and team analytics. None of these are regulatory compliance features. 'Style guide' in Grammarly terms means enforcing internal writing standards (e.g., 'always use serial commas,' 'prefer active voice') - not enforcing external regulatory rules.",
    },
    {
      q: "If I use Grammarly for everything, am I safe?",
      a: "Safe from grammar errors, yes. Safe from FDA warning letters, no. The phrase that gets a clinic a warning letter is typically perfectly grammatical, professionally styled, and tonally correct. Grammar tools cannot catch regulatory violations because regulatory violations are a separate category of mistake.",
    },
    {
      q: "Can I run text through both tools in one workflow?",
      a: "Yes, and most clinics do. Write with Grammarly inline. When the draft is done, paste into RegenCompliance for the compliance pass. The two checks happen at different stages and catch different classes of problem. No integration is required.",
    },
    {
      q: "Does RegenCompliance do any grammar or style checking?",
      a: "No. We focus exclusively on healthcare regulatory compliance. Adding grammar checking would spread our focus - and the Grammarly-style surface is already well-served. We stay deep on the one thing nobody else does well.",
    },
  ],
  relatedBlogSlugs: [
    "banned-words-healthcare-marketing-2026",
    "structure-function-vs-disease-claims",
    "healthcare-website-compliance-audit-framework",
  ],
  keywords: [
    "RegenCompliance vs Grammarly",
    "Grammarly healthcare compliance",
    "healthcare marketing compliance tool",
    "Grammarly FDA",
    "beyond grammar healthcare",
  ],
}
