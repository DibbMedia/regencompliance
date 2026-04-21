import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, Clock, Shield } from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { CheckoutButton } from "@/components/checkout-button"
import { IS_LAUNCHED } from "@/lib/env"
import type { BlogPostMeta } from "@/lib/blog/types"
import type { ReactNode } from "react"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function BlogPostLayout({
  meta,
  children,
  related,
}: {
  meta: BlogPostMeta
  children: ReactNode
  related?: Array<{ slug: string; title: string; excerpt: string }>
}) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <MarketingBg />
      <MarketingHeader />

      <main id="main-content" className="relative z-10">
        {/* Article header */}
        <header className="pt-32 pb-10 sm:pt-36">
          <div className="mx-auto max-w-3xl px-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#55E039] hover:text-[#6FF055] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All articles
            </Link>

            {meta.heroLabel && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039]">
                <Shield className="h-3 w-3" />
                {meta.heroLabel}
              </div>
            )}

            <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
              {meta.title}
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/75 leading-relaxed">
              {meta.excerpt}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/40" aria-hidden />
                <time dateTime={meta.date}>{formatDate(meta.date)}</time>
                {meta.updated && (
                  <span className="text-white/40">
                    &middot; Updated {formatDate(meta.updated)}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-white/40" aria-hidden />
                {meta.readingMinutes} min read
              </span>
              <span className="text-white/70">
                By {meta.author.name}
                {meta.author.role ? `, ${meta.author.role}` : ""}
              </span>
            </div>
          </div>
        </header>

        {/* Article body */}
        <article className="mx-auto max-w-3xl px-6 pb-16">
          {children}
        </article>

        {/* CTA strip */}
        <section className="relative py-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className="relative overflow-hidden rounded-3xl border border-[#55E039]/25 bg-gradient-to-br from-[#55E039]/[0.08] via-[#0a0a0a] to-[#0a0a0a] p-8 sm:p-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-[#55E039]/[0.12] blur-[80px] rounded-full pointer-events-none" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]">
                  Built for this exact problem
                </p>
                <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Scan your clinic&apos;s content before regulators do.
                </h2>
                <p className="mt-4 text-base sm:text-lg text-white/75 leading-relaxed max-w-xl">
                  RegenCompliance checks every word of your marketing against live FDA and FTC enforcement data &mdash; and rewrites violations automatically. A 30-second scan can save a $50,000&ndash;$5M regulatory response.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                  {IS_LAUNCHED ? (
                    <CheckoutButton className="inline-flex h-12 items-center justify-center sm:justify-start gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 sm:px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-70">
                      Start your free trial
                      <ArrowRight className="h-4 w-4" />
                    </CheckoutButton>
                  ) : (
                    <Link
                      href="/waitlist"
                      className="inline-flex h-12 items-center justify-center sm:justify-start gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 sm:px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer"
                    >
                      Join the waitlist
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  <Link
                    href="/demo"
                    className="inline-flex h-12 items-center justify-center sm:justify-start gap-2.5 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-6 sm:px-8 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
                  >
                    Try the free demo
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related posts */}
        {related && related.length > 0 && (
          <section className="py-14">
            <div className="mx-auto max-w-5xl px-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039] mb-6">
                Keep reading
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
                  >
                    <h3 className="text-base font-bold text-white leading-snug group-hover:text-[#55E039] transition-colors">
                      {r.title}
                    </h3>
                    <p className="mt-3 text-sm text-white/65 leading-relaxed line-clamp-3">
                      {r.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#55E039]">
                      Read article
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <MarketingFooter />
    </div>
  )
}
