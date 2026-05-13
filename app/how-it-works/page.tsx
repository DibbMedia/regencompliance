import type { Metadata } from "next"
import HowItWorksClient from "./how-it-works-client"
import { MARKETING_URL } from "@/lib/site-url"
import { JsonLd, buildBreadcrumbSchema } from "@/lib/schema"

const canonical = `${MARKETING_URL}/how-it-works`

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

// HowTo step list mirrors the steps rendered by HowItWorksClient. Keep in
// sync with the STEPS constant in how-it-works-client.tsx.
const HOW_TO_STEPS = [
  {
    name: "Paste your marketing content",
    text: "Website copy, social post, ad creative, email, call script, blog post. Paste, upload a file, or enter a URL.",
  },
  {
    name: "AI scans against live enforcement data",
    text: "Content runs through our rule engine comparing against 300+ patterns sourced from real FDA warning letters and FTC enforcement actions.",
  },
  {
    name: "Score and flags returned in 30 seconds",
    text: "A 0-100 compliance score plus every flagged phrase highlighted in context, with risk level, rule source, and compliant alternative.",
  },
  {
    name: "Accept compliant rewrites",
    text: "Each flag surfaces 2-3 compliant alternatives. Accept, modify, or write your own. The scanner rechecks to confirm the flag is resolved.",
  },
  {
    name: "Audit trail captures everything",
    text: "Every scan is permanently logged with timestamp, user, content, score, flags, and decisions. Exportable as PDF for legal files.",
  },
  {
    name: "Stay ahead of new enforcement",
    text: "Real-time alerts when FDA, FTC, or state enforcement actions affect your specialty.",
  },
]

const howToSchema = {
  "@context": "https://schema.org" as const,
  "@type": "HowTo" as const,
  name: "How to scan healthcare marketing for FDA/FTC compliance with RegenCompliance",
  description:
    "Six-step walkthrough of scanning, scoring, rewriting, and auditing healthcare marketing content with RegenCompliance.",
  totalTime: "PT5M",
  url: canonical,
  step: HOW_TO_STEPS.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
    url: `${canonical}#step-${i + 1}`,
  })),
}
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "How it works", url: canonical },
])

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd schema={[howToSchema, breadcrumbSchema]} />
      <HowItWorksClient />
    </>
  )
}
