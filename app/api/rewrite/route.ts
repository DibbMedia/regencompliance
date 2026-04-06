import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { anthropic } from "@/lib/anthropic"
import { rewriteSchema } from "@/lib/validations"
import { rewriteRateLimit } from "@/lib/rate-limit"

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
      .select("subscription_status")
      .eq("id", profileId)
      .single()

    if (profile?.subscription_status !== "active") {
      return NextResponse.json({ error: "Active subscription required" }, { status: 403 })
    }

    // Rate limit
    const { success: withinLimit } = await rewriteRateLimit.limit(user.id)
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Daily rewrite limit reached. Resets at midnight UTC." },
        { status: 429 }
      )
    }

    // Validate input
    const body = await request.json()
    const parsed = rewriteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Get scan
    const { data: scan } = await supabase
      .from("scans")
      .select("original_text, flags, profile_id")
      .eq("id", parsed.data.scan_id)
      .single()

    if (!scan || scan.profile_id !== profileId) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 })
    }

    const flagsSummary = (scan.flags as Array<{ banned_phrase: string; alternative: string }>)
      .map((f) => `"${f.banned_phrase}" → "${f.alternative}"`)
      .join("; ")

    // Claude Sonnet rewrite
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20241022",
      max_tokens: 4096,
      system: `You are a healthcare marketing compliance editor for regenerative medicine.
Rewrite the content to be fully FDA/FTC compliant.
Rules: never make disease treatment/cure claims, never claim FDA approval for unapproved therapies,
use patient experience language (many patients report..., may support..., some patients experience...),
always include hedging (individual results may vary, results not guaranteed),
maintain original tone and length, do not add medical disclaimers not in original.
Flagged phrases to replace: ${flagsSummary}
Return ONLY the rewritten text. No explanations, no JSON.`,
      messages: [{ role: "user", content: scan.original_text }],
    })

    const rewrittenText = response.content[0].type === "text" ? response.content[0].text : ""

    // Update scan with rewrite
    await supabase
      .from("scans")
      .update({ rewritten_text: rewrittenText })
      .eq("id", parsed.data.scan_id)

    return NextResponse.json({ rewritten_text: rewrittenText })
  } catch (error) {
    console.error("Rewrite error:", error)
    return NextResponse.json(
      { error: "Compliance engine temporarily unavailable." },
      { status: 503 }
    )
  }
}
