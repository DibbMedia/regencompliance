import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Features",
  description:
    "Unlimited compliance scans, AI-powered rewrites, 300+ rules, daily FDA/FTC updates, audit trails, and team collaboration.",
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
