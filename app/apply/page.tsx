import type { Metadata } from "next"
import { MARKETING_URL } from "@/lib/site-url"
import { JsonLd, buildBreadcrumbSchema } from "@/lib/schema"
import { BetaApplyForm } from "./apply-form"

const TITLE = "Apply for the Founder Beta - RegenCompliance"
const DESCRIPTION =
  "Founder beta is capped at 25 clinics. $297/mo locked for life in exchange for active use, monthly Zoom check-ins, and feedback. Apply to claim a seat."
const canonical = `${MARKETING_URL}/apply`

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
  { name: "Apply for the founder beta", url: canonical },
])

export default function BetaApplyPage() {
  return (
    <>
      <JsonLd schema={[webPageSchema, breadcrumbSchema]} />
      <BetaApplyForm />
    </>
  )
}
