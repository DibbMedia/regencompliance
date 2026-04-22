import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ToolLayout } from "@/components/tools/tool-layout"
import { TOOLS, getToolBySlug, getRelatedTools } from "@/lib/tools/registry"

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

  const canonical = `https://compliance.regenportal.com/tools/${meta.slug}`
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
  const canonical = `https://compliance.regenportal.com/tools/${meta.slug}`

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: meta.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

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
        name: "Tools",
        item: "https://compliance.regenportal.com/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: meta.name,
        item: canonical,
      },
    ],
  }

  const softwareFeatureSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: meta.title,
    description: meta.description,
    url: canonical,
    about: {
      "@type": "SoftwareApplication",
      name: `RegenCompliance ${meta.name}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareFeatureSchema) }}
      />
      <ToolLayout meta={meta} related={related} />
    </>
  )
}
