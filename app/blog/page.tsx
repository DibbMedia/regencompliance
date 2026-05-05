import type { Metadata } from "next"
import { POSTS_SORTED } from "@/lib/blog/registry"
import { BlogIndex, POSTS_PER_PAGE } from "@/components/blog/blog-index"
import { SITE_URL } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "FDA & FTC Compliance Insights for Healthcare Marketing",
  description:
    "Plain-English breakdowns of FDA warning letters, FTC enforcement actions, and the marketing-claim lines every healthcare practice needs to know. Updated regularly.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "RegenCompliance Blog - FDA & FTC Compliance Insights",
    description:
      "Plain-English breakdowns of FDA warning letters, FTC enforcement actions, and healthcare marketing compliance.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
}

export default function BlogPage1() {
  const [featured, ...rest] = POSTS_SORTED
  const pagePosts = rest.slice(0, POSTS_PER_PAGE)
  const totalPages = Math.max(
    1,
    Math.ceil(rest.length / POSTS_PER_PAGE),
  )

  return (
    <BlogIndex
      featured={featured.meta}
      posts={pagePosts.map((p) => p.meta)}
      currentPage={1}
      totalPages={totalPages}
    />
  )
}
