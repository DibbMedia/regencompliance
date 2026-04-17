export const maxDuration = 60

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { requireWriteMode } from "@/lib/impersonation"
import { anthropic } from "@/lib/anthropic"
import { rewriteSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { getComplianceBiblePrompt, getComplianceBibleRewriteGuidance } from "@/lib/compliance-bible"
import { trackApiUsage } from "@/lib/api-costs"
import { captureError } from "@/lib/error-tracking"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocked = await requireWriteMode()
    if (blocked) return blocked

    const { allowed } = await checkRateLimit(`rewrite:${user.id}`, 30, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const { allowed: dayAllowed } = await checkRateLimit(`rewrite-day:${user.id}`, 100, 24 * 60 * 60 * 1000)
    if (!dayAllowed) {
      return NextResponse.json({ error: "Daily rewrite limit reached. Please try again tomorrow." }, { status: 429 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)

    // Check subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", profileId)
      .single()

    if (!profile || !["active", "past_due"].includes(profile.subscription_status ?? "")) {
      return NextResponse.json({ error: "Active subscription required" }, { status: 403 })
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
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      temperature: 0,
      system: `You are a healthcare marketing compliance editor for regenerative medicine.
Rewrite the content to be fully FDA/FTC compliant.

[REGULATORY GUIDANCE]
${getComplianceBiblePrompt()}

[REWRITE PROTOCOL]
${getComplianceBibleRewriteGuidance()}

Flagged phrases to replace: ${flagsSummary}

Additional rules:
- Swap all high-risk phrases for approved alternatives
- For medium-risk phrases, keep the content but add the required disclaimer nearby
- If a specific modality is mentioned (stem cells, exosomes, PRP, peptides, IV therapy, BHRT), include the appropriate regulatory status note
- Use patient experience language (many patients report..., may support..., some patients experience...)
- Always include hedging (individual results may vary, results not guaranteed)
- Maintain original tone and length
- Do not add medical disclaimers that are not contextually relevant

Return ONLY the rewritten text. No explanations, no JSON.`,
      messages: [{ role: "user", content: scan.original_text }],
    })

    // Track API cost (non-blocking)
    trackApiUsage(supabase, user.id, "/api/rewrite", "claude-sonnet-4-5-20250929", response)

    const rewrittenText = response.content.find((b) => b.type === "text")?.text ?? ""

    // Update scan with rewrite
    await supabase
      .from("scans")
      .update({ rewritten_text: rewrittenText })
      .eq("id", parsed.data.scan_id)

    return NextResponse.json({ rewritten_text: rewrittenText })
  } catch (error) {
    captureError(error, { route: "/api/rewrite" })
    return NextResponse.json(
      { error: "Compliance engine temporarily unavailable." },
      { status: 503 }
    )
  }
}
