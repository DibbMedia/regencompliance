import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { anthropic } from "@/lib/anthropic"
import { createServiceClient } from "@/lib/supabase/server"
import { scanSchema } from "@/lib/validations"

const MAX_DEMO_SCANS = 3
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60 // 90 days

interface DemoCookie {
  scans_used: number
  started_at: string
}

function getDemoState(cookieValue: string | undefined): DemoCookie {
  if (!cookieValue) {
    return { scans_used: 0, started_at: new Date().toISOString() }
  }
  try {
    return JSON.parse(cookieValue)
  } catch {
    return { scans_used: 0, started_at: new Date().toISOString() }
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get("regen_demo")
    const demoState = getDemoState(demoCookie?.value)

    // Check if demo expired
    if (demoState.scans_used >= MAX_DEMO_SCANS) {
      return NextResponse.json({
        error: "Demo limit reached. Sign up for unlimited scans.",
        demo_status: {
          scans_used: demoState.scans_used,
          max_scans: MAX_DEMO_SCANS,
          expired: true,
        },
      }, { status: 429 })
    }

    // Validate input
    const body = await request.json()
    const parsed = scanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { text, content_type } = parsed.data
    const startTime = Date.now()

    // Fetch compliance rules
    const supabase = createServiceClient()
    const { data: rules } = await supabase
      .from("compliance_rules")
      .select("id, banned_phrase, banned_phrase_variants, compliant_alternative, risk_level, applies_to, category")
      .eq("is_active", true)

    // Claude Haiku scan
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: `You are a regulatory compliance expert for FDA/FTC regenerative medicine marketing rules.
Rules JSON: ${JSON.stringify(rules || [])}
Analyze submitted content. Return ONLY valid JSON:
{
  "compliance_score": integer 0-100,
  "summary": "one sentence string",
  "flags": [{
    "rule_id": "uuid or null if no exact match",
    "matched_text": "exact text from content that violates",
    "banned_phrase": "the banned phrase it matches",
    "risk_level": "high|medium|low",
    "reason": "one sentence why it violates FDA/FTC",
    "alternative": "compliant rewrite of that phrase"
  }]
}
Score: 100=clean, 80-99=minor issues, 60-79=medium risk, 40-59=high risk, 0-39=multiple high risk.
Match partial phrases, synonyms, and intent — not just exact strings.
Return empty flags array and score 100 if clean. No text outside JSON.`,
      messages: [{ role: "user", content: text }],
    })

    const scanDuration = Date.now() - startTime
    const responseText = response.content[0].type === "text" ? response.content[0].text : ""

    let scanResult
    try {
      // Strip markdown code blocks if present
      let cleaned = responseText.trim()
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
      }
      scanResult = JSON.parse(cleaned)
    } catch {
      console.error("Failed to parse scan response:", responseText.slice(0, 500))
      return NextResponse.json(
        { error: "Compliance engine returned invalid response. Please try again." },
        { status: 503 }
      )
    }

    const flags = scanResult.flags || []

    // Update demo cookie
    const newDemoState: DemoCookie = {
      scans_used: demoState.scans_used + 1,
      started_at: demoState.started_at,
    }

    const res = NextResponse.json({
      result: {
        compliance_score: scanResult.compliance_score,
        summary: scanResult.summary,
        flags,
        flag_count: flags.length,
        high_risk_count: flags.filter((f: { risk_level: string }) => f.risk_level === "high").length,
        medium_risk_count: flags.filter((f: { risk_level: string }) => f.risk_level === "medium").length,
        low_risk_count: flags.filter((f: { risk_level: string }) => f.risk_level === "low").length,
        scan_duration_ms: scanDuration,
      },
      demo_status: {
        scans_used: newDemoState.scans_used,
        max_scans: MAX_DEMO_SCANS,
        expired: newDemoState.scans_used >= MAX_DEMO_SCANS,
      },
    })

    res.cookies.set("regen_demo", JSON.stringify(newDemoState), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    })

    return res
  } catch (error) {
    console.error("Demo scan error:", error)
    return NextResponse.json(
      { error: "Compliance engine temporarily unavailable." },
      { status: 503 }
    )
  }
}
