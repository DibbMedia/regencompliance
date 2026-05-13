import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SpecialtyLayout } from "@/components/specialty/specialty-layout"
import {
  SPECIALTIES,
  getSpecialtyBySlug,
  getRelatedSpecialties,
} from "@/lib/specialty/registry"
import { getPostsBySlugs } from "@/lib/blog/registry"
import { MARKETING_URL } from "@/lib/site-url"
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  organizationRef,
} from "@/lib/schema"

export async function generateStaticParams() {
  return SPECIALTIES.map((s) => ({ specialty: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string }>
}): Promise<Metadata> {
  const { specialty } = await params
  const meta = getSpecialtyBySlug(specialty)
  if (!meta) return { title: "Not found" }

  const canonical = `${MARKETING_URL}/for/${meta.slug}`
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

export default async function SpecialtyPage({
  params,
}: {
  params: Promise<{ specialty: string }>
}) {
  const { specialty } = await params
  const meta = getSpecialtyBySlug(specialty)
  if (!meta) notFound()

  const related = getRelatedSpecialties(specialty)
  const relatedPosts = getPostsBySlugs(meta.relatedBlogSlugs)
  const canonical = `${MARKETING_URL}/for/${meta.slug}`

  const faqSchema = meta.faqs.length ? buildFaqSchema(meta.faqs) : null

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "For specialties", url: `${MARKETING_URL}/for` },
    { name: `For ${meta.specialty}`, url: canonical },
  ])

  const serviceSchema = {
    "@context": "https://schema.org" as const,
    "@type": "Service" as const,
    name: `FDA/FTC Compliance Scanning for ${meta.specialty}`,
    description: meta.description,
    url: canonical,
    provider: organizationRef(),
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    audience: {
      "@type": "Audience",
      audienceType: meta.specialtyLong,
    },
  }

  const schemas = [breadcrumbSchema, serviceSchema, ...(faqSchema ? [faqSchema] : [])]

  return (
    <>
      <JsonLd schema={schemas} />
      <SpecialtyLayout meta={meta} related={related} relatedPosts={relatedPosts} />
    </>
  )
}
