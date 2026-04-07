import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { createBroadcastNotification } from "@/lib/notifications"
import {
  COMPLIANCE_SOURCES,
  extractRegenLinks,
  extractArticleText,
  extractRulesFromText,
  insertRulesWithDedup,
} from "@/lib/compliance-scraper"

interface SourceResult {
  success: boolean
  newRules: number
  errors: string[]
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startTime = Date.now()
  const supabase = createServiceClient()
  const results: Record<string, SourceResult> = {}

  // Process all 5 sources
  for (const source of COMPLIANCE_SOURCES) {
    const result: SourceResult = { success: false, newRules: 0, errors: [] }
    results[source.id] = result

    try {
      // Extract up to 3 regen-related links from the listing page
      const links = await extractRegenLinks(source, 3)
      result.success = true

      if (links.length === 0) continue

      // Filter out URLs already in the database
      const { data: existingRows } = await supabase
        .from("compliance_rules")
        .select("source_url")
        .in("source_url", links)

      const existingUrls = new Set(existingRows?.map((r) => r.source_url) ?? [])
      const newLinks = links.filter((url) => !existingUrls.has(url))

      // Process each new link
      for (const url of newLinks) {
        try {
          const articleText = await extractArticleText(url, source.contentSelector)
          if (!articleText) continue

          const rules = await extractRulesFromText(articleText, source.name, source.type)
          if (rules.length === 0) continue

          const today = new Date().toISOString().split("T")[0]
          const insertedCount = await insertRulesWithDedup(rules, url, source.name, today, supabase)
          result.newRules += insertedCount
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          result.errors.push(`${url}: ${msg}`)
          console.error(`Error processing ${source.id} article ${url}:`, e)
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      result.errors.push(msg)
      console.error(`Error scraping ${source.id}:`, e)
    }
  }

  // Calculate totals
  const totalNewRules = Object.values(results).reduce((sum, r) => sum + r.newRules, 0)
  const anySuccess = Object.values(results).some((r) => r.success)
  const duration = Date.now() - startTime

  // Send notification if any new rules were added
  if (totalNewRules > 0) {
    const sourceNames = Object.entries(results)
      .filter(([, r]) => r.newRules > 0)
      .map(([id]) => id)
      .join(", ")

    await createBroadcastNotification(
      `Compliance Library Updated: ${totalNewRules} new rule(s) added`,
      `New enforcement actions processed from ${sourceNames}. Review the latest rules in the Compliance Library.`,
      "rule_update",
      "/dashboard/library"
    )
  }

  console.log(`Cron scrape complete: ${totalNewRules} new rules in ${duration}ms`)

  if (!anySuccess) {
    return NextResponse.json(
      {
        success: false,
        error: "All sources failed to scrape",
        results,
        total_new_rules: 0,
        duration_ms: duration,
      },
      { status: 502 }
    )
  }

  return NextResponse.json({
    success: true,
    results,
    total_new_rules: totalNewRules,
    duration_ms: duration,
  })
}
