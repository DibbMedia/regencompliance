import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Features",
  description:
    "AI-powered compliance scanning, rewriting, site monitoring, and 300+ FDA/FTC rules. Built for healthcare practices.",
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
