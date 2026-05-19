import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CookieConsent } from "@/components/cookie-consent"
import { ImpersonationBanner } from "@/components/impersonation-banner"
import { headers } from "next/headers"
import { MARKETING_URL } from "@/lib/site-url"
import {
  JsonLd,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/schema"
import "./globals.css"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

// Organization + WebSite are emitted from the root layout so every page
// inherits the brand entity. Per-page schemas (FAQPage, Article, Service,
// BreadcrumbList, etc.) are added by each page using the helpers in
// lib/schema.
const SITE_LEVEL_SCHEMAS = [
  buildOrganizationSchema(),
  buildWebSiteSchema(),
]

export const metadata: Metadata = {
  title: {
    default: "RegenCompliance - FDA/FTC Compliance Scanner for Healthcare Marketing",
    template: "%s | RegenCompliance",
  },
  description:
    "Scan your marketing content against live FDA/FTC enforcement data. AI-powered compliance scoring and rewriting for healthcare practices.",
  metadataBase: new URL(MARKETING_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: MARKETING_URL,
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
    canonical: MARKETING_URL,
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
        <JsonLd schema={SITE_LEVEL_SCHEMAS} nonce={nonce} />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-poppins)]" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
          nonce={nonce}
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
