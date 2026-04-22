import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Scale, TrendingUp, ShieldCheck, Zap } from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { COMPETITORS } from "@/lib/compare/registry"

const canonical = "https://compliance.regenportal.com/compare"

export const metadata: Metadata = {
  title: "Healthcare Marketing Compliance Tools Compared — RegenCompliance vs Alternatives",
  description:
    "Honest head-to-head comparisons of RegenCompliance vs ChatGPT, Jasper, Grammarly, Copy.ai, healthcare marketing attorneys, and manual agency audits. When to use which, and why.",
  keywords: [
    "healthcare compliance tool comparison",
    "RegenCompliance alternatives",
    "FDA compliance software comparison",
    "healthcare marketing AI comparison",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Healthcare Marketing Compliance Tools Compared — RegenCompliance vs Alternatives",
    description:
      "Honest head-to-head comparisons of RegenCompliance vs every alternative — AI writers, grammar tools, attorneys, and manual audits. When to use which.",
    url: canonical,
    type: "website",
  },
}

export default function ComparePage() {
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
        name: "Compare",
        item: canonical,
      },
    ],
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: COMPETITORS.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://compliance.regenportal.com/vs/${c.slug}`,
      name: `RegenCompliance vs ${c.competitor}`,
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
      <MarketingBg />
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-14 sm:pt-36">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-6">
            <Scale className="h-3 w-3" />
            Head-to-head comparisons
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            How RegenCompliance compares to{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              every alternative
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
            AI writing assistants, grammar tools, healthcare marketing attorneys, and manual
            agency audits. Honest breakdowns — where each one wins, where RegenCompliance
            wins, and when you actually need both.
          </p>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="relative pb-8">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 mb-3">
                <Zap className="h-5 w-5 text-[#55E039]" aria-hidden />
              </div>
              <p className="text-sm font-bold text-white mb-2">AI writing tools</p>
              <p className="text-xs text-white/60 leading-relaxed">
                ChatGPT, Jasper, Copy.ai — great for drafting, not a compliance check.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 mb-3">
                <ShieldCheck className="h-5 w-5 text-[#55E039]" aria-hidden />
              </div>
              <p className="text-sm font-bold text-white mb-2">Grammar & style tools</p>
              <p className="text-xs text-white/60 leading-relaxed">
                Grammarly catches grammar. It does not catch FDA/FTC violations.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 mb-3">
                <Scale className="h-5 w-5 text-[#55E039]" aria-hidden />
              </div>
              <p className="text-sm font-bold text-white mb-2">Legal & consulting</p>
              <p className="text-xs text-white/60 leading-relaxed">
                Attorneys and agency auditors handle judgment calls. Software handles scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMPARISON CARDS ============ */}
      <section className="relative py-14">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Pick a comparison
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Every alternative, compared honestly
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {COMPETITORS.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]/80">
                    {c.categoryLabel}
                  </p>
                  <TrendingUp className="h-4 w-4 text-[#55E039]/60 group-hover:text-[#55E039] transition-colors" aria-hidden />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-white leading-tight group-hover:text-[#55E039] transition-colors">
                  vs {c.competitor}
                </h3>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  {c.shortVerdict}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#55E039]">
                  Read comparison
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-14">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Want to skip the comparisons?
          </h2>
          <p className="mt-4 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            Try the free demo scanner. Paste any marketing copy, see the compliance report
            in 30 seconds. No card required.
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
