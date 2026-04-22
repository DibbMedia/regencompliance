import type { ToolMeta } from "../types"

export const meta: ToolMeta = {
  slug: "audit-trail",
  name: "Audit Trail & PDF Export",
  category: "Compliance evidence",
  title: "Audit Trail & PDF Export — Regulatory Evidence of Pre-Publish Compliance | RegenCompliance",
  description:
    "Every scan is a permanent timestamped record of pre-publish compliance review. Export as PDF for legal files or CSV for analysis. Evidence of compliance program when regulators ask.",
  heroBadge: "Compliance evidence",
  heroTagline:
    "Every scan is logged. Every flagged phrase is recorded. Every decision is documented. Export as PDF for your legal file — the evidence of a functioning compliance program is built automatically.",
  shortVerdict:
    "The difference between 'we meant to check' and 'we did check, here's the record.' That distinction matters in any regulatory interaction.",
  whatItIs:
    "The audit trail captures every scan performed through RegenCompliance — timestamp, user, content scanned, compliance score, flagged phrases, rule citations, rewrites accepted, and decisions made. It persists in your account permanently, exportable as PDF or CSV. When regulators ask for evidence of compliance diligence, the audit trail is that evidence.",
  capabilities: [
    {
      title: "Permanent timestamped record of every scan",
      body: "Every scan performed creates a permanent record with date, time, user, content scanned, compliance score, and all flagged phrases with rule citations. Records don't expire, get auto-deleted, or rotate out.",
    },
    {
      title: "Full decision logging",
      body: "Each scan logs which flags were accepted, which rewrites were chosen, which phrases were marked acceptable-with-review, and who made each decision. The full decision chain is preserved.",
    },
    {
      title: "PDF export for legal files",
      body: "Any scan or range of scans exports as a formatted PDF suitable for inclusion in a legal file, regulatory response, or internal compliance documentation. Professional formatting, not just a data dump.",
    },
    {
      title: "CSV export for analysis",
      body: "Scan data exports as CSV for spreadsheet analysis, trend tracking, and integration with other compliance tools. Track compliance score trends, identify recurring flag patterns, monitor staff adherence.",
    },
    {
      title: "Search and filter",
      body: "Search across all scans by keyword, date range, score threshold, user, or flag category. Find specific scans instantly. Produce filtered exports for specific regulatory responses.",
    },
    {
      title: "Team-level visibility",
      body: "Compliance officers or marketing leads can see all scans across team seats. Individual users see their own scans. Permission structure supports both team-wide oversight and individual accountability.",
    },
  ],
  howItWorks: [
    {
      title: "1. Every scan automatically logs",
      body: "No separate step required. When a scan runs, the full record captures automatically — content, flags, rewrites, decisions, user, timestamp. Nothing manual.",
    },
    {
      title: "2. Browse your scan history",
      body: "Dashboard shows all scans sortable by date, score, user, content type. Click into any scan to see full detail — original content, flags, rewrites accepted, final content.",
    },
    {
      title: "3. Export as needed",
      body: "Single scan, date range, or filtered selection exports as PDF or CSV. PDF is formatted for legal/regulatory use; CSV is formatted for analysis.",
    },
    {
      title: "4. Search when you need to find something",
      body: "Search works across all scan content, flag categories, and metadata. Need every scan that mentioned 'Botox' in the last 90 days? Three clicks.",
    },
    {
      title: "5. Produce compliance documentation on demand",
      body: "If you need to demonstrate a compliance program — to an insurance carrier, an investor, a regulator — the audit trail is the documentation. No separate documentation to create or maintain.",
    },
  ],
  useCases: [
    {
      title: "Warning letter response documentation",
      body: "If your practice ever receives an FDA warning letter, the audit trail is what your attorney uses to demonstrate pre-publish compliance diligence. The difference between 'we didn't know' and 'we did know, we actively checked, here's our record' materially affects response strategy and outcome.",
    },
    {
      title: "Insurance carrier documentation",
      body: "Healthcare malpractice and advertising liability insurance carriers increasingly want evidence of compliance programs. The audit trail provides that evidence as a byproduct of normal use.",
    },
    {
      title: "Investor or acquisition due diligence",
      body: "Practices preparing for investment or acquisition face compliance-program due diligence. The audit trail is ready-made evidence of a functioning program.",
    },
    {
      title: "Internal quarterly reviews",
      body: "Compliance officers review scan trends quarterly to identify problem content categories, staff adherence patterns, and improvement opportunities. CSV export makes trend analysis simple.",
    },
    {
      title: "Staff accountability and training",
      body: "Managers see which team members run compliance reviews and which don't. Training gaps become visible. Accountability is built into the workflow.",
    },
    {
      title: "State medical board complaint response",
      body: "If a state medical board receives a complaint about your marketing, the audit trail demonstrates the compliance process your practice actually runs. This often affects complaint-resolution outcomes.",
    },
  ],
  included: [
    "Permanent retention of all scan records (no auto-deletion)",
    "Full decision logging per scan",
    "PDF export with legal-file formatting",
    "CSV export for analysis",
    "Search across all scan content and metadata",
    "Date range, score, user, and flag filtering",
    "Team-level visibility controls",
    "Regulatory documentation templates",
  ],
  whatItIsnt: [
    "Not a replacement for formal HIPAA audit log requirements — the audit trail documents compliance-program activity, not PHI access. HIPAA-specific audit logging for PHI is handled separately in your EHR and practice management systems.",
    "Not legal advice — the audit trail is factual documentation; an attorney interprets what the documentation demonstrates in a specific regulatory context.",
    "Not attorney-client privileged — scan records are business records. For privileged compliance discussion, work with counsel directly.",
    "Not auto-shared with any regulator — you control when and how the audit trail is used in any regulatory interaction.",
  ],
  faqs: [
    {
      q: "How long are records retained?",
      a: "Indefinitely, during your active subscription. If you cancel, scan history remains accessible for 30 days; you can export all records as PDF or CSV during that window. After 30 days, records are deleted per our privacy policy.",
    },
    {
      q: "Is the audit trail legally admissible?",
      a: "The audit trail is a business record — timestamped, consistent, contemporaneously created. Whether it's treated as admissible evidence in a specific proceeding depends on the proceeding's rules of evidence and how it's introduced. That's a question for your attorney. In practical terms, clinics with the audit trail have documented evidence of pre-publish compliance; clinics without it don't.",
    },
    {
      q: "Can regulators access my audit trail?",
      a: "Only if you share it. The audit trail is your data, visible only to you and your team seats. We don't share it with regulators, auditors, or third parties. If you choose to provide it as part of a regulatory response, that's your decision made with counsel.",
    },
    {
      q: "What's the difference between the PDF and CSV export?",
      a: "PDF is formatted for legal/regulatory use — professional layout, organized by scan, includes rule citations and context. Best for inclusion in legal files or regulatory responses. CSV is structured data for analysis — spreadsheet-friendly, good for trend analysis, not as presentation-ready.",
    },
    {
      q: "Can my attorney see my audit trail?",
      a: "Yes, if you share access. Most practices share specific exports or screenshots with their attorney rather than giving direct platform access, but you can invite your attorney as a team seat if that's useful.",
    },
    {
      q: "Does the audit trail include PHI?",
      a: "Only if you include PHI in the content you scan. Most healthcare marketing content doesn't contain PHI — it's marketing copy, not patient records. We recommend not including PHI in scanned content unless specifically necessary; most marketing compliance questions don't require it.",
    },
    {
      q: "Can I bulk export everything at once?",
      a: "Yes. Full account export (all scans, all data) is available as a single operation. Useful for backup, migration, or comprehensive compliance review.",
    },
  ],
  relatedBlogSlugs: [
    "how-to-respond-to-fda-warning-letter",
    "healthcare-website-compliance-audit-framework",
    "pre-publish-compliance-checklist",
  ],
  relatedToolSlugs: ["scanner", "ai-rewriter"],
  keywords: [
    "healthcare compliance audit trail",
    "compliance documentation healthcare",
    "FDA compliance evidence",
    "warning letter response documentation",
    "compliance program record",
  ],
}
