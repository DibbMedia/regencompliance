export const maxDuration = 60

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { anthropic } from "@/lib/anthropic"
import { getComplianceBiblePrompt, getComplianceBibleRewriteGuidance } from "@/lib/compliance-bible"

export async function POST(request: Request) {
  try {
    // Check demo cookie exists (must have done at least 1 scan)
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get("regen_demo")
    if (!demoCookie?.value) {
      return NextResponse.json({ error: "Run a scan first" }, { status: 400 })
    }

    const body = await request.json()
    const { original_text, flags } = body

    if (!original_text || !flags) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const flagsSummary = flags
      .map((f: { banned_phrase: string; alternative: string }) => `"${f.banned_phrase}" → "${f.alternative}"`)
      .join("; ")

    const response = await anthropic.messages.create({
      model: "claude-4-sonnet-20250514",
      max_tokens: 4096,
      temperature: 0,
      system: `You are a healthcare marketing compliance editor for regenerative medicine.
Rewrite the content to be fully FDA/FTC compliant.

[COMPLIANCE BIBLE GUIDANCE]
${getComplianceBiblePrompt()}

[REWRITE PROTOCOL]
${getComplianceBibleRewriteGuidance()}

Flagged phrases to replace: ${flagsSummary}

Additional rules:
- Swap all RED LIGHT phrases for GREEN LIGHT alternatives
- For YELLOW LIGHT phrases, keep the content but add the required disclaimer nearby
- If a specific modality is mentioned (stem cells, exosomes, PRP, peptides, IV therapy, BHRT), include the appropriate regulatory status note
- Use patient experience language (many patients report..., may support..., some patients experience...)
- Always include hedging (individual results may vary, results not guaranteed)
- Maintain original tone and length
- Do not add medical disclaimers that are not contextually relevant

Return ONLY the rewritten text. No explanations, no JSON.`,
      messages: [{ role: "user", content: original_text }],
    })

    const rewrittenText = response.content[0].type === "text" ? response.content[0].text : ""

    return NextResponse.json({ rewritten_text: rewrittenText })
  } catch (error) {
    console.error("Demo rewrite error:", error)
    return NextResponse.json(
      { error: "Compliance engine temporarily unavailable." },
      { status: 503 }
    )
  }
}
