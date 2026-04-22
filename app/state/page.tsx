import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { STATES } from "@/lib/state/data"

const canonical = "https://compliance.regenportal.com/state"

export const metadata: Metadata = {
  title: "State-by-State Healthcare Marketing Compliance Rules - RegenCompliance",
  description:
    "State-specific compliance rules for healthcare marketing - medical board advertising rules, consumer protection authorities, and enforcement patterns across California, Texas, Florida, New York, and more.",
  keywords: [
    "state healthcare marketing rules",
    "state medical board advertising",
    "state AG healthcare enforcement",
    "state-specific medical compliance",
  ],
  alternates: { canonical },
  openGraph: {
    title: "State-by-State Healthcare Marketing Rules - RegenCompliance",
    description:
      "Deep-dive state guides on medical board rules, state AG consumer protection, and the marketing patterns under enforcement.",
    url: canonical,
    type: "website",
  },
}

export default function StateIndexPage() {
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
        item: canonical,
      },
    ],
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: STATES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://compliance.regenportal.com/state/${s.slug}`,
      name: `${s.state} healthcare marketing rules`,
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
            <MapPin className="h-3 w-3" />
            State-by-state
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            State-specific healthcare{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              marketing rules
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
            Federal FDA and FTC rules apply everywhere. But state medical boards and
            state AGs have their own rules, their own focus areas, and their own
            enforcement priorities. Start with your state.
          </p>
        </div>
      </section>

      {/* ============ STATE GRID ============ */}
      <section className="relative py-6">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STATES.map((s) => (
              <Link
                key={s.slug}
                href={`/state/${s.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 border border-[#55E039]/15 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-[#55E039]">
                      {s.abbreviation}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]/80">
                    State guide
                  </p>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-white leading-tight group-hover:text-[#55E039] transition-colors">
                  {s.state}
                </h2>
                <p className="mt-3 text-sm text-white/65 leading-relaxed line-clamp-3">
                  {s.heroTagline}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#55E039]">
                  Read {s.abbreviation} rules
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EXPLAINER ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4">
              More states coming
            </h2>
            <p className="text-base text-white/75 leading-relaxed mb-4">
              We start with the highest-enforcement states - California, Texas, Florida,
              New York - plus the next tier of heavily-regulated states. Additional states
              are added as our rule set's state-specific content expands. If your state
              isn't listed yet, federal rules still apply, and the most common
              state-level patterns (medical board advertising rules, state AG consumer
              protection, telehealth licensure) track similar structures across most
              states.
            </p>
            <p className="text-base text-white/75 leading-relaxed">
              For state-specific legal advice, you should always work with an attorney
              licensed in your state. These guides are summaries of general enforcement
              patterns, not legal opinions on your specific marketing.
            </p>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-14">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to scan your marketing?
          </h2>
          <p className="mt-4 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            RegenCompliance applies federal rules plus the most-enforced state patterns
            automatically. 30 seconds per scan, no law degree required.
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
