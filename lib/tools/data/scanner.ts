import type { ToolMeta } from "../types"

export const meta: ToolMeta = {
  slug: "scanner",
  name: "Compliance Scanner",
  category: "Core tool",
  title: "Compliance Scanner — FDA/FTC Violation Detection in 30 Seconds | RegenCompliance",
  description:
    "Paste any marketing content — website copy, social post, ad, email, script — and get a 0-100 compliance score with every flagged phrase, risk level, rule citation, and compliant alternative in under 30 seconds.",
  heroBadge: "Core tool",
  heroTagline:
    "Paste any healthcare marketing content. Get a 0-100 compliance score with flagged phrases, risk ratings, rule citations, and compliant rewrites in 30 seconds.",
  shortVerdict:
    "The scanner is the front door. Every piece of healthcare marketing should run through it before publishing — and every piece already published should be audited against it.",
  whatItIs:
    "The compliance scanner is an AI-powered rule engine that reads your marketing content, identifies phrases matching FDA warning letter and FTC enforcement patterns, assigns a 0-100 compliance score, and surfaces specific compliant alternatives for each flagged phrase. It runs on Anthropic's Claude (Haiku for speed, Sonnet for rewrites) with our curated rule set of 300+ active patterns sourced from actual enforcement actions.",
  capabilities: [
    {
      title: "0-100 compliance score per piece of content",
      body: "Every scan returns a numerical score you can track over time and use as a publish/hold threshold. Scores correlate to severity and count of flagged issues.",
    },
    {
      title: "Phrase-level flagging with rule citations",
      body: "Each flagged phrase includes the specific rule category, the source authority (FDA, FTC, state board), and why the phrase triggered the flag. Not just 'problem here' — here's the specific rule and the specific evidence base.",
    },
    {
      title: "Risk level per flag (HIGH/MEDIUM/LOW)",
      body: "Not every flag is equally urgent. HIGH flags typically reflect disease claims, FDA-approved misuse, or safety absolutes. MEDIUM reflects substantiation issues and superlatives. LOW reflects disclosure gaps and style considerations.",
    },
    {
      title: "Context-aware matching",
      body: "The scanner doesn't just pattern-match on words. 'Our treatment helps manage joint discomfort' is different from 'Our treatment treats arthritis' even though both mention joints. Context determines whether claims cross lines.",
    },
    {
      title: "Specialty-specific rule sets",
      body: "Rules calibrate to your specialty — med spa scans use different patterns than weight loss scans. Same engine, specialty-appropriate detection.",
    },
    {
      title: "Multiple input types",
      body: "Paste text, upload files (.txt, .pdf, .docx), or scan by URL. All inputs produce the same scoring format so results are comparable across content types.",
    },
  ],
  howItWorks: [
    {
      title: "1. Submit content",
      body: "Paste marketing copy into the scanner, upload a file, or enter a URL to scan. The scanner accepts website copy, social posts, ad creative, emails, scripts, landing pages — any text-based marketing surface.",
    },
    {
      title: "2. AI analysis against rule set",
      body: "Content runs through our rule engine (built on Anthropic's Claude) comparing against 300+ patterns from real enforcement. The rule set updates daily as new FDA warning letters and FTC actions publish.",
    },
    {
      title: "3. Score and flags returned",
      body: "In under 30 seconds, you get a compliance score, every flagged phrase highlighted in context, risk level per flag, and the specific rule source for each flag.",
    },
    {
      title: "4. Review and fix",
      body: "Click into any flag for details and the compliant rewrite suggestion. Accept, modify, or mark as acceptable-with-review. Each decision is logged.",
    },
    {
      title: "5. Rescan to verify",
      body: "After edits, rescan to confirm the score improved and specific flags resolved. Most content goes from 20-40 initial score to 85+ after one rewrite pass.",
    },
  ],
  useCases: [
    {
      title: "Pre-publish review on every social post",
      body: "Paste the caption before scheduling. 15 seconds, clear go/no-go signal. Catches the disease claims and missing disclosures that cause FTC issues.",
    },
    {
      title: "Quarterly website audit",
      body: "Scan every marketing page against current rules. Prioritize corrections by score + reach. Most practices find 15-25 fixable flags on the first scan.",
    },
    {
      title: "Ad copy review before campaign launch",
      body: "Each ad variant gets scanned before going live. Catches the specific claims platforms and regulators both care about. Saves rejected-ad cycles.",
    },
    {
      title: "Warning letter response preparation",
      body: "If you receive an FDA letter, a full scan of the cited surfaces plus related content produces documentation your attorney can use in the response.",
    },
    {
      title: "Competitor marketing analysis",
      body: "Scan competitor content to understand where they're exposed. Not as a weapon — as a benchmarking tool for your own compliance posture.",
    },
    {
      title: "Agency output review",
      body: "Every deliverable from your marketing agency passes through the scanner before you publish. Catches what their internal review missed.",
    },
  ],
  included: [
    "Unlimited scans — no per-scan fees, no monthly limit",
    "All content types — text, file upload, URL",
    "300+ active rules, updated daily",
    "Specialty-specific rule calibration",
    "Compliant alternative suggestions per flag",
    "Scan history with full audit trail",
    "Export scans as PDF or CSV",
    "3 team seats",
  ],
  whatItIsnt: [
    "Not legal advice — the scanner provides educational compliance guidance based on a rule set; a healthcare marketing attorney should review close-call items and all regulatory responses.",
    "Not a content generator — the scanner analyzes and rewrites existing content; for creating new content from scratch, use a drafting tool like ChatGPT or Jasper, then scan before publishing.",
    "Not a grammar or style tool — it doesn't flag comma splices or passive voice; use Grammarly or similar for grammar.",
    "Not a guarantee — compliance is a judgment call at the edges; the scanner reduces risk dramatically but does not eliminate it.",
  ],
  faqs: [
    {
      q: "How accurate is the scanner?",
      a: "For pattern-matchable violations (disease claims, FDA-approved misuse, guarantees, safety absolutes), accuracy is very high because these are the specific patterns the rule set is trained on. For judgment-call items (close-call context-dependent claims), accuracy is lower and we err on the side of false positives — it's better to over-flag and let a human accept than to under-flag and miss something that causes a warning letter.",
    },
    {
      q: "Does the scanner use my content to train AI?",
      a: "No. We use Anthropic's Claude API with the no-training setting enabled for all requests. Your content is analyzed for the scan, results are returned to you, and nothing from your account feeds into model training anywhere. Your content is also not stored beyond your scan history (which only you and your team see).",
    },
    {
      q: "How fast is 'in under 30 seconds'?",
      a: "Typical scans of a 500-word piece of content complete in 8-15 seconds. Longer content (3,000+ words) can take up to 30 seconds. File uploads add a few seconds for extraction. URL scans add time for page fetch.",
    },
    {
      q: "What file types can I upload?",
      a: ".txt, .pdf, .docx, and a few others. Size limits apply. For very long documents, splitting into logical sections often produces better scan quality than one massive scan.",
    },
    {
      q: "Can I integrate the scanner into my CMS or marketing platform?",
      a: "API-to-API scanning is on the roadmap. Currently the scanner runs through our web app. If you have a specific integration need, reach out — we're building this for teams that want pre-publish scanning inside their existing content workflow.",
    },
    {
      q: "Does the scanner catch platform policy issues (Meta, Google)?",
      a: "Partially. Many platform policies overlap with FDA/FTC rules (weight loss claims, disease claims, before/after imagery). Where platform rules go beyond federal rules (specific Meta imagery restrictions, Google medical ad category rules), the scanner covers the overlapping areas but isn't a complete platform-policy check.",
    },
    {
      q: "Can the scanner handle non-English content?",
      a: "Current rule set is English-only. For practices marketing in Spanish or other languages, translate to English for scanning. We're evaluating multilingual support for future versions.",
    },
    {
      q: "How is the compliance score calculated?",
      a: "A weighted combination of flag count, flag severity, and content length. HIGH-severity flags weigh heavily; clean paragraphs with no flags score full marks. The exact formula is tuned to produce scores that correlate with real enforcement outcomes in public warning letters we've analyzed.",
    },
  ],
  relatedBlogSlugs: [
    "healthcare-website-compliance-audit-framework",
    "banned-words-healthcare-marketing-2026",
    "most-cited-phrases-fda-warning-letters",
  ],
  relatedToolSlugs: ["ai-rewriter", "audit-trail", "compliance-library"],
  keywords: [
    "healthcare compliance scanner",
    "FDA compliance scanner",
    "FTC marketing scanner",
    "medical marketing compliance tool",
    "healthcare AI compliance check",
  ],
}
