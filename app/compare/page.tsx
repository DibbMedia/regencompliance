import type { Metadata } from "next"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { COMPETITORS } from "@/lib/compare/registry"
import { MARKETING_URL } from "@/lib/site-url"
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildItemListSchema,
} from "@/lib/schema"
import { CompareHubClient, type HubFaq } from "@/components/compare/compare-hub-client"

const canonical = `${MARKETING_URL}/compare`

const HUB_MISCONCEPTIONS: HubFaq[] = [
  {
    q: "Won't Claude or ChatGPT just learn to do this?",
    a: "Maybe generic guardrails. Not a healthcare-specific rule set sourced from FDA warning letters, daily-updated from live enforcement, with per-specialty and per-state layering, and a per-scan audit trail you can show a regulator. General-purpose AI is built to be okay at everything; compliance scanning has to be exactly right at one thing. The two categories will not collapse into each other any more than 'spreadsheet' and 'tax software' collapse into each other.",
  },
  {
    q: "Can Perplexity flag FDA warning letters in my copy?",
    a: "Perplexity searches the web for warning letters when you ask. It does not pre-index every enforcement action against an analyzed pattern library and apply that library automatically to your homepage. Research tools answer 'what does the rule say?' Compliance tools answer 'which sentences in my copy break the rule?' Both are useful; they are not the same job.",
  },
  {
    q: "Why pay $297/mo when ChatGPT Plus is $20?",
    a: "Because they answer different questions. ChatGPT Plus drafts copy. RegenCompliance checks copy against current FDA/FTC enforcement. Most healthcare practices that get this right pay for both - around $320/mo combined - because each tool owns one step of the workflow. One FDA warning letter response costs $50,000 to $150,000 in legal fees. The math on running both is not close.",
  },
  {
    q: "Isn't an AI assistant good enough if I'm careful with my prompts?",
    a: "Careful prompts produce careful copy. Careful copy is not the same thing as compliant copy. The reason general LLMs cannot do this job well is that they were trained on the open web - which is full of healthcare marketing copy that has been the subject of FDA enforcement. Telling them to be careful does not change which patterns they learned from. A purpose-built scanner is trained on the enforcement, not on the copy that drew the enforcement.",
  },
  {
    q: "If I have a healthcare marketing attorney, do I still need a compliance scanner?",
    a: "Yes - because attorneys do not bill at a rate that lets you run every Instagram caption past them. Attorneys handle judgment calls, novel-treatment questions, and warning-letter responses. Scanners handle the high-volume pattern-matching work that an attorney cannot economically do per-item. Most clinics that get this right pair both: scanner for daily content, attorney for strategic and incident work.",
  },
  {
    q: "Can I just run a one-time audit and call it done?",
    a: "No. The FDA issues warning letters weekly. The FTC publishes settlements continuously. Phrases that were enforcement-safe last quarter become enforcement-risky this quarter. A one-time audit is a snapshot; ongoing scanning is a process. You audit your books once a year and review your bookkeeping monthly - compliance works the same way.",
  },
]

const HUB_FAQS: HubFaq[] = [
  {
    q: "Which tool should I choose first?",
    a: "Depends on what is missing today. If you already have a marketing writer or agency producing copy, RegenCompliance is the gap - the compliance check between their output and publishing. If you are a solo-owner clinic writing everything yourself, pair a drafting tool (ChatGPT, Claude, or Jasper) with RegenCompliance. The most common end state is two tools: one that drafts copy fast, one that checks it against FDA/FTC rules before it goes live.",
  },
  {
    q: "Do I need multiple tools or can one do everything?",
    a: "No single tool does drafting, research, compliance, grammar, and legal judgment at a best-in-class level. The practices that get this right typically run three or four tools in sequence - a drafting tool, a research tool for ad-hoc regulatory questions, a compliance scanner, and a healthcare marketing attorney for edge cases. The combined monthly cost is still a small fraction of what one FDA warning letter response costs.",
  },
  {
    q: "Won't Claude or ChatGPT eventually replace RegenCompliance?",
    a: "They will keep getting better at drafting. They will not build a healthcare-specific rule set sourced from active FDA warning letters, daily-updated from live enforcement, with per-specialty and state-board layering, and a per-scan audit trail. That is not what general-purpose AI assistants do. The category boundary between general AI and purpose-built compliance is the same boundary as between general AI and EHRs, accounting tools, or security scanners - depth wins on regulated workflows.",
  },
  {
    q: "Can Perplexity replace a compliance scanner?",
    a: "No. Perplexity is excellent at telling you what the FDA rule says, with linked sources. It cannot scan your homepage and return a per-sentence compliance score with rule citations and rewrites. Research tools and compliance tools answer different questions. Most clinics use both - Perplexity for ad-hoc regulatory research, RegenCompliance for the operational scan on every published piece.",
  },
  {
    q: "Is RegenCompliance trying to replace my healthcare marketing attorney?",
    a: "No. We handle the pattern-matching work that attorneys cannot feasibly do per-item at their billing rate. The attorney continues to handle judgment calls, warning-letter responses, and novel-treatment questions. Clinics that pair both typically reduce routine legal review spend and use those hours on strategic questions.",
  },
  {
    q: "How often does the underlying rule set change?",
    a: "Daily. The FDA issues warning letters weekly and the FTC publishes enforcement actions continuously. Our ingestion pipeline adds new enforcement into the rule set within 24 hours of publication. This is the specific reason purpose-built tools outperform general AI on compliance - general models update on generational cycles, enforcement evolves in real time.",
  },
  {
    q: "What makes these comparisons 'honest' vs. sales pitches?",
    a: "Every comparison page leads with where the competitor wins. ChatGPT and Claude really are better for drafting from scratch. Perplexity really is better for regulatory research. Grammarly really is better for grammar. A healthcare attorney really is irreplaceable for warning-letter response. If we pretended otherwise, we would lose credibility on the part we actually do better - the day-to-day FDA/FTC compliance check on every piece of copy you publish.",
  },
  {
    q: "Why pay $297/mo when ChatGPT or Claude Pro is $20?",
    a: "Because they answer different questions. The $20 tools draft. The $297 tool checks against current enforcement. Practices that try to substitute drafting tools for compliance tools end up with confidently wrong copy - the writing reads professionally and contains violations the model could not flag because it was never trained on the enforcement library. The realistic combined cost is around $320/mo. One FDA warning letter response is $50,000 to $150,000 in legal fees.",
  },
  {
    q: "What if my marketing agency already audits for compliance?",
    a: "Most marketing agencies do an annual or quarterly audit. That is a snapshot. RegenCompliance is the day-to-day check on every new page, blog post, ad, and social caption between audits - the gap where most warning-letter triggers live. The two are complementary: the agency provides strategic and human judgment; we provide continuous automated scanning at the volume agencies cannot economically match.",
  },
  {
    q: "Can I try the tool before committing?",
    a: "Yes. The free audit at /free-audit takes a URL and returns a teaser report with violation count, severity breakdown, and the first two violations expanded - no card required. Founding-member signup adds a 30-day money-back guarantee on top of that.",
  },
]

export const metadata: Metadata = {
  title: "Healthcare Marketing Compliance Tools Compared - RegenCompliance vs Alternatives",
  description:
    "Honest head-to-head comparisons of RegenCompliance vs ChatGPT, Claude, Perplexity, Jasper, Grammarly, Copy.ai, healthcare marketing attorneys, and manual agency audits. When to use which, and why.",
  keywords: [
    "healthcare compliance tool comparison",
    "RegenCompliance alternatives",
    "FDA compliance software comparison",
    "healthcare marketing AI comparison",
    "ChatGPT vs Claude healthcare",
    "Perplexity healthcare compliance",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Healthcare Marketing Compliance Tools Compared - RegenCompliance vs Alternatives",
    description:
      "Honest head-to-head comparisons of RegenCompliance vs every alternative - AI assistants, research tools, grammar checkers, attorneys, and manual audits. When to use which.",
    url: canonical,
    type: "website",
  },
}

export default function ComparePage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Compare", url: canonical },
  ])
  const itemListSchema = buildItemListSchema(
    COMPETITORS.map((c) => ({
      name: `RegenCompliance vs ${c.competitor}`,
      url: `${MARKETING_URL}/vs/${c.slug}`,
    })),
  )
  const faqSchema = buildFaqSchema([...HUB_MISCONCEPTIONS, ...HUB_FAQS])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <JsonLd schema={[breadcrumbSchema, itemListSchema, faqSchema]} />
      <MarketingBg />
      <MarketingHeader />

      <CompareHubClient
        competitors={COMPETITORS.map((c) => ({
          slug: c.slug,
          competitor: c.competitor,
          categoryLabel: c.categoryLabel,
          shortVerdict: c.shortVerdict,
        }))}
        misconceptions={HUB_MISCONCEPTIONS}
        faqs={HUB_FAQS}
      />

      <MarketingFooter />
    </div>
  )
}
