import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CompareLayout } from "@/components/compare/compare-layout"
import {
  COMPETITORS,
  getCompetitorBySlug,
  getRelatedCompetitors,
} from "@/lib/compare/registry"
import { getPostsBySlugs } from "@/lib/blog/registry"
import { MARKETING_URL } from "@/lib/site-url"
import { JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/lib/schema"

export async function generateStaticParams() {
  return COMPETITORS.map((c) => ({ competitor: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>
}): Promise<Metadata> {
  const { competitor } = await params
  const meta = getCompetitorBySlug(competitor)
  if (!meta) return { title: "Not found" }

  const canonical = `${MARKETING_URL}/vs/${meta.slug}`
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
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  }
}

export default async function CompetitorPage({
  params,
}: {
  params: Promise<{ competitor: string }>
}) {
  const { competitor } = await params
  const meta = getCompetitorBySlug(competitor)
  if (!meta) notFound()

  const related = getRelatedCompetitors(competitor)
  const relatedPosts = getPostsBySlugs(meta.relatedBlogSlugs)
  const canonical = `${MARKETING_URL}/vs/${meta.slug}`

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Compare", url: `${MARKETING_URL}/compare` },
    { name: `vs ${meta.competitor}`, url: canonical },
  ])
  const faqSchema = meta.faqs.length ? buildFaqSchema(meta.faqs) : null
  const webPageSchema = {
    "@context": "https://schema.org" as const,
    "@type": "WebPage" as const,
    name: meta.title,
    description: meta.description,
    url: canonical,
  }

  return (
    <>
      <JsonLd
        schema={[
          webPageSchema,
          breadcrumbSchema,
          ...(faqSchema ? [faqSchema] : []),
        ]}
      />
      <CompareLayout meta={meta} related={related} relatedPosts={relatedPosts} />
    </>
  )
}
