import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import {
  GLOSSARY,
  TERMS_BY_CATEGORY,
  type GlossaryTerm,
} from "@/lib/glossary/terms"

const canonical = "https://compliance.regenportal.com/glossary"

export const metadata: Metadata = {
  title:
    "Healthcare Marketing Compliance Glossary - FDA, FTC, and State Regulatory Terms",
  description:
    "Plain-English definitions of the terms that shape FDA and FTC enforcement against healthcare practices. Warning letters, structure-function claims, HCT/P, material connections, typical-experience disclosures, and more.",
  keywords: [
    "FDA compliance glossary",
    "FTC healthcare glossary",
    "healthcare marketing terms",
    "FDA warning letter definition",
    "structure-function claim definition",
    "HCT/P definition",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Healthcare Marketing Compliance Glossary - RegenCompliance",
    description:
      "Plain-English definitions of FDA, FTC, state medical board, and device regulatory terms. 28+ terms every healthcare marketer should know.",
    url: canonical,
    type: "website",
  },
}

const CATEGORY_ORDER: Array<GlossaryTerm["category"]> = [
  "FDA",
  "FTC",
  "Device",
  "State",
  "General",
]

const CATEGORY_LABELS: Record<GlossaryTerm["category"], string> = {
  FDA: "FDA terms",
  FTC: "FTC terms",
  Device: "FDA device terms",
  State: "State regulatory terms",
  General: "General regulatory terms",
}

export default function GlossaryPage() {
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
        name: "Glossary",
        item: canonical,
      },
    ],
  }

  const definedTermSet = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Healthcare Marketing Compliance Glossary",
    description:
      "Definitions of FDA, FTC, device, and state regulatory terms relevant to healthcare marketing compliance.",
    url: canonical,
    hasDefinedTerm: GLOSSARY.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${canonical}#${t.slug}`,
      name: t.term,
      description: t.shortDefinition,
      url: `${canonical}#${t.slug}`,
      inDefinedTermSet: canonical,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSet) }}
      />
      <MarketingBg />
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-14 sm:pt-36">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-6">
            <BookOpen className="h-3 w-3" />
            Regulatory glossary
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            The{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              healthcare compliance
            </span>{" "}
            glossary
          </h1>
          <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
            Plain-English definitions of the terms that actually show up in FDA warning
            letters, FTC enforcement actions, and state medical board discipline. {GLOSSARY.length}+
            terms every healthcare marketing team should know.
          </p>
        </div>
      </section>

      {/* ============ CATEGORY NAV ============ */}
      <section className="relative py-6">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039] mb-4">
              Jump to category
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ORDER.map((cat) => (
                <a
                  key={cat}
                  href={`#cat-${cat.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:border-[#55E039]/30 hover:bg-[#55E039]/[0.06] transition-all"
                >
                  {CATEGORY_LABELS[cat]}
                  <span className="text-[10px] text-white/50">
                    {TERMS_BY_CATEGORY[cat].length}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TERMS BY CATEGORY ============ */}
      {CATEGORY_ORDER.map((cat) => {
        const terms = TERMS_BY_CATEGORY[cat]
        if (terms.length === 0) return null
        return (
          <section
            key={cat}
            id={`cat-${cat.toLowerCase()}`}
            className="relative py-12 scroll-mt-24"
          >
            <div className="relative mx-auto max-w-4xl px-6">
              <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-white/10">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]/80">
                  {terms.length} terms
                </span>
              </div>
              <div className="space-y-4">
                {terms.map((t) => (
                  <article
                    key={t.slug}
                    id={t.slug}
                    className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 hover:bg-white/[0.04] transition-all"
                  >
                    <header className="flex items-baseline justify-between gap-4 flex-wrap mb-3">
                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                        {t.term}
                      </h3>
                      <a
                        href={`#${t.slug}`}
                        className="text-[11px] font-semibold text-[#55E039]/70 hover:text-[#55E039] transition-colors"
                        aria-label={`Permalink to ${t.term}`}
                      >
                        #
                      </a>
                    </header>
                    <p className="text-base text-white/85 leading-relaxed font-medium">
                      {t.shortDefinition}
                    </p>
                    <div className="mt-5 pt-5 border-t border-white/[0.06]">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]/80 mb-2">
                        In depth
                      </p>
                      <p className="text-sm text-white/75 leading-relaxed">
                        {t.fullDefinition}
                      </p>
                    </div>
                    <div className="mt-5 pt-5 border-t border-white/[0.06]">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]/80 mb-2">
                        Why this matters for marketing
                      </p>
                      <p className="text-sm text-white/75 leading-relaxed">
                        {t.whyItMatters}
                      </p>
                    </div>
                    {t.example && (
                      <div className="mt-5 pt-5 border-t border-white/[0.06]">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]/80 mb-2">
                          Example
                        </p>
                        <p className="text-sm text-white/70 leading-relaxed italic">
                          {t.example}
                        </p>
                      </div>
                    )}
                    {t.relatedTerms && t.relatedTerms.length > 0 && (
                      <div className="mt-5 pt-5 border-t border-white/[0.06]">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]/80 mb-3">
                          Related
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {t.relatedTerms.map((rt) => {
                            const relatedEntry = GLOSSARY.find((g) => g.slug === rt)
                            if (!relatedEntry) return null
                            return (
                              <a
                                key={rt}
                                href={`#${rt}`}
                                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-white/75 hover:text-white hover:border-[#55E039]/30 transition-all"
                              >
                                {relatedEntry.term}
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* ============ CTA ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to stop memorizing rules?
          </h2>
          <p className="mt-4 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            RegenCompliance applies every rule in this glossary automatically to every
            piece of content you scan. 30 seconds, not a law degree.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 sm:px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all"
            >
              Try the Free Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-6 sm:px-8 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
            >
              Read the blog
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
