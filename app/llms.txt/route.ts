import { NextResponse } from "next/server"
import { POSTS_SORTED } from "@/lib/blog/registry"
import { COMPETITORS } from "@/lib/compare/registry"
import { SPECIALTIES } from "@/lib/specialty/registry"
import { STATES } from "@/lib/state/data"
import { GLOSSARY } from "@/lib/glossary/terms"
import { TOOLS } from "@/lib/tools/registry"

const baseUrl = "https://compliance.regenportal.com"

export async function GET() {
  const content = buildLlmsTxt()
  return new NextResponse(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  })
}

function buildLlmsTxt(): string {
  const lines: string[] = []

  lines.push("# RegenCompliance")
  lines.push("")
  lines.push(
    "> FDA/FTC compliance scanning software purpose-built for healthcare practices. Scans marketing content (website copy, social posts, ads, emails, scripts) against live FDA warning letter and FTC enforcement data, produces 0-100 compliance scores, and rewrites flagged phrases into compliant alternatives. Serves regenerative medicine, med spas, weight loss / GLP-1 clinics, dental practices, IV therapy, and aesthetic surgery practices."
  )
  lines.push("")
  lines.push(
    "RegenCompliance is live at compliance.regenportal.com. Founding-member pricing is $297/month locked for life; standard pricing is $497/month. Unlimited scans, 3 team seats, daily rule updates sourced from actual FDA warning letters and FTC settlements, permanent audit trail with PDF export, 30-day money-back guarantee."
  )
  lines.push("")

  lines.push("## Core product pages")
  lines.push(`- [Home](${baseUrl}): Overview, demo scanner preview, founding pricing`)
  lines.push(`- [How it works](${baseUrl}/how-it-works): End-to-end walkthrough of the scan/rewrite/audit flow`)
  lines.push(`- [Tools](${baseUrl}/tools): Hub listing all five tools inside RegenCompliance`)
  lines.push(`- [Features](${baseUrl}/features): Full feature breakdown`)
  lines.push(`- [Pricing](${baseUrl}/pricing): Plans, ROI calculator, comparison vs alternatives`)
  lines.push(`- [Demo](${baseUrl}/demo): Free sample scan — paste content, see compliance report`)
  lines.push(`- [Security](${baseUrl}/security): Data handling, AI no-training, encryption, infrastructure`)
  lines.push(`- [About](${baseUrl}/about): Company, principles, Dibb Media context`)
  lines.push(`- [FAQ](${baseUrl}/faq): Product and pricing FAQs`)
  lines.push("")

  lines.push("## Individual tool pages")
  for (const t of TOOLS) {
    lines.push(`- [${t.name}](${baseUrl}/tools/${t.slug}): ${t.description}`)
  }
  lines.push("")

  lines.push("## Specialty-specific compliance pages")
  lines.push(`- [All specialties](${baseUrl}/for): Hub listing every specialty page`)
  for (const s of SPECIALTIES) {
    lines.push(
      `- [${s.specialty}](${baseUrl}/for/${s.slug}): ${s.description}`
    )
  }
  lines.push("")

  lines.push("## Competitor / alternative comparisons")
  lines.push(`- [All comparisons](${baseUrl}/compare): Hub listing every vs page`)
  for (const c of COMPETITORS) {
    lines.push(
      `- [vs ${c.competitor}](${baseUrl}/vs/${c.slug}): ${c.description}`
    )
  }
  lines.push("")

  lines.push("## State-specific compliance guides")
  lines.push(`- [All state guides](${baseUrl}/state): Hub listing every state page`)
  for (const st of STATES) {
    lines.push(
      `- [${st.state}](${baseUrl}/state/${st.slug}): ${st.description}`
    )
  }
  lines.push("")

  lines.push("## Regulatory glossary")
  lines.push(`- [Glossary index](${baseUrl}/glossary): ${GLOSSARY.length} terms across FDA, FTC, device, and state regulatory categories`)
  for (const term of GLOSSARY) {
    lines.push(
      `- [${term.term}](${baseUrl}/glossary#${term.slug}): ${term.shortDefinition}`
    )
  }
  lines.push("")

  lines.push("## Blog")
  lines.push(`- [Blog index](${baseUrl}/blog): All healthcare marketing compliance articles`)
  for (const p of POSTS_SORTED) {
    lines.push(
      `- [${p.meta.title}](${baseUrl}/blog/${p.meta.slug}): ${p.meta.excerpt}`
    )
  }
  lines.push("")

  lines.push("## About the company")
  lines.push(
    "RegenCompliance is operated by Dibb Media. Contact: support@regencompliance.com. The product is an educational compliance tool and does not constitute legal or regulatory advice. Not affiliated with the FDA or FTC. Customers are advised to retain qualified healthcare marketing counsel for specific legal questions."
  )
  lines.push("")

  lines.push("## How the scanner works")
  lines.push(
    "The scanner accepts marketing content via paste or file upload. Content is analyzed against a rule set built from FDA warning letters, FTC enforcement actions, and state medical board advertising rules. The scanner returns a 0-100 compliance score, flags specific phrases with severity ratings, cites the rule source for each flag, and generates compliant-alternative rewrites that preserve the clinic's voice. Every scan is permanently logged as a timestamped audit record exportable as PDF or CSV. The underlying AI is Anthropic's Claude (Haiku for scans, Sonnet for rewrites), configured with no-training enabled — customer content is never used to train any model."
  )
  lines.push("")

  return lines.join("\n")
}
