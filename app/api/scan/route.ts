import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { anthropic } from "@/lib/anthropic"
import { scanSchema } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)

    // Check subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, treatments")
      .eq("id", profileId)
      .single()

    if (profile?.subscription_status !== "active") {
      return NextResponse.json({ error: "Active subscription required" }, { status: 403 })
    }

    // Validate input
    const body = await request.json()
    const parsed = scanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { text, content_type } = parsed.data
    const startTime = Date.now()

    // Fetch active compliance rules
    const { data: rules } = await supabase
      .from("compliance_rules")
      .select("id, banned_phrase, banned_phrase_variants, compliant_alternative, risk_level, applies_to, category")
      .eq("is_active", true)

    const treatments = profile.treatments || []
    const relevantRules = (rules || []).filter(
      (r) => r.applies_to.length === 0 || r.applies_to.some((t: string) => treatments.includes(t))
    )

    // Claude Haiku scan
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: `You are a regulatory compliance expert for FDA/FTC regenerative medicine marketing rules.
Clinic treats: ${treatments.join(", ") || "general regenerative medicine"}
Rules JSON: ${JSON.stringify(relevantRules)}
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
    const highCount = flags.filter((f: { risk_level: string }) => f.risk_level === "high").length
    const mediumCount = flags.filter((f: { risk_level: string }) => f.risk_level === "medium").length
    const lowCount = flags.filter((f: { risk_level: string }) => f.risk_level === "low").length

    // Save scan
    const { data: scan, error } = await supabase
      .from("scans")
      .insert({
        profile_id: profileId,
        user_id: user.id,
        content_type,
        original_text: text,
        flags,
        compliance_score: scanResult.compliance_score,
        flag_count: flags.length,
        high_risk_count: highCount,
        medium_risk_count: mediumCount,
        low_risk_count: lowCount,
        scan_duration_ms: scanDuration,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to save scan:", error)
      return NextResponse.json({ error: "Failed to save scan results" }, { status: 500 })
    }

    return NextResponse.json({
      ...scan,
      summary: scanResult.summary,
    })
  } catch (error) {
    console.error("Scan error:", error)
    return NextResponse.json(
      { error: "Compliance engine temporarily unavailable." },
      { status: 503 }
    )
  }
}
