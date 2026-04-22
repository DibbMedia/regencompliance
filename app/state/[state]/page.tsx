import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  ArrowLeft,
  MapPin,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Users,
} from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { STATES, getStateBySlug, getRelatedStates } from "@/lib/state/data"

export async function generateStaticParams() {
  return STATES.map((s) => ({ state: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>
}): Promise<Metadata> {
  const { state } = await params
  const meta = getStateBySlug(state)
  if (!meta) return { title: "Not found" }

  const canonical = `https://compliance.regenportal.com/state/${meta.slug}`
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      type: "website",
    },
  }
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>
}) {
  const { state } = await params
  const meta = getStateBySlug(state)
  if (!meta) notFound()

  const related = getRelatedStates(state)
  const canonical = `https://compliance.regenportal.com/state/${meta.slug}`

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
        name: "State rules",
        item: "https://compliance.regenportal.com/state",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: meta.state,
        item: canonical,
      },
    ],
  }

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: meta.title,
    description: meta.description,
    url: canonical,
    about: {
      "@type": "Place",
      name: meta.state,
      address: { "@type": "PostalAddress", addressRegion: meta.abbreviation, addressCountry: "US" },
    },
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <MarketingBg />
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-12 sm:pt-36">
        <div className="relative mx-auto max-w-4xl px-6">
          <Link
            href="/state"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#55E039] hover:text-[#6FF055] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All state rules
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039]">
            <MapPin className="h-3 w-3" />
            {meta.abbreviation} · State-specific rules
          </div>

          <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            Healthcare marketing compliance in{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              {meta.state}
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-white/80 leading-relaxed max-w-3xl">
            {meta.heroTagline}
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039] mb-3">
              State-level overview
            </p>
            <p className="text-base sm:text-[17px] text-white/80 leading-relaxed">
              {meta.intro}
            </p>
          </div>
        </div>
      </section>

      {/* ============ MEDICAL BOARD + AG ============ */}
      <section className="relative py-12">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[#55E039]" aria-hidden />
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  {meta.medicalBoardName}
                </h2>
              </div>
              <p className="text-sm sm:text-[15px] text-white/75 leading-relaxed">
                {meta.medicalBoardFocus}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#89E3E4]/10 border border-[#89E3E4]/20 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-[#89E3E4]" aria-hidden />
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  {meta.state} Attorney General
                </h2>
              </div>
              <p className="text-sm sm:text-[15px] text-white/75 leading-relaxed">
                {meta.stateAgFocus}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOCUS AREAS ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Enforcement focus
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What {meta.state} is actively enforcing
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {meta.focusAreas.map((fa) => (
              <div
                key={fa.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0 mt-1" aria-hidden />
                  <h3 className="text-lg font-bold text-white leading-snug">{fa.title}</h3>
                </div>
                <p className="text-sm text-white/70 leading-relaxed pl-8">{fa.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WATCH ITEMS ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Patterns we flag in {meta.state}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Specific marketing patterns under enforcement
            </h2>
          </div>
          <div className="space-y-3">
            {meta.watchItems.map((wi) => (
              <div
                key={wi.pattern}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
              >
                <p className="text-sm sm:text-[15px] font-semibold text-white mb-2">
                  {wi.pattern}
                </p>
                <p className="text-sm text-white/65 leading-relaxed">
                  <span className="text-white/80 font-medium">Why: </span>
                  {wi.why}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SPECIALTY CALLOUTS ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              By specialty
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Specialty-specific notes in {meta.state}
            </h2>
          </div>
          <div className="grid gap-3">
            {meta.specialtyCallouts.map((sc) => (
              <div
                key={sc}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <CheckCircle2 className="h-4 w-4 text-[#55E039] shrink-0 mt-1" aria-hidden />
                <span className="text-sm text-white/80 leading-relaxed">{sc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DISCLAIMER ============ */}
      <section className="relative py-10">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300 mb-2">
              Disclaimer
            </p>
            <p className="text-sm text-white/75 leading-relaxed">{meta.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#55E039]/[0.04] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#55E039]/[0.06] blur-[120px] rounded-full pointer-events-none" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Build compliance into every publish
          </h2>
          <p className="mt-5 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            RegenCompliance applies federal FDA and FTC rules plus the most-enforced
            state patterns automatically. {meta.state}-specific language is part of
            the rule set.
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
              href="/for"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-6 sm:px-8 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
            >
              See specialty pages
            </Link>
          </div>
        </div>
      </section>

      {/* ============ RELATED STATES ============ */}
      {related.length > 0 && (
        <section className="relative py-12">
          <div className="relative mx-auto max-w-5xl px-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]">
                Other state guides
              </p>
              <Link
                href="/state"
                className="text-xs font-semibold text-white/70 hover:text-white transition-colors flex items-center gap-1"
              >
                See all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/state/${r.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-[#55E039]/80" aria-hidden />
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]/80">
                      {r.abbreviation}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-[#55E039] transition-colors">
                    {r.state}
                  </h3>
                  <p className="mt-3 text-sm text-white/60 leading-relaxed line-clamp-3">
                    {r.heroTagline}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#55E039]">
                    Read state guide
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <MarketingFooter />
    </div>
  )
}
