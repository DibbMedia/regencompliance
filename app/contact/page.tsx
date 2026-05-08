import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site-url"
import { ContactForm } from "./contact-form"

const TITLE = "Contact RegenCompliance"
const DESCRIPTION =
  "Questions about FDA/FTC compliance, the founder beta, sales, or pricing - send us a note. 8am-5pm Eastern, Monday-Friday."
const canonical = `${SITE_URL}/contact`

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

export default function ContactPage() {
  return <ContactForm />
}
