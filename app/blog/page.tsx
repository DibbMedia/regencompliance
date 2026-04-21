import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Calendar, Clock } from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { POSTS_SORTED } from "@/lib/blog/registry"

export const metadata: Metadata = {
  title: "FDA & FTC Compliance Insights for Healthcare Marketing",
  description:
    "Plain-English breakdowns of FDA warning letters, FTC enforcement actions, and the marketing-claim lines every healthcare practice needs to know. Updated weekly.",
  alternates: { canonical: "https://compliance.regenportal.com/blog" },
  openGraph: {
    title: "RegenCompliance Blog — FDA & FTC Compliance Insights",
    description:
      "Plain-English breakdowns of FDA warning letters, FTC enforcement actions, and healthcare marketing compliance.",
    url: "https://compliance.regenportal.com/blog",
    type: "website",
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function BlogIndexPage() {
  const [featured, ...rest] = POSTS_SORTED

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <MarketingBg />
      <MarketingHeader />

      <main id="main-content" className="relative z-10">
        <header className="pt-32 pb-10 sm:pt-36">
          <div className="mx-auto max-w-5xl px-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55E039]">
              Insights
            </p>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              FDA &amp; FTC compliance insights for healthcare marketing
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/75 leading-relaxed">
              Plain-English breakdowns of the warning letters, settlements, and
              regulatory shifts that determine whether your marketing can survive
              contact with a regulator.
            </p>
          </div>
        </header>

        {featured && (
          <section className="pb-10">
            <div className="mx-auto max-w-5xl px-6">
              <Link
                href={`/blog/${featured.meta.slug}`}
                className="group block overflow-hidden rounded-3xl border border-[#55E039]/20 bg-gradient-to-br from-[#55E039]/[0.06] via-[#0a0a0a] to-[#0a0a0a] p-8 sm:p-10 transition-all hover:border-[#55E039]/40"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039]">
                    Featured
                  </span>
                  {featured.meta.heroLabel && (
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/55">
                      {featured.meta.heroLabel}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-[1.15] group-hover:text-[#55E039] transition-colors">
                  {featured.meta.title}
                </h2>
                <p className="mt-5 max-w-3xl text-base sm:text-lg text-white/75 leading-relaxed">
                  {featured.meta.excerpt}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/60">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-white/40" aria-hidden />
                    <time dateTime={featured.meta.date}>
                      {formatDate(featured.meta.date)}
                    </time>
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white/40" aria-hidden />
                    {featured.meta.readingMinutes} min read
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#55E039]">
                    Read article
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section className="pb-24">
            <div className="mx-auto max-w-5xl px-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {rest.map(({ meta }) => (
                  <Link
                    key={meta.slug}
                    href={`/blog/${meta.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 transition-all hover:border-[#55E039]/25 hover:bg-white/[0.06]"
                  >
                    {meta.heroLabel && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-3">
                        {meta.heroLabel}
                      </span>
                    )}
                    <h3 className="text-xl font-bold tracking-tight text-white leading-snug group-hover:text-[#55E039] transition-colors">
                      {meta.title}
                    </h3>
                    <p className="mt-4 text-[15px] text-white/70 leading-relaxed line-clamp-3">
                      {meta.excerpt}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/55">
                      <time dateTime={meta.date}>{formatDate(meta.date)}</time>
                      <span>&middot;</span>
                      <span>{meta.readingMinutes} min read</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="pb-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039] mb-3">
              Stay ahead of enforcement
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Scan your marketing before regulators do.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
              RegenCompliance checks every word of your clinic&apos;s marketing
              against live FDA and FTC enforcement data &mdash; and rewrites
              violations automatically.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3">
              <Link
                href="/demo"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-7 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all"
              >
                Try the free demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-7 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
              >
                See pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
