import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { POSTS_SORTED } from "@/lib/blog/registry"
import { BlogIndex, POSTS_PER_PAGE } from "@/components/blog/blog-index"

// On page 1 we also render a featured post, so page-1 content excludes the
// first sorted post. Subsequent pages are straight 9-per-page slices of the
// non-featured list.
function getPaginatedList() {
  const [, ...rest] = POSTS_SORTED
  return rest
}

function totalPageCount() {
  const rest = getPaginatedList()
  return Math.max(1, Math.ceil(rest.length / POSTS_PER_PAGE))
}

export async function generateStaticParams() {
  const total = totalPageCount()
  // Page 1 is served from /blog; pages 2..N from /blog/page/[page]
  const params: Array<{ page: string }> = []
  for (let p = 2; p <= total; p++) {
    params.push({ page: String(p) })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const { page } = await params
  const pageNum = Number(page)
  const total = totalPageCount()
  if (!Number.isInteger(pageNum) || pageNum < 2 || pageNum > total) {
    return { title: "Not found" }
  }

  const canonical = `https://compliance.regenportal.com/blog/page/${pageNum}`
  return {
    title: `Blog — Page ${pageNum}`,
    description:
      "Plain-English breakdowns of FDA warning letters, FTC enforcement actions, and healthcare marketing compliance.",
    alternates: { canonical },
    openGraph: {
      title: `RegenCompliance Blog — Page ${pageNum}`,
      description:
        "Plain-English breakdowns of FDA warning letters, FTC enforcement actions, and healthcare marketing compliance.",
      url: canonical,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function BlogPaginatedPage({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const { page } = await params
  const pageNum = Number(page)
  const total = totalPageCount()

  if (!Number.isInteger(pageNum) || pageNum < 2 || pageNum > total) {
    notFound()
  }

  const rest = getPaginatedList()
  const startIndex = (pageNum - 1) * POSTS_PER_PAGE
  const pagePosts = rest.slice(startIndex, startIndex + POSTS_PER_PAGE)

  return (
    <BlogIndex
      posts={pagePosts.map((p) => p.meta)}
      currentPage={pageNum}
      totalPages={total}
    />
  )
}
