import type { Metadata } from "next"
import { POSTS_SORTED } from "@/lib/blog/registry"
import { BlogIndex, POSTS_PER_PAGE } from "@/components/blog/blog-index"
import { MARKETING_URL } from "@/lib/site-url"
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildItemListSchema,
  organizationRef,
} from "@/lib/schema"

const canonical = `${MARKETING_URL}/blog`

export const metadata: Metadata = {
  title: "FDA & FTC Compliance Insights for Healthcare Marketing",
  description:
    "Plain-English breakdowns of FDA warning letters, FTC enforcement actions, and the marketing-claim lines every healthcare practice needs to know. Updated regularly.",
  alternates: { canonical },
  openGraph: {
    title: "RegenCompliance Blog - FDA & FTC Compliance Insights",
    description:
      "Plain-English breakdowns of FDA warning letters, FTC enforcement actions, and healthcare marketing compliance.",
    url: canonical,
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

  // Blog hub: emit a Blog node, a BreadcrumbList, and an ItemList of the
  // latest 10 posts shown on page 1 so search engines can discover them
  // without crawling pagination first.
  const latestForList = [featured, ...pagePosts].slice(0, 10)
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "RegenCompliance Blog",
    description:
      "FDA & FTC compliance insights for healthcare marketing. Plain-English breakdowns of warning letters and enforcement actions.",
    url: canonical,
    publisher: organizationRef(),
    inLanguage: "en-US",
  }
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Blog", url: canonical },
  ])
  const itemListSchema = buildItemListSchema(
    latestForList.map((p) => ({
      name: p.meta.title,
      url: `${MARKETING_URL}/blog/${p.meta.slug}`,
      description: p.meta.description,
    })),
  )

  return (
    <>
      <JsonLd schema={[blogSchema, breadcrumbSchema, itemListSchema]} />
      <BlogIndex
        featured={featured.meta}
        posts={pagePosts.map((p) => p.meta)}
        currentPage={1}
        totalPages={totalPages}
      />
    </>
  )
}
