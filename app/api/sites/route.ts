import { NextResponse, after } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { requireWriteMode } from "@/lib/impersonation"
import { checkRateLimit } from "@/lib/rate-limit"
import { discoverPages } from "@/lib/site-crawler"
import { assertSafeUrl } from "@/lib/ssrf"

// GET - list user's monitored sites with page counts and avg scores
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

// POST - add a new monitored site
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocked = await requireWriteMode()
    if (blocked) return blocked

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

    // Normalize - parse as URL to peel off protocol, port, path, query.
    // Lets users paste "https://www.foo.com/services?utm=x" and just store
    // the host. Falls back to manual strip for inputs that aren't URL-shaped.
    let normalizedDomain: string
    try {
      const candidate = /^https?:\/\//i.test(domain) ? domain : `https://${domain}`
      const parsed = new URL(candidate)
      normalizedDomain = parsed.hostname.toLowerCase()
    } catch {
      normalizedDomain = domain
        .replace(/^(https?:\/\/)/i, "")
        .replace(/\/.*$/, "")
        .toLowerCase()
    }

    // Basic domain validation
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(normalizedDomain)) {
      return NextResponse.json({ error: "Invalid domain format" }, { status: 400 })
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

    // Run discovery AFTER the response is sent. The synchronous version
    // blocked the request for up to ~30s with no client feedback and
    // swallowed errors (returning total_pages: 0). With after() the user
    // gets an immediate 201 and the client polls for total_pages updates.
    after(async () => {
      try {
        const discovered = await discoverPages(normalizedDomain, 50)
        if (discovered.length === 0) return

        const serviceClient = createServiceClient()
        const pageRows = discovered.map((p) => ({
          site_id: site.id,
          url: p.url,
          title: p.title,
          status: "pending",
        }))

        const { error: pagesError } = await serviceClient
          .from("site_pages")
          .insert(pageRows)
        if (pagesError) {
          console.error("Background page insert failed:", pagesError)
          return
        }

        await serviceClient
          .from("monitored_sites")
          .update({ total_pages: discovered.length })
          .eq("id", site.id)
      } catch (crawlError) {
        console.error("Background page discovery error:", crawlError)
      }
    })

    return NextResponse.json({ site }, { status: 201 })
  } catch (error) {
    console.error("Sites POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
