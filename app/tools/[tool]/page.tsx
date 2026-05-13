import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ToolLayout } from "@/components/tools/tool-layout"
import { TOOLS, getToolBySlug, getRelatedTools } from "@/lib/tools/registry"
import { getPostsBySlugs } from "@/lib/blog/registry"
import { MARKETING_URL } from "@/lib/site-url"
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSoftwareApplicationSchema,
} from "@/lib/schema"

export async function generateStaticParams() {
  return TOOLS.map((t) => ({ tool: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>
}): Promise<Metadata> {
  const { tool } = await params
  const meta = getToolBySlug(tool)
  if (!meta) return { title: "Not found" }

  const canonical = `${MARKETING_URL}/tools/${meta.slug}`
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

export default async function ToolPage({
  params,
}: {
  params: Promise<{ tool: string }>
}) {
  const { tool } = await params
  const meta = getToolBySlug(tool)
  if (!meta) notFound()

  const related = getRelatedTools(tool)
  const relatedPosts = getPostsBySlugs(meta.relatedBlogSlugs)
  const canonical = `${MARKETING_URL}/tools/${meta.slug}`

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Tools", url: `${MARKETING_URL}/tools` },
    { name: meta.name, url: canonical },
  ])
  const faqSchema = meta.faqs.length ? buildFaqSchema(meta.faqs) : null
  const softwareSchema = buildSoftwareApplicationSchema({
    url: canonical,
    name: `RegenCompliance ${meta.name}`,
    description: meta.description,
  })

  return (
    <>
      <JsonLd
        schema={[
          softwareSchema,
          breadcrumbSchema,
          ...(faqSchema ? [faqSchema] : []),
        ]}
      />
      <ToolLayout meta={meta} related={related} relatedPosts={relatedPosts} />
    </>
  )
}
