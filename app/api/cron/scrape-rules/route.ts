import { NextResponse } from "next/server"
import * as cheerio from "cheerio"
import { createServiceClient } from "@/lib/supabase/server"
import { anthropic } from "@/lib/anthropic"
import { createBroadcastNotification } from "@/lib/notifications"

const REGEN_KEYWORDS = [
  "stem cell", "regenerative", "exosome", "PRP", "platelet",
  "biologic", "wharton", "BMAC", "prolotherapy", "peptide",
]

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startTime = Date.now()
  let newRulesCount = 0
  let fdaSuccess = false
  let ftcSuccess = false
  const supabase = createServiceClient()

  try {
    // Step 1 — FDA Warning Letters
    try {
      const fdaRes = await fetch(
        "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/compliance-actions-and-activities/warning-letters",
        { signal: AbortSignal.timeout(15000) }
      )
      if (fdaRes.ok) {
        fdaSuccess = true
        const html = await fdaRes.text()
        const $ = cheerio.load(html)
        const links: string[] = []

        $("a[href*='warning-letters/']").each((_, el) => {
          const text = $(el).text().toLowerCase()
          const href = $(el).attr("href")
          if (href && REGEN_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()))) {
            const fullUrl = href.startsWith("http") ? href : `https://www.fda.gov${href}`
            links.push(fullUrl)
          }
        })

        for (const url of links.slice(0, 5)) {
          // Check if already processed
          const { data: existing } = await supabase
            .from("compliance_rules")
            .select("id")
            .eq("source_url", url)
            .limit(1)

          if (existing && existing.length > 0) continue

          try {
            const letterRes = await fetch(url, { signal: AbortSignal.timeout(15000) })
            if (!letterRes.ok) continue
            const letterHtml = await letterRes.text()
            const $letter = cheerio.load(letterHtml)
            const bodyText = $letter(".field--name-body, .content-current, main").text().slice(0, 8000)

            if (!bodyText.trim()) continue

            const response = await anthropic.messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 2048,
              system: "Extract the specific marketing phrases cited as violations in this FDA warning letter. For each: return { banned_phrase, reason (one sentence), compliant_alternative, risk_level (high/medium/low) }. Return as JSON array only. If no relevant phrases, return [].",
              messages: [{ role: "user", content: bodyText }],
            })

            const text = response.content[0].type === "text" ? response.content[0].text : "[]"
            const phrases = JSON.parse(text)

            for (const phrase of phrases) {
              if (!phrase.banned_phrase || !phrase.compliant_alternative) continue

              const { error } = await supabase.from("compliance_rules").insert({
                banned_phrase: phrase.banned_phrase,
                compliant_alternative: phrase.compliant_alternative,
                risk_level: phrase.risk_level || "high",
                category: "health_claims",
                source_url: url,
                source_name: "FDA Warning Letter",
                source_date: new Date().toISOString().split("T")[0],
              })

              if (!error) newRulesCount++
            }
          } catch (e) {
            console.error(`Error processing FDA letter ${url}:`, e)
          }
        }
      }
    } catch (e) {
      console.error("FDA scrape error:", e)
    }

    // Step 2 — FTC Press Releases
    try {
      const ftcRes = await fetch(
        "https://www.ftc.gov/news-events/news/press-releases",
        { signal: AbortSignal.timeout(15000) }
      )
      if (ftcRes.ok) {
        ftcSuccess = true
        const html = await ftcRes.text()
        const $ = cheerio.load(html)
        const links: string[] = []

        $("a").each((_, el) => {
          const text = $(el).text().toLowerCase()
          const href = $(el).attr("href")
          if (href && REGEN_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()))) {
            const fullUrl = href.startsWith("http") ? href : `https://www.ftc.gov${href}`
            links.push(fullUrl)
          }
        })

        for (const url of links.slice(0, 5)) {
          const { data: existing } = await supabase
            .from("compliance_rules")
            .select("id")
            .eq("source_url", url)
            .limit(1)

          if (existing && existing.length > 0) continue

          try {
            const pressRes = await fetch(url, { signal: AbortSignal.timeout(15000) })
            if (!pressRes.ok) continue
            const pressHtml = await pressRes.text()
            const $press = cheerio.load(pressHtml)
            const bodyText = $press("article, .field--name-body, main").text().slice(0, 8000)

            if (!bodyText.trim()) continue

            const response = await anthropic.messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 2048,
              system: "Extract the specific marketing phrases cited as deceptive or unsubstantiated in this FTC press release. For each: return { banned_phrase, reason (one sentence), compliant_alternative, risk_level (high/medium/low) }. Return as JSON array only. If no relevant phrases, return [].",
              messages: [{ role: "user", content: bodyText }],
            })

            const text = response.content[0].type === "text" ? response.content[0].text : "[]"
            const phrases = JSON.parse(text)

            for (const phrase of phrases) {
              if (!phrase.banned_phrase || !phrase.compliant_alternative) continue

              const { error } = await supabase.from("compliance_rules").insert({
                banned_phrase: phrase.banned_phrase,
                compliant_alternative: phrase.compliant_alternative,
                risk_level: phrase.risk_level || "high",
                category: "health_claims",
                source_url: url,
                source_name: "FTC Press Release",
                source_date: new Date().toISOString().split("T")[0],
              })

              if (!error) newRulesCount++
            }
          } catch (e) {
            console.error(`Error processing FTC release ${url}:`, e)
          }
        }
      }
    } catch (e) {
      console.error("FTC scrape error:", e)
    }

    // Step 3 — Notify if new rules
    if (newRulesCount > 0) {
      await createBroadcastNotification(
        `Compliance Library Updated: ${newRulesCount} new rule(s) added`,
        "New FDA/FTC enforcement actions were processed. Review the latest rules in the Compliance Library.",
        "rule_update",
        "/dashboard/library"
      )
    }

    const duration = Date.now() - startTime
    const bothFailed = !fdaSuccess && !ftcSuccess
    console.log(`Cron scrape complete: ${newRulesCount} new rules in ${duration}ms (FDA: ${fdaSuccess}, FTC: ${ftcSuccess})`)

    if (bothFailed) {
      return NextResponse.json({
        success: false,
        error: "Both FDA and FTC scraping failed",
        new_rules: 0,
        duration_ms: duration,
      }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      new_rules: newRulesCount,
      duration_ms: duration,
    })
  } catch (error) {
    console.error("Cron scrape error:", error)
    return NextResponse.json({ success: false, error: "Scrape failed" }, { status: 500 })
  }
}
