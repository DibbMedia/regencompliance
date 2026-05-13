import type { Metadata } from "next"
import { MARKETING_URL } from "@/lib/site-url"
import { JsonLd, buildBreadcrumbSchema } from "@/lib/schema"
import { ContactForm } from "./contact-form"

const TITLE = "Contact RegenCompliance"
const DESCRIPTION =
  "Questions about FDA/FTC compliance, the founder beta, sales, or pricing - send us a note. 8am-5pm Eastern, Monday-Friday."
const canonical = `${MARKETING_URL}/contact`

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

// ContactPage. NO telephone field - the only published contact channel on
// the page is email + business hours, and Google's anti-fabrication policy
// forbids inventing a phone number.
const contactPageSchema = {
  "@context": "https://schema.org" as const,
  "@type": "ContactPage" as const,
  name: TITLE,
  description: DESCRIPTION,
  url: canonical,
  about: {
    "@type": "Organization",
    name: "RegenCompliance",
    url: MARKETING_URL,
  },
}
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Contact", url: canonical },
])

export default function ContactPage() {
  return (
    <>
      <JsonLd schema={[contactPageSchema, breadcrumbSchema]} />
      <ContactForm />
    </>
  )
}
