import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free Demo",
  description:
    "Try the RegenCompliance scanner free. Paste your marketing content and get instant FDA/FTC compliance scoring.",
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
