import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site-url"
import { BetaApplyForm } from "./apply-form"

const TITLE = "Apply for the Founder Beta - RegenCompliance"
const DESCRIPTION =
  "Founder beta is capped at 25 clinics. $297/mo locked for life in exchange for active use, monthly Zoom check-ins, and feedback. Apply to claim a seat."
const canonical = `${SITE_URL}/apply`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: canonical,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function BetaApplyPage() {
  return <BetaApplyForm />
}
