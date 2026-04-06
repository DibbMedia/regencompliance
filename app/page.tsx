import Link from "next/link"
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Scan,
  Pencil,
  BookOpen,
  Clock,
  Users,
  Bell,
  FileText,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

const features = [
  { icon: Scan, title: "Live Compliance Scanner", desc: "Paste any content, get instant FDA/FTC compliance scoring" },
  { icon: Pencil, title: "One-Click AI Rewriter", desc: "Automatically rewrite flagged content to be compliant" },
  { icon: BookOpen, title: "Compliance Library (300+ rules)", desc: "Browse every FDA/FTC-flagged phrase with compliant alternatives" },
  { icon: Bell, title: "Daily Rule Updates", desc: "Cron scrapes FDA/FTC sites every morning for new enforcement actions" },
  { icon: Clock, title: "Full Scan History + PDF Export", desc: "Review every scan, download compliance reports for your records" },
  { icon: Users, title: "3 Team Seats Included", desc: "Invite your marketing staff and front desk to scan independently" },
]

const libraryExamples = [
  { banned: "heals", alternative: "may support healing in some patients", risk: "HIGH" },
  { banned: "FDA-approved stem cells", alternative: "performed in an FDA-registered facility", risk: "HIGH" },
  { banned: "cures arthritis", alternative: "some patients report reduced joint discomfort", risk: "MEDIUM" },
  { banned: "proven to reverse aging", alternative: "patients report feeling more youthful and energetic", risk: "HIGH" },
]

const checklist = [
  "Unlimited compliance scans (up to 100/day)",
  "AI-powered compliant rewrites (up to 100/day)",
  "Full compliance library (300+ rules)",
  "Daily FDA/FTC rule updates",
  "Complete scan history + PDF export",
  "In-app enforcement action alerts",
  "3 team seats included",
  "Light & dark mode",
]

const faqs = [
  {
    q: "Is this actual legal advice?",
    a: "No. RegenCompliance is an educational tool only. We strongly recommend having all final content reviewed by a qualified healthcare marketing attorney.",
  },
  {
    q: "Does this access patient data?",
    a: "Never. RegenCompliance is a text analysis tool only. No PHI, no patient records, no HIPAA requirements.",
  },
  {
    q: "How often are rules updated?",
    a: "Daily. Our automated scraper checks FDA and FTC enforcement pages every morning and adds new rules automatically.",
  },
  {
    q: "Who is this for?",
    a: "Regenerative medicine clinics offering PRP, stem cell therapy, exosomes, BMAC, Wharton's jelly, prolotherapy, and peptide therapy.",
  },
  {
    q: "What happens if I cancel?",
    a: "You keep access until the end of your billing period. No contracts, no penalties. Resubscribe anytime.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">RegenCompliance</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Log In
            </Link>
            <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
              Start Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          One compliance violation can{" "}
          <span className="text-destructive">shut down your clinic.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          RegenCompliance scans your marketing content against live FDA/FTC guidelines — before you
          publish. Built exclusively for regenerative medicine clinics.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            Start for $497/month
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <a href="#how-it-works" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            See How It Works
          </a>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="h-4 w-4" /> No HIPAA data ever
          </span>
          <span className="flex items-center gap-1">
            <Bell className="h-4 w-4" /> Rules updated daily
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> Built for regen medicine
          </span>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold">The FDA and FTC are watching.</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-destructive">200+</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  enforcement letters issued by FDA in 2024 — the highest in nearly 25 years
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-destructive">$5.15M</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  settlement — what deceptive stem cell marketing cost one clinic group in 2025
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-destructive">Permanent Ban</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  the FTC&apos;s punishment for repeat violations — a permanent marketing ban
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="mt-6 text-muted-foreground">
            One wrong word. One caption on Instagram. One email to your list. That&apos;s all it takes.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Paste Your Content", desc: "Copy any marketing text into the scanner — website copy, social posts, ads, emails, scripts." },
              { step: "2", title: "Get Your Compliance Score", desc: "See your score, flagged phrases, risk levels, and detailed explanations instantly." },
              { step: "3", title: "Rewrite in One Click", desc: "AI rewrites your content with compliant alternatives, maintaining your original tone." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Everything You Need</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <CardContent className="flex gap-3 pt-6">
                  <f.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Library Preview */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">From the Compliance Library</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Real FDA/FTC-flagged phrases with compliant alternatives
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {libraryExamples.map((ex) => (
              <Card key={ex.banned}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive" className="text-xs">{ex.risk}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-red-500/10 px-2 py-1 text-sm text-red-700 dark:text-red-400 font-medium">
                      &quot;{ex.banned}&quot;
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="rounded-md bg-green-500/10 px-2 py-1 text-sm text-green-700 dark:text-green-400">
                      &quot;{ex.alternative}&quot;
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            View full library after signing up →
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <h2 className="text-3xl font-bold">Simple Pricing</h2>
          <Card className="mt-8">
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-4xl font-bold">$497<span className="text-lg text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground mt-1">Cancel anytime</p>
              </div>
              <ul className="space-y-2 text-left">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                Start Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-center text-3xl font-bold">Frequently Asked Questions</h2>
          <Accordion className="mt-8">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">RegenCompliance</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Contact</span>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            RegenCompliance is an educational compliance tool and does not constitute legal or regulatory advice.
            Not affiliated with the FDA or FTC. &copy; 2026 RegenCompliance.
          </p>
        </div>
      </footer>
    </div>
  )
}
