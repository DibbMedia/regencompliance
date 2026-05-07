import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FlaskConical,
  Megaphone,
  Cpu,
  MapPin,
  Lightbulb,
} from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import {
  GLOSSARY,
  TERMS_BY_CATEGORY,
  type GlossaryTerm,
} from "@/lib/glossary/terms"
import { SITE_URL } from "@/lib/site-url"
import { TermCard } from "./term-card"

const canonical = `${SITE_URL}/glossary`

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

const CATEGORY_ICONS: Record<
  GlossaryTerm["category"],
  typeof FlaskConical
> = {
  FDA: FlaskConical,
  FTC: Megaphone,
  Device: Cpu,
  State: MapPin,
  General: BookOpen,
}

const CATEGORY_INTROS: Record<GlossaryTerm["category"], string> = {
  FDA: "The FDA regulates what you can claim a treatment does. Wrong claim category = warning letter.",
  FTC: "The FTC governs how you advertise - testimonials, endorsements, and disclosures must hold up under deception review.",
  Device:
    "Cleared and approved are not the same thing. Mixing the two on a device page is the fastest aesthetic-industry warning letter.",
  State:
    "State medical boards can suspend a license faster than the FDA can finish a warning letter. Their advertising rules are often stricter than federal.",
  General:
    "Cross-cutting rules - HIPAA marketing, cease-and-desist letters, and the legal mechanics that touch every other category.",
}

interface TakeawayBreak {
  afterIndex: number
  text: string
}

const CATEGORY_TAKEAWAYS: Record<GlossaryTerm["category"], TakeawayBreak[]> = {
  FDA: [
    {
      afterIndex: 3,
      text: "If you claim a product treats, cures, or prevents a condition, you are making a disease claim - which legally turns the product into a drug requiring FDA approval before you can market it.",
    },
    {
      afterIndex: 9,
      text: "Warning letters, untitled letters, and Form 483s all start the same way: a regulator notices marketing language that misbrands or adulterates a product. The fastest fix is fixing the words on the page.",
    },
    {
      afterIndex: 14,
      text: "For HCT/P-based regen practices, the 361 pathway depends on minimal manipulation and homologous use. Marketing that describes advanced processing or non-native uses can quietly push the product into the 351 (drug) pathway.",
    },
  ],
  FTC: [
    {
      afterIndex: 3,
      text: "Any compensated, gifted, or even loaned-product relationship between you and an endorser must be disclosed clearly and conspicuously - and any testimonial that does not reflect typical results needs a typical-experience disclosure.",
    },
  ],
  Device: [],
  State: [],
  General: [],
}

function CategoryDivider({
  category,
}: {
  category: GlossaryTerm["category"]
}) {
  return (
    <div className="relative mx-auto max-w-4xl px-6 py-12">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#55E039]/25 to-transparent" />
      <p className="mt-7 text-center text-sm sm:text-base text-white/65 italic max-w-2xl mx-auto leading-relaxed">
        {CATEGORY_INTROS[category]}
      </p>
    </div>
  )
}

function KeyTakeaway({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-[#55E039]/20 bg-[#55E039]/[0.04] p-5 sm:p-6 flex gap-4 items-start">
      <div className="shrink-0 mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#55E039]/15 text-[#55E039]">
        <Lightbulb className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-1.5">
          Key takeaway
        </p>
        <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  )
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
        item: `${SITE_URL}`,
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
            The {GLOSSARY.length}+ terms that show up in FDA warning letters, FTC actions,
            and state board discipline - in plain English.
          </p>
        </div>
      </section>

      {/* ============ CATEGORY NAV ============ */}
      <section className="relative py-6">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039] mb-4">
              Jump to category
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ORDER.map((cat) => {
                const Icon = CATEGORY_ICONS[cat]
                return (
                  <a
                    key={cat}
                    href={`#cat-${cat.toLowerCase()}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:border-[#55E039]/30 hover:bg-[#55E039]/[0.06] transition-all"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#55E039]/80" />
                    {CATEGORY_LABELS[cat]}
                    <span className="text-[10px] text-white/50">
                      {TERMS_BY_CATEGORY[cat].length}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TERMS BY CATEGORY ============ */}
      {CATEGORY_ORDER.map((cat, catIndex) => {
        const terms = TERMS_BY_CATEGORY[cat]
        if (terms.length === 0) return null
        const Icon = CATEGORY_ICONS[cat]
        const takeaways = CATEGORY_TAKEAWAYS[cat]
        return (
          <div key={cat}>
            {catIndex > 0 && <CategoryDivider category={cat} />}
            {catIndex === 0 && (
              <div className="relative mx-auto max-w-4xl px-6 pt-6 pb-2">
                <p className="text-center text-sm sm:text-base text-white/65 italic max-w-2xl mx-auto leading-relaxed">
                  {CATEGORY_INTROS[cat]}
                </p>
              </div>
            )}
            <section
              id={`cat-${cat.toLowerCase()}`}
              className="relative py-12 scroll-mt-24"
            >
              <div className="relative mx-auto max-w-4xl px-6">
                <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-white/10">
                  <h2 className="flex items-center gap-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                    <Icon className="h-7 w-7 text-[#55E039]/80 shrink-0" />
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]/80">
                    {terms.length} terms
                  </span>
                </div>
                <div className="space-y-4">
                  {terms.map((t, termIndex) => {
                    const relatedTermNames = (t.relatedTerms ?? [])
                      .map((rtSlug) => {
                        const entry = GLOSSARY.find((g) => g.slug === rtSlug)
                        return entry
                          ? { slug: entry.slug, term: entry.term }
                          : null
                      })
                      .filter(
                        (x): x is { slug: string; term: string } => x !== null,
                      )
                    const breakAfter = takeaways.find(
                      (b) => b.afterIndex === termIndex,
                    )
                    return (
                      <div key={t.slug} className="space-y-4">
                        <TermCard term={t} relatedTermNames={relatedTermNames} />
                        {breakAfter && <KeyTakeaway text={breakAfter.text} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          </div>
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
