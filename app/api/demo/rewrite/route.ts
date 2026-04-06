import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { anthropic } from "@/lib/anthropic"

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
      system: `You are a healthcare marketing compliance editor for regenerative medicine.
Rewrite the content to be fully FDA/FTC compliant.
Rules: never make disease treatment/cure claims, never claim FDA approval for unapproved therapies,
use patient experience language (many patients report..., may support..., some patients experience...),
always include hedging (individual results may vary, results not guaranteed),
maintain original tone and length, do not add medical disclaimers not in original.
Flagged phrases to replace: ${flagsSummary}
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
