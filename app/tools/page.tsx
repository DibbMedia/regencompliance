import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Wrench,
  Scan,
  Sparkles,
  Lock,
  BookOpen,
  Bell,
} from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { TOOLS } from "@/lib/tools/registry"

const canonical = "https://compliance.regenportal.com/tools"

const HUB_FAQS = [
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
]

const TOOL_ICON_MAP: Record<string, typeof Scan> = {
  scanner: Scan,
  "ai-rewriter": Sparkles,
  "audit-trail": Lock,
  "compliance-library": BookOpen,
  "enforcement-alerts": Bell,
}

export const metadata: Metadata = {
  title: "RegenCompliance Tools — Scanner, AI Rewriter, Audit Trail, Library, Alerts",
  description:
    "Deep dives on every RegenCompliance tool — the compliance scanner, AI compliant rewriter, audit trail with PDF export, 300+ rule library, and real-time enforcement alerts.",
  keywords: [
    "RegenCompliance tools",
    "healthcare compliance tools",
    "FDA compliance software features",
    "healthcare marketing tools",
  ],
  alternates: { canonical },
  openGraph: {
    title: "RegenCompliance Tools",
    description:
      "Every tool inside RegenCompliance — scanner, rewriter, audit trail, rule library, enforcement alerts.",
    url: canonical,
    type: "website",
  },
}

export default function ToolsIndexPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://compliance.regenportal.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: canonical,
      },
    ],
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://compliance.regenportal.com/tools/${t.slug}`,
      name: t.name,
    })),
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HUB_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MarketingBg />
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-14 sm:pt-36">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-6">
            <Wrench className="h-3 w-3" />
            Every tool inside RegenCompliance
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            Five tools.{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              One subscription.
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
            The compliance scanner that flags violations. The AI rewriter that
            fixes them. The audit trail that documents your program. The rule
            library that backs it all. And enforcement alerts that keep you
            ahead of what&apos;s coming.
          </p>
        </div>
      </section>

      {/* ============ TOOL CARDS ============ */}
      <section className="relative py-8">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {TOOLS.map((t) => {
              const Icon = TOOL_ICON_MAP[t.slug] ?? Wrench
              return (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-[#55E039]/10 border border-[#55E039]/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#55E039]" aria-hidden />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]/80">
                      {t.category}
                    </p>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white leading-tight group-hover:text-[#55E039] transition-colors">
                    {t.name}
                  </h2>
                  <p className="mt-3 text-sm text-white/70 leading-relaxed line-clamp-4">
                    {t.shortVerdict}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#55E039]">
                    Learn more
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ BUNDLE MESSAGE ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-[#55E039]/25 bg-gradient-to-br from-[#55E039]/[0.06] via-[#0a0a0a] to-[#0a0a0a] p-8 sm:p-10 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#55E039]/[0.08] blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55E039] mb-3">
                All five. One subscription.
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4">
                Built to work together, priced to make sense.
              </h2>
              <p className="text-base sm:text-[17px] text-white/80 leading-relaxed">
                The scanner flags. The rewriter fixes. The audit trail logs.
                The library backs every flag with a source. The alerts keep
                you ahead of new enforcement. No per-tool pricing, no add-on
                tiers. $297/mo founding rate, 3 team seats, unlimited usage
                across every tool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Common questions
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              About the tools
            </h2>
          </div>
          <div className="space-y-3">
            {HUB_FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7"
              >
                <h3 className="text-[15px] sm:text-base font-semibold text-white mb-3">
                  {faq.q}
                </h3>
                <p className="text-sm sm:text-[15px] text-white/70 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-14">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Try the scanner first
          </h2>
          <p className="mt-4 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            The free demo runs the scanner on whatever content you paste.
            30 seconds to see exactly what the full platform does.
          </p>
          <div className="mt-8">
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all"
            >
              Try the Free Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
