import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SpecialtyLayout } from "@/components/specialty/specialty-layout"
import {
  SPECIALTIES,
  getSpecialtyBySlug,
  getRelatedSpecialties,
} from "@/lib/specialty/registry"

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

  const canonical = `https://compliance.regenportal.com/for/${meta.slug}`
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
  const canonical = `https://compliance.regenportal.com/for/${meta.slug}`

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
        name: "For specialties",
        item: "https://compliance.regenportal.com/for",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `For ${meta.specialty}`,
        item: canonical,
      },
    ],
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `FDA/FTC Compliance Scanning for ${meta.specialty}`,
    description: meta.description,
    provider: {
      "@type": "Organization",
      name: "RegenCompliance",
      url: "https://compliance.regenportal.com",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    audience: {
      "@type": "Audience",
      audienceType: meta.specialtyLong,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <SpecialtyLayout meta={meta} related={related} />
    </>
  )
}
