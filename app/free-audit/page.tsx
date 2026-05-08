import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site-url"
import { FreeAuditForm } from "./free-audit-form"

const TITLE = "Free FDA/FTC Compliance Audit - Scan Your Homepage in 30 Seconds"
const DESCRIPTION =
  "Drop in your clinic URL. We scan it against live FDA warning letters and FTC enforcement actions, surface every violation, and email the full report. No card required."
const canonical = `${SITE_URL}/free-audit`

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

export default function FreeAuditPage() {
  return <FreeAuditForm />
}
