import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { betaApplicationSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { sendToGhl } from "@/lib/ghl"
import { deriveSource } from "@/lib/source-tracking"

export const maxDuration = 10

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)

    const global = await checkRateLimit("beta-apply-global", 200, 60 * 60 * 1000)
    if (!global.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 },
      )
    }

    const limit = await checkRateLimit(`beta-apply:${ip}`, 3, 10 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 },
      )
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const parsed = betaApplicationSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json(
        { error: first?.message || "Invalid input" },
        { status: 400 },
      )
    }

    const { name, email, clinic_name, specialty, role, website, monthly_volume, why_apply } = parsed.data
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null

    const supabase = createServiceClient()
    const { error } = await supabase.from("beta_applications").insert({
      name,
      email,
      clinic_name,
      specialty,
      role,
      website: website || null,
      monthly_volume,
      why_apply,
      ip_address: ip,
      user_agent: userAgent,
      source: deriveSource(request),
      // accepted_terms_at defaults to now() in the migration; recording the
      // server-time of acceptance is intentional (we don't trust client clocks).
    })

    if (error) {
      // Idempotent on unique-violation: don't leak which emails have applied.
      if (error.code === "23505") {
        return NextResponse.json({ success: true, alreadyApplied: true })
      }
      console.error("Beta application insert error:", error)
      return NextResponse.json(
        { error: "Failed to submit application. Please try again." },
        { status: 500 },
      )
    }

    // GHL pipeline: drop the applicant into the founder-beta review workflow.
    void sendToGhl("beta_apply", {
      email,
      name,
      company: clinic_name,
      specialty,
      role,
      website: website || null,
      monthly_volume,
      why_apply,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Beta apply route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
