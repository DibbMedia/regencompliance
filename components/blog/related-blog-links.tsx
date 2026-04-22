import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"

export interface RelatedBlogPost {
  slug: string
  title: string
  excerpt: string
}

export function RelatedBlogLinks({
  posts,
  heading = "Further reading",
  subheading,
}: {
  posts: RelatedBlogPost[]
  heading?: string
  subheading?: string
}) {
  if (!posts || posts.length === 0) return null

  return (
    <section className="relative py-14">
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-4 w-4 text-[#55E039]/80" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]">
            {heading}
          </p>
        </div>
        {subheading && (
          <p className="text-sm text-white/65 mb-6 leading-relaxed max-w-2xl">
            {subheading}
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
            >
              <h3 className="text-base font-bold text-white leading-snug group-hover:text-[#55E039] transition-colors line-clamp-3">
                {p.title}
              </h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed line-clamp-3">
                {p.excerpt}
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
  )
}
