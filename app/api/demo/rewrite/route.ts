export const maxDuration = 60

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { anthropic } from "@/lib/anthropic"
import { createServiceClient } from "@/lib/supabase/server"
import { trackApiUsage } from "@/lib/api-costs"
import { captureError } from "@/lib/error-tracking"

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
      .map((f: { matched_text: string; risk_level: string }) => `"${f.matched_text}" (${f.risk_level} risk)`)
      .join("; ")

    // Demo rewrite uses general FDA/FTC knowledge only — no proprietary compliance bible
    const response = await anthropic.messages.create({
      model: "claude-4-sonnet-20250514",
      max_tokens: 4096,
      temperature: 0,
      system: `You are a healthcare marketing compliance editor.
Rewrite the content to be FDA/FTC compliant for healthcare marketing.

Flagged phrases to fix: ${flagsSummary}

Rules:
- Remove disease cure claims, guaranteed outcomes, false FDA claims, and absolute safety claims
- Use patient experience language (many patients report..., may support..., some patients experience...)
- Add hedging where needed (individual results may vary)
- Maintain original tone and approximate length
- Do not add disclaimers that are not contextually relevant

Return ONLY the rewritten text. No explanations, no JSON.`,
      messages: [{ role: "user", content: original_text }],
    })

    // Track API cost (non-blocking)
    const supabase = createServiceClient()
    trackApiUsage(supabase, "00000000-0000-0000-0000-000000000000", "/api/demo/rewrite", "claude-4-sonnet-20250514", response)

    const rewrittenText = response.content?.[0]?.type === "text" ? response.content[0].text : ""

    return NextResponse.json({ rewritten_text: rewrittenText })
  } catch (error) {
    captureError(error, { route: "/api/demo/rewrite" })
    return NextResponse.json(
      { error: "Compliance engine temporarily unavailable." },
      { status: 503 }
    )
  }
}
