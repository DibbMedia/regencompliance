import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export interface FeedItem {
  id: string
  category: "rule_update" | "enforcement" | "tip" | "announcement"
  title: string
  body: string
  timestamp: string
}

const STATIC_TIPS: Omit<FeedItem, "id" | "timestamp">[] = [
  {
    category: "tip",
    title: "Avoid Absolute Cure Claims",
    body: "Never claim that stem cells, exosomes, or PRP \"cure\" any condition. The FDA considers these unapproved drug claims. Instead, use language like \"may support\" or \"has shown promise in research\" and always reference published studies when possible.",
  },
  {
    category: "tip",
    title: "Patient Testimonials: What You Can't Say",
    body: "Patient testimonials that imply guaranteed results violate FTC guidelines. If you feature patient stories, include clear disclaimers that results vary and are not guaranteed. Never allow testimonials that reference specific diagnoses being \"cured\" or \"fixed.\"",
  },
  {
    category: "tip",
    title: "Social Media Posts Need Compliance Review Too",
    body: "Instagram captions, Facebook posts, and TikTok videos are all marketing materials subject to FDA/FTC rules. A casual social post claiming your treatment \"reverses aging\" or \"eliminates pain\" carries the same legal risk as a website claim. Run every post through the scanner first.",
  },
  {
    category: "tip",
    title: "Email Marketing: Don't Overpromise in Subject Lines",
    body: "Subject lines like \"Say Goodbye to Joint Pain Forever\" or \"The Cure Big Pharma Doesn't Want You to Know\" are compliance red flags. Keep email subject lines factual and avoid urgency tactics that imply guaranteed medical outcomes.",
  },
  {
    category: "tip",
    title: "Website Copy: Structure Matters",
    body: "Place FDA disclaimers near any treatment description, not just in the footer. The FTC evaluates the \"net impression\" a consumer gets - if bold cure claims are at the top and tiny disclaimers are at the bottom, you're still at risk.",
  },
  {
    category: "tip",
    title: "Before/After Photos Carry Risk",
    body: "Before/after photos can be considered testimonials under FTC rules. If you use them, they must represent typical results, not best-case scenarios. Add disclaimers directly adjacent to the images stating that individual results vary.",
  },
  {
    category: "tip",
    title: "\"FDA Approved\" vs \"FDA Cleared\" vs \"FDA Registered\"",
    body: "These terms mean very different things. Most regen treatments are NOT FDA approved. Calling your clinic \"FDA approved\" when you mean your facility is registered is a serious compliance violation. Be precise with regulatory terminology.",
  },
  {
    category: "tip",
    title: "Don't Reference Other Patients' Diagnoses",
    body: "Marketing that says \"We've treated hundreds of patients with arthritis\" may violate both HIPAA implications and FTC guidelines. Keep claims general and never reference specific patient conditions without proper consent and disclaimers.",
  },
  {
    category: "tip",
    title: "Watch Out for Staff Social Media",
    body: "Your front desk staff, nurses, and practitioners posting about treatments on personal accounts can still be attributed to your clinic. Create a social media policy and train all staff on what they can and cannot say about your services online.",
  },
  {
    category: "tip",
    title: "Google Ads Have Extra Restrictions",
    body: "Google has its own healthcare advertising policies on top of FDA/FTC rules. Claims about stem cell therapy, exosome treatments, and similar services may get your ads disapproved or your account suspended. Use conservative language in paid advertising.",
  },
  {
    category: "enforcement",
    title: "FDA Warning Letter Trends: Exosome Products",
    body: "The FDA has increased enforcement against clinics marketing exosome products as treatments for specific diseases. Multiple warning letters have been issued to clinics claiming exosomes can treat COVID-19, chronic pain, and autoimmune conditions. Ensure your marketing makes no disease-treatment claims for exosome therapies.",
  },
  {
    category: "enforcement",
    title: "FTC Crackdown on Regenerative Medicine Advertising",
    body: "The FTC has signaled increased scrutiny of regenerative medicine advertising, particularly claims made on social media and in online reviews. Clinics that incentivize positive reviews or fail to disclose material connections with endorsers face potential enforcement action.",
  },
  {
    category: "announcement",
    title: "Welcome to RegenCompliance",
    body: "Your compliance scanner is ready to use. Paste any marketing content - website copy, social posts, emails, or ad text - and get instant feedback on potential FDA/FTC violations. Use the Compliance Library to browse all active rules.",
  },
]

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch recent compliance rules added in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentRules } = await supabase
      .from("compliance_rules")
      .select("id, banned_phrase, compliant_alternative, risk_level, category, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(10)

    const ruleItems: FeedItem[] = (recentRules || []).map((rule) => ({
      id: `rule-${rule.id}`,
      category: "rule_update" as const,
      title: `New ${rule.risk_level}-risk rule: "${rule.banned_phrase}"`,
      body: `Compliant alternative: "${rule.compliant_alternative}". Category: ${rule.category.replace(/_/g, " ")}.`,
      timestamp: rule.created_at,
    }))

    // Convert static tips to feed items with staggered timestamps
    const now = Date.now()
    const staticItems: FeedItem[] = STATIC_TIPS.map((tip, i) => ({
      ...tip,
      id: `static-${i}`,
      // Stagger static items over the past 30 days so they feel like a real feed
      timestamp: new Date(now - i * 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    }))

    // Merge and sort by timestamp descending
    const allItems = [...ruleItems, ...staticItems].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({ items: allItems })
  } catch (error) {
    console.error("Feed error:", error)
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 })
  }
}
