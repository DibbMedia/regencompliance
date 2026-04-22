import type { Metadata } from "next"
import HowItWorksClient from "./how-it-works-client"

const canonical = "https://compliance.regenportal.com/how-it-works"

export const metadata: Metadata = {
  title: "How RegenCompliance Works - 6 Steps, Under 5 Minutes",
  description:
    "End-to-end walkthrough of how RegenCompliance scans, scores, and rewrites healthcare marketing content. Six steps from paste to audit-trail export.",
  keywords: [
    "how RegenCompliance works",
    "healthcare compliance scanner walkthrough",
    "FDA compliance tool demo",
    "healthcare marketing scanner how it works",
  ],
  alternates: { canonical },
  openGraph: {
    title: "How RegenCompliance Works",
    description:
      "Paste content, get a compliance score, accept compliant rewrites, export audit trail. Six steps, under five minutes.",
    url: canonical,
    type: "website",
  },
}

export default function HowItWorksPage() {
  return <HowItWorksClient />
}
