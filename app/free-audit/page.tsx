import type { Metadata } from "next"
import { MARKETING_URL } from "@/lib/site-url"
import { JsonLd, buildBreadcrumbSchema } from "@/lib/schema"
import { FreeAuditForm } from "./free-audit-form"

const TITLE = "Free FDA/FTC Compliance Audit - Scan Your Homepage in 30 Seconds"
const DESCRIPTION =
  "Drop in your clinic URL. We scan it against live FDA warning letters and FTC enforcement actions, surface every violation, and email the full report. No card required."
const canonical = `${MARKETING_URL}/free-audit`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: canonical,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

const webPageSchema = {
  "@context": "https://schema.org" as const,
  "@type": "WebPage" as const,
  name: TITLE,
  description: DESCRIPTION,
  url: canonical,
}
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Free audit", url: canonical },
])

export default function FreeAuditPage() {
  return (
    <>
      <JsonLd schema={[webPageSchema, breadcrumbSchema]} />
      <FreeAuditForm />
    </>
  )
}
