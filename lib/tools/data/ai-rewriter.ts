import type { ToolMeta } from "../types"

export const meta: ToolMeta = {
  slug: "ai-rewriter",
  name: "AI Compliant Rewriter",
  category: "Core tool",
  title: "AI Compliant Rewriter — One-Click Compliant Rewrites for Healthcare Marketing | RegenCompliance",
  description:
    "Turn flagged non-compliant phrases into compliant alternatives that preserve your clinic's voice. The AI rewriter suggests 2-3 compliant options per flag, explains why each works, and lets you accept or modify in one click.",
  heroBadge: "Core tool",
  heroTagline:
    "Flagged phrases become compliant alternatives in one click. The rewriter preserves your voice, explains its reasoning, and offers multiple options per flag — never the same generic replacement twice.",
  shortVerdict:
    "Most compliance tools flag problems. The rewriter fixes them. You keep the marketing message; the claim language becomes compliant.",
  whatItIs:
    "The AI rewriter is a compliance-aware rewriting engine that takes flagged phrases and produces compliant alternatives tied to the specific rule that triggered the flag. It understands context — rewriting a disease-claim phrase differently than a substantiation phrase — and offers multiple options so you can pick the framing that matches your voice. It runs on Anthropic's Claude Sonnet for the rewriting step.",
  capabilities: [
    {
      title: "Rule-aware rewriting",
      body: "Each rewrite is grounded in the specific rule that triggered the flag. Disease claims get rewritten to structure-function or experience-based framings. FDA-approved misuse gets rewritten to the correct regulatory status. Safety absolutes get rewritten to realistic expected-experience language.",
    },
    {
      title: "Multiple options per flag",
      body: "Every rewrite surfaces 2-3 compliant alternatives. Pick the one that matches your brand voice, or combine elements. No single take-it-or-leave-it suggestion.",
    },
    {
      title: "Voice preservation",
      body: "The rewriter matches your original tone, sentence structure, and word choice patterns. Clinical/professional voice stays clinical. Warm/patient-facing voice stays warm. Compliant doesn't mean generic.",
    },
    {
      title: "Reasoning explained",
      body: "Every rewrite includes why the original was flagged, why the alternative works, and what specific rule category the change addresses. This is learning-by-doing — your team internalizes the rules through repeated exposure.",
    },
    {
      title: "Bulk rewrite mode",
      body: "For pages with multiple flags, bulk rewrite accepts compliant alternatives for each flag in one action. For a page that needed 8 individual rewrites, bulk mode turns that into 30 seconds.",
    },
    {
      title: "Inline editing",
      body: "Accept the suggestion as-is, modify it before accepting, or write your own replacement. The scanner rechecks what you write to confirm the flag is actually resolved.",
    },
  ],
  howItWorks: [
    {
      title: "1. Start from a scan",
      body: "Every rewrite starts from a scanner result with flagged phrases. The rewriter knows which phrases were flagged, which rules triggered them, and what context surrounds them.",
    },
    {
      title: "2. Click into a flag",
      body: "Each flagged phrase has a 'suggest rewrite' action. The AI generates 2-3 compliant alternatives specific to that phrase and that rule.",
    },
    {
      title: "3. Review the alternatives",
      body: "Each option shows the rewrite plus a short rationale — what rule category the rewrite addresses and why this specific alternative preserves your message.",
    },
    {
      title: "4. Accept, modify, or write your own",
      body: "Accept as-is, edit before accepting, or type your own replacement. Every option is re-scanned to confirm compliance.",
    },
    {
      title: "5. Apply across the document",
      body: "Rewrites apply to the specific flagged phrase. For recurring patterns across a document (same banned phrase appears 10 times), 'apply to all instances' handles repeated fixes in one click.",
    },
  ],
  useCases: [
    {
      title: "Full-page compliance cleanup",
      body: "A landing page with 15 flags becomes a compliant landing page in 10 minutes rather than 2 hours of manual research and rewriting.",
    },
    {
      title: "Social caption rewriting",
      body: "A flagged Instagram caption becomes 2-3 compliant caption options. Pick the one that fits the post. 30 seconds instead of a back-and-forth with the marketing team.",
    },
    {
      title: "Team training by example",
      body: "Each rewrite with its rationale is a micro-lesson. Teams that use the rewriter regularly internalize the rules faster than formal training alone produces.",
    },
    {
      title: "Ad variant generation",
      body: "Start with one compliant ad variant; rewrite specific phrases to produce multiple compliant variants for A/B testing. All variants maintain compliance while varying the creative execution.",
    },
    {
      title: "Historical content migration",
      body: "Practices with years of accumulated marketing copy use the rewriter to systematically update everything. What would have taken a copywriter weeks becomes a structured workflow.",
    },
  ],
  included: [
    "Unlimited rewrites — no per-rewrite fees",
    "2-3 alternatives per flagged phrase",
    "Reasoning explanation for every rewrite",
    "Bulk rewrite mode for multi-flag pages",
    "Inline editing with compliance recheck",
    "Voice preservation tuning",
    "Rule-category-specific rewrite logic",
  ],
  whatItIsnt: [
    "Not a content generator — you need existing content for the rewriter to rewrite. For creating new content from scratch, use ChatGPT or Jasper.",
    "Not a replacement for editorial judgment — rewrites are suggestions; your marketing team still picks the final wording.",
    "Not a substitute for legal advice — for close-call language, counsel should review the final copy.",
    "Not perfect on first pass — sometimes the best rewrite requires combining elements from multiple suggestions or adding context only you know.",
  ],
  faqs: [
    {
      q: "Do the rewrites actually sound like my voice?",
      a: "Typically yes, because the rewriter uses your original sentence structure and tone as input. Where your brand voice has specific conventions (particular word choices, specific structural patterns), you may need to adjust. Most practices find the rewrites 80-90% usable as-is, with the rest needing small tweaks.",
    },
    {
      q: "What if I don't like any of the suggestions?",
      a: "Write your own replacement. The scanner rechecks what you write to confirm the flag is resolved. If your own version still has a flag, you'll see that immediately. The rewriter is a starting point, not a forced output.",
    },
    {
      q: "Does the rewriter handle specialty-specific language?",
      a: "Yes. Rewrites calibrate to your specialty. Med spa rewrites use aesthetic-appropriate framing; weight loss rewrites handle GLP-1/compounded-drug nuance; regen rewrites respect 361-pathway framing. Same engine, specialty-appropriate output.",
    },
    {
      q: "Can I customize the rewriter's behavior?",
      a: "Rewrite style preferences (formal vs conversational, verbose vs concise) are being added in Q2 2026. Currently the rewriter uses sensible defaults calibrated to professional healthcare voice.",
    },
    {
      q: "What AI model does the rewriter use?",
      a: "Anthropic's Claude Sonnet. We chose Sonnet specifically for its factual discipline and refusal behavior on out-of-scope claims, which matters when the job is rewriting problematic claims into compliant alternatives. No-training setting is enabled on all requests.",
    },
    {
      q: "How does the rewriter know what's compliant?",
      a: "It's trained on the same rule set the scanner uses, plus patterns from public FDA warning letters and FTC settlements showing what the regulators accept. When FDA cites a specific rewrite in a consent decree as compliant, that pattern becomes part of the training data.",
    },
    {
      q: "Can I use the rewriter without running a scan first?",
      a: "The rewriter works from scanner flags, so you need a scan first. If you just want to check a single phrase, running a short scan is effectively instant and gives you both the flag analysis and the rewrite in one step.",
    },
  ],
  relatedBlogSlugs: [
    "banned-words-healthcare-marketing-2026",
    "healthcare-marketing-style-guide",
    "pre-publish-compliance-checklist",
  ],
  relatedToolSlugs: ["scanner", "compliance-library", "audit-trail"],
  keywords: [
    "AI compliant rewriter",
    "healthcare marketing rewriter",
    "FDA compliant rewrite tool",
    "healthcare AI rewriting",
    "compliance rewriter",
  ],
}
