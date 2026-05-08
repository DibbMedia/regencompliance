import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CookieConsent } from "@/components/cookie-consent"
import { ImpersonationBanner } from "@/components/impersonation-banner"
import { headers } from "next/headers"
import { SITE_URL } from "@/lib/site-url"
import "./globals.css"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

const SOFTWARE_APPLICATION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RegenCompliance",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "297",
    priceCurrency: "USD",
    description: "Beta rate - $297/mo locked in for life",
  },
  description: "FDA/FTC compliance scanner for healthcare practices",
  url: SITE_URL,
})

const ORGANIZATION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RegenCompliance",
  alternateName: "RegenCompliance by Regen Portal LLC",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  description:
    "FDA/FTC compliance scanning software purpose-built for healthcare practices - regenerative medicine, med spas, weight loss, dental, aesthetic, and IV therapy clinics.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@regencompliance.ai",
    contactType: "customer support",
    availableLanguage: ["English"],
  },
  knowsAbout: [
    "FDA warning letters",
    "FTC Endorsement Guides",
    "healthcare marketing compliance",
    "structure-function claims",
    "HCT/P regulation",
    "state medical board advertising rules",
  ],
})

const WEBSITE_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RegenCompliance",
  url: SITE_URL,
  description:
    "FDA/FTC compliance scanning for healthcare marketing.",
  publisher: {
    "@type": "Organization",
    name: "RegenCompliance",
    url: SITE_URL,
  },
  inLanguage: "en-US",
})

export const metadata: Metadata = {
  title: {
    default: "RegenCompliance - FDA/FTC Compliance Scanner for Healthcare Marketing",
    template: "%s | RegenCompliance",
  },
  description:
    "Scan your marketing content against live FDA/FTC enforcement data. AI-powered compliance scoring and rewriting for healthcare practices.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "RegenCompliance",
    title: "RegenCompliance - FDA/FTC Compliance Scanner",
    description:
      "Scan your marketing content against live FDA/FTC enforcement data. AI-powered compliance scoring and rewriting for healthcare practices.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RegenCompliance - FDA/FTC Compliance Scanner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RegenCompliance - FDA/FTC Compliance Scanner",
    description:
      "Scan your marketing content against live FDA/FTC enforcement data.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
  colorScheme: "dark",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: SOFTWARE_APPLICATION_JSON }}
        />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ORGANIZATION_JSON }}
        />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: WEBSITE_JSON }}
        />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-poppins)]" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <ImpersonationBanner />
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster richColors position="top-right" />
          <CookieConsent />
          {/* Vercel Web Analytics: cookieless aggregate page-view counts. */}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
