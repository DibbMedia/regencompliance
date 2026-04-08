import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "FDA/FTC compliance scanner starting at $297/mo. Unlimited scans, AI rewrites, 300+ rules, weekly site monitoring for healthcare practices.",
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
