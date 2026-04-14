import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CookieConsent } from "@/components/cookie-consent"
import "./globals.css"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: {
    default: "RegenCompliance — FDA/FTC Compliance Scanner for Healthcare Marketing",
    template: "%s | RegenCompliance",
  },
  description:
    "Scan your marketing content against live FDA/FTC enforcement data. AI-powered compliance scoring and rewriting for healthcare practices.",
  metadataBase: new URL("https://compliance.regenportal.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://compliance.regenportal.com",
    siteName: "RegenCompliance",
    title: "RegenCompliance — FDA/FTC Compliance Scanner",
    description:
      "Scan your marketing content against live FDA/FTC enforcement data. AI-powered compliance scoring and rewriting for healthcare practices.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RegenCompliance — FDA/FTC Compliance Scanner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RegenCompliance — FDA/FTC Compliance Scanner",
    description:
      "Scan your marketing content against live FDA/FTC enforcement data.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://compliance.regenportal.com",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
              description:
                "FDA/FTC compliance scanner for healthcare practices",
              url: "https://compliance.regenportal.com",
            }),
          }}
        />
      </head>
      <body id="main-content" className="min-h-full flex flex-col font-[family-name:var(--font-poppins)]" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster richColors position="top-right" />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  )
}
