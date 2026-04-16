import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { checkRateLimit } from "@/lib/rate-limit"
import { discoverPages } from "@/lib/site-crawler"
import { assertSafeUrl } from "@/lib/ssrf"

// GET — list user's monitored sites with page counts and avg scores
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)

    const { data: sites, error } = await supabase
      .from("monitored_sites")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch sites:", error)
      return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
    }

    return NextResponse.json({ sites: sites || [] })
  } catch (error) {
    console.error("Sites GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST — add a new monitored site
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

    if (!profile || !["active", "past_due"].includes(profile.subscription_status ?? "")) {
      return NextResponse.json({ error: "Active subscription required" }, { status: 403 })
    }

    // Rate limit site additions
    const { allowed } = await checkRateLimit(`site-add:${user.id}`, 10, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const { domain, name } = body

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Normalize domain — strip protocol and trailing slash
    const normalizedDomain = domain
      .replace(/^(https?:\/\/)/, "")
      .replace(/\/+$/, "")
      .toLowerCase()

    // Basic domain validation
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(normalizedDomain)) {
      return NextResponse.json({ error: "Invalid domain format" }, { status: 400 })
    }

    try {
      new URL(`https://${normalizedDomain}`)
    } catch {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 })
    }

    const ssrfCheck = await assertSafeUrl(`https://${normalizedDomain}`)
    if (!ssrfCheck.ok) {
      return NextResponse.json({ error: ssrfCheck.reason ?? "Domain blocked" }, { status: 400 })
    }

    // Check limit: max 5 sites per user
    const { count } = await supabase
      .from("monitored_sites")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)

    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: "Maximum of 5 monitored sites allowed" }, { status: 400 })
    }

    // Check for duplicate domain
    const { data: existing } = await supabase
      .from("monitored_sites")
      .select("id")
      .eq("profile_id", profileId)
      .eq("domain", normalizedDomain)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "This domain is already being monitored" }, { status: 409 })
    }

    // Insert the site with next_crawl_at = now to trigger immediate first crawl
    const { data: site, error: insertError } = await supabase
      .from("monitored_sites")
      .insert({
        profile_id: profileId,
        domain: normalizedDomain,
        name: name || normalizedDomain,
        next_crawl_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Failed to insert site:", insertError)
      return NextResponse.json({ error: "Failed to add site" }, { status: 500 })
    }

    // Discover pages in the background and insert as "pending"
    try {
      const discovered = await discoverPages(normalizedDomain, 50)

      if (discovered.length > 0) {
        const pageRows = discovered.map((p) => ({
          site_id: site.id,
          url: p.url,
          title: p.title,
          status: "pending",
        }))

        await supabase.from("site_pages").insert(pageRows)

        // Update total_pages count
        await supabase
          .from("monitored_sites")
          .update({ total_pages: discovered.length })
          .eq("id", site.id)

        site.total_pages = discovered.length
      }
    } catch (crawlError) {
      console.error("Page discovery error (non-fatal):", crawlError)
      // Non-fatal — site is still added, pages can be discovered on first crawl
    }

    return NextResponse.json({ site }, { status: 201 })
  } catch (error) {
    console.error("Sites POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
