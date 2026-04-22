import type { Metadata } from "next"
import SecurityClient from "./security-client"

const canonical = "https://compliance.regenportal.com/security"

export const metadata: Metadata = {
  title: "Security &amp; Data Handling - RegenCompliance",
  description:
    "How RegenCompliance handles your data - zero patient data, no AI training on customer content, encryption, access controls, audit trails, and the full infrastructure stack.",
  keywords: [
    "RegenCompliance security",
    "healthcare compliance software security",
    "HIPAA healthcare compliance tool",
    "AI no training customer data",
    "compliance software data handling",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Security &amp; Data Handling - RegenCompliance",
    description:
      "Six commitments, full policy detail, infrastructure stack, and a FAQ. Healthcare practices ask about data handling first; here are the answers.",
    url: canonical,
    type: "website",
  },
}

export default function SecurityPage() {
  return <SecurityClient />
}
