import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CompareLayout } from "@/components/compare/compare-layout"
import {
  COMPETITORS,
  getCompetitorBySlug,
  getRelatedCompetitors,
} from "@/lib/compare/registry"

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

  const canonical = `https://compliance.regenportal.com/vs/${meta.slug}`
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
  const canonical = `https://compliance.regenportal.com/vs/${meta.slug}`

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
        name: "Compare",
        item: "https://compliance.regenportal.com/compare",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `vs ${meta.competitor}`,
        item: canonical,
      },
    ],
  }

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: meta.title,
    description: meta.description,
    url: canonical,
    about: {
      "@type": "SoftwareApplication",
      name: "RegenCompliance",
      applicationCategory: "BusinessApplication",
    },
    mainEntity: {
      "@type": "Product",
      name: `RegenCompliance vs ${meta.competitor}`,
      description: meta.description,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <CompareLayout meta={meta} related={related} />
    </>
  )
}
