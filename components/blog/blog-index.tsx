import Link from "next/link"
import { ArrowRight, Calendar, Clock, ArrowLeft } from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import type { BlogPostMeta } from "@/lib/blog/types"

export const POSTS_PER_PAGE = 9

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function BlogCard({ meta }: { meta: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${meta.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 transition-all hover:border-[#55E039]/25 hover:bg-white/[0.06]"
    >
      {meta.heroLabel && (
        <span className="inline-flex self-start items-center gap-1.5 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-4">
          {meta.heroLabel}
        </span>
      )}
      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug group-hover:text-[#55E039] transition-colors line-clamp-3">
        {meta.title}
      </h3>
      <p className="mt-4 text-sm sm:text-[15px] text-white/65 leading-relaxed line-clamp-3 flex-1">
        {meta.excerpt}
      </p>
      <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-center justify-between gap-3 text-xs text-white/55">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <time dateTime={meta.date} className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-white/40" aria-hidden />
            {formatDate(meta.date)}
          </time>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-white/40" aria-hidden />
            {meta.readingMinutes} min
          </span>
        </div>
        <span className="inline-flex items-center gap-1 font-semibold text-[#55E039] opacity-0 group-hover:opacity-100 transition-opacity">
          Read
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}

function FeaturedCard({ meta }: { meta: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${meta.slug}`}
      className="group block overflow-hidden rounded-3xl border border-[#55E039]/25 bg-gradient-to-br from-[#55E039]/[0.08] via-[#0a0a0a] to-[#0a0a0a] p-8 sm:p-10 transition-all hover:border-[#55E039]/50 relative"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#55E039]/[0.08] blur-[80px] rounded-full pointer-events-none" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.10] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039]">
            Featured
          </span>
          {meta.heroLabel && (
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/60">
              {meta.heroLabel}
            </span>
          )}
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-[1.15] group-hover:text-[#55E039] transition-colors">
          {meta.title}
        </h2>
        <p className="mt-5 max-w-3xl text-base sm:text-lg text-white/80 leading-relaxed">
          {meta.excerpt}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/65">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-white/40" aria-hidden />
            <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/40" aria-hidden />
            {meta.readingMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#55E039]">
            Read article
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  if (totalPages <= 1) return null

  const pageHref = (n: number) => (n === 1 ? "/blog" : `/blog/page/${n}`)

  const pageNumbers: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  return (
    <nav
      aria-label="Blog pagination"
      className="mt-14 flex items-center justify-center gap-2"
    >
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white/80 hover:text-white hover:border-[#55E039]/25 hover:bg-[#55E039]/[0.06] transition-all"
          aria-label="Previous page"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span
          aria-hidden
          className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.01] px-4 text-sm font-semibold text-white/25 cursor-not-allowed"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      <div className="flex items-center gap-1.5">
        {pageNumbers.map((n) => {
          const isActive = n === currentPage
          return (
            <Link
              key={n}
              href={pageHref(n)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${n}`}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? "bg-gradient-to-br from-[#55E039] to-[#3BB82A] text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)]"
                  : "border border-white/10 bg-white/[0.03] text-white/75 hover:text-white hover:border-[#55E039]/25 hover:bg-[#55E039]/[0.06]"
              }`}
            >
              {n}
            </Link>
          )
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white/80 hover:text-white hover:border-[#55E039]/25 hover:bg-[#55E039]/[0.06] transition-all"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span
          aria-hidden
          className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.01] px-4 text-sm font-semibold text-white/25 cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      )}
    </nav>
  )
}

export function BlogIndex({
  posts,
  currentPage,
  totalPages,
  featured,
}: {
  posts: BlogPostMeta[]
  currentPage: number
  totalPages: number
  featured?: BlogPostMeta
}) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <MarketingBg />
      <MarketingHeader />

      <main id="main-content" className="relative z-10">
        <header className="pt-32 pb-10 sm:pt-36">
          <div className="mx-auto max-w-6xl px-6">
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
            {currentPage > 1 && (
              <p className="mt-5 text-sm text-white/55">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
        </header>

        {featured && (
          <section className="pb-10">
            <div className="mx-auto max-w-6xl px-6">
              <FeaturedCard meta={featured} />
            </div>
          </section>
        )}

        {posts.length > 0 && (
          <section className="pb-10">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((meta) => (
                  <BlogCard key={meta.slug} meta={meta} />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          </section>
        )}

        <section className="py-16">
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
