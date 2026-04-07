import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Lock in $297/mo for life during beta. 25 founding member spots. Unlimited scans, full compliance library, 3 team seats.",
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
