// FAQ data for the /tools hub page. Plain TS module so both the server page
// (JSON-LD generation) and the "use client" hub component can import without
// crossing the RSC client boundary. Same fix as app/for/hub-faqs.ts —
// importing non-component values from a "use client" module breaks /tools at
// runtime under Next.js 16 + Turbopack.

export interface HubFaq {
  q: string
  a: string
}

export const HUB_FAQS: HubFaq[] = [
  {
    q: "Do I have to pick one tool or do I get all of them?",
    a: "All five tools are included in every RegenCompliance subscription. No per-tool pricing, no add-on tiers. The founding rate is $297/mo for everything; the standard rate is $497/mo for everything.",
  },
  {
    q: "Which tool should I start with?",
    a: "The scanner is the front door. Most practices run their existing marketing through it first, see flagged phrases and scores, then use the AI rewriter to fix what was flagged. The audit trail captures everything automatically; the library and alerts are references you come back to.",
  },
  {
    q: "Do the tools work together or can I use them independently?",
    a: "They work as a system but also independently. You can use the scanner alone if you want; the audit trail captures every scan automatically; the rewriter activates from scanner flags. Most practices use all five within their first month.",
  },
  {
    q: "Is there a free version of any tool?",
    a: "The free demo at /demo runs the scanner on content you paste. No card required. Gives you a real sense of what the scanner does, with some limits on the free tier. The rewriter and full platform require a subscription.",
  },
  {
    q: "Which tools require setup vs work out of the box?",
    a: "Scanner, AI rewriter, and audit trail work out of the box. The compliance library is browsable immediately. Enforcement alerts require a one-time profile configuration (your specialty, states, service lines) so alerts calibrate to your practice.",
  },
  {
    q: "Can my marketing agency use the tools on my account?",
    a: "Yes. Add them as a team seat (3 included with founding plan). They can run scans, generate rewrites, and contribute to the audit trail. Decisions are logged per-user so accountability is preserved.",
  },
  {
    q: "How fast does the scanner actually run?",
    a: "Most pages return a full report in under 30 seconds. Long-form content like multi-thousand-word landing pages or PDF policy documents may take up to a minute. The AI rewriter typically returns a compliant alternative in 10 to 20 seconds per flagged passage.",
  },
  {
    q: "What file types and inputs can I scan?",
    a: "Direct text paste, URL crawling (single page or full site sweep), PDF upload, and image-with-text via OCR are all supported. Social posts can be pasted directly; ad copy can be pasted from your ad-platform export.",
  },
  {
    q: "Does the audit trail produce something I can hand to an attorney?",
    a: "Yes. Every scan, decision, and rewrite is permanently logged. PDF export gives you a date-stamped report of every piece of content scanned, every flag raised, every action taken. That document is what attorneys and compliance officers ask for, and you generate it in two clicks.",
  },
  {
    q: "What happens if a new FDA warning letter changes the rules mid-month?",
    a: "Enforcement alerts notify you within 24 hours of significant new enforcement that affects your specialty or service lines. Your existing scans are not retroactively flagged, but the new rule applies to everything scanned going forward, and the alert tells you which content categories to re-scan.",
  },
]
