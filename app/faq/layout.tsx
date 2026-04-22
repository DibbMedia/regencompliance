import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about RegenCompliance - FDA/FTC compliance scanning for healthcare practices including med spas, dental, dermatology, and regenerative medicine.",
}

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
