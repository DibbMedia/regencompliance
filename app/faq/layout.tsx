import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about RegenCompliance — pricing, data privacy, compliance scanning, and FDA/FTC enforcement monitoring.",
}

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
