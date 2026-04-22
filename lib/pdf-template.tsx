import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { Scan, ScanFlag } from "./types"

/* ─── Color palette ──────────────────────────────────────── */
const COLORS = {
  black: "#111111",
  darkGray: "#333333",
  medGray: "#666666",
  lightGray: "#999999",
  border: "#d4d4d4",
  lightBg: "#f5f5f5",
  white: "#ffffff",
  green: "#55E039",
  greenDark: "#3BB82A",
  greenBg: "#edfce8",
  red: "#dc2626",
  redBg: "#fef2f2",
  yellow: "#d97706",
  yellowBg: "#fffbeb",
  blue: "#2563eb",
  blueBg: "#eff6ff",
}

/* ─── Score interpretation ───────────────────────────────── */
function scoreLabel(score: number): string {
  if (score >= 90) return "Excellent"
  if (score >= 80) return "Good"
  if (score >= 60) return "Needs Attention"
  if (score >= 40) return "High Risk"
  return "Critical"
}

function scoreColor(score: number): string {
  if (score >= 80) return COLORS.greenDark
  if (score >= 50) return COLORS.yellow
  return COLORS.red
}

function riskColor(level: string): string {
  if (level === "high") return COLORS.red
  if (level === "medium") return COLORS.yellow
  return COLORS.blue
}

function riskBg(level: string): string {
  if (level === "high") return COLORS.redBg
  if (level === "medium") return COLORS.yellowBg
  return COLORS.blueBg
}

function contentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    website_copy: "Website Copy",
    social_post: "Social Media Post",
    ad_copy: "Advertisement Copy",
    email: "Email Content",
    script: "Script",
    other: "Other Content",
    url_scan: "Website URL Scan",
  }
  return map[type] || type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/* ─── Styles ─────────────────────────────────────────────── */
const s = StyleSheet.create({
  /* Pages */
  page: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.darkGray,
    backgroundColor: COLORS.white,
  },
  coverPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    color: COLORS.darkGray,
    backgroundColor: COLORS.white,
  },

  /* Cover page */
  coverTop: {
    height: 8,
    backgroundColor: COLORS.green,
  },
  coverBody: {
    flex: 1,
    paddingHorizontal: 60,
    paddingTop: 100,
    justifyContent: "flex-start",
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  coverSubtitle: {
    fontSize: 14,
    color: COLORS.medGray,
    marginBottom: 40,
  },
  coverClinic: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  coverMeta: {
    fontSize: 11,
    color: COLORS.medGray,
    marginBottom: 4,
  },
  coverScoreSection: {
    marginTop: 50,
    alignItems: "center",
    paddingVertical: 30,
    borderTop: 1,
    borderBottom: 1,
    borderColor: COLORS.border,
  },
  coverScoreNumber: {
    fontSize: 72,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  coverScoreLabel: {
    fontSize: 14,
    color: COLORS.medGray,
    marginTop: 4,
  },
  coverScoreInterpretation: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    fontFamily: "Helvetica-Bold",
  },
  coverFooter: {
    paddingHorizontal: 60,
    paddingBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  coverBrand: {
    fontSize: 9,
    color: COLORS.lightGray,
  },
  coverBrandName: {
    fontSize: 10,
    color: COLORS.green,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },

  /* Page footer */
  pageFooter: {
    position: "absolute",
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: 0.5,
    borderColor: COLORS.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: COLORS.lightGray,
  },
  footerBrand: {
    fontSize: 7.5,
    color: COLORS.green,
  },

  /* Section headings */
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    fontFamily: "Helvetica-Bold",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.medGray,
    marginBottom: 16,
    lineHeight: 1.6,
  },

  /* Executive summary */
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 6,
    border: 0.5,
    borderColor: COLORS.border,
    padding: 14,
    backgroundColor: COLORS.lightBg,
  },
  summaryCardLabel: {
    fontSize: 8,
    color: COLORS.lightGray,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  summaryCardSub: {
    fontSize: 8,
    color: COLORS.medGray,
    marginTop: 2,
  },

  /* Disclaimer box */
  disclaimerBox: {
    backgroundColor: COLORS.lightBg,
    borderRadius: 4,
    padding: 12,
    marginTop: 16,
    borderLeft: 3,
    borderLeftColor: COLORS.border,
  },
  disclaimerText: {
    fontSize: 8.5,
    color: COLORS.medGray,
    lineHeight: 1.5,
    fontStyle: "italic",
  },

  /* Flag sections */
  flagSection: {
    marginBottom: 14,
    borderRadius: 6,
    border: 0.5,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  flagHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: COLORS.lightBg,
    gap: 8,
  },
  flagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
  },
  flagNumber: {
    fontSize: 8,
    color: COLORS.lightGray,
  },
  flagBody: {
    padding: 12,
  },
  flagRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  flagLabel: {
    width: 110,
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.medGray,
    fontFamily: "Helvetica-Bold",
  },
  flagValue: {
    flex: 1,
    fontSize: 9.5,
    color: COLORS.darkGray,
    lineHeight: 1.5,
  },
  flagAltBox: {
    backgroundColor: COLORS.greenBg,
    borderRadius: 4,
    padding: 10,
    marginTop: 4,
  },
  flagAltLabel: {
    fontSize: 8,
    color: COLORS.greenDark,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  flagAltText: {
    fontSize: 9.5,
    color: COLORS.darkGray,
    lineHeight: 1.5,
  },

  /* Risk group header */
  riskGroupHeader: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: 0.5,
    borderColor: COLORS.border,
  },

  /* Recommendations */
  recBox: {
    backgroundColor: COLORS.lightBg,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    border: 0.5,
    borderColor: COLORS.border,
  },
  recText: {
    fontSize: 10.5,
    color: COLORS.darkGray,
    lineHeight: 1.6,
  },
  recDisclaimer: {
    fontSize: 8.5,
    color: COLORS.lightGray,
    lineHeight: 1.5,
    marginTop: 8,
  },

  /* Site report styles */
  sitePageSection: {
    marginBottom: 12,
    borderRadius: 6,
    border: 0.5,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  sitePageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: COLORS.lightBg,
  },
  sitePageUrl: {
    fontSize: 9,
    color: COLORS.darkGray,
    flex: 1,
    fontFamily: "Helvetica-Bold",
  },
  sitePageScore: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  sitePageBody: {
    padding: 10,
  },
  sitePageFlagRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  sitePageFlagBadge: {
    fontSize: 7,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    color: COLORS.white,
  },
  sitePageFlagText: {
    fontSize: 8.5,
    color: COLORS.darkGray,
    flex: 1,
  },

  /* Divider */
  divider: {
    height: 0.5,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
})

/* ─── Reusable: page footer with page number ─────────────── */
function PageFooter({ clinicName }: { clinicName: string }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.footerText}>{clinicName} - Compliance Report</Text>
      <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
      <Text style={s.footerBrand}>RegenCompliance</Text>
    </View>
  )
}

/* ─── SCAN PDF DOCUMENT ──────────────────────────────────── */
export function ScanPdfDocument({ scan, clinicName }: { scan: Scan; clinicName: string }) {
  const flags = (scan.flags || []) as ScanFlag[]
  const score = scan.compliance_score ?? 0
  const date = new Date(scan.created_at)
  const dateStr = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  const highFlags = flags.filter((f) => f.risk_level === "high")
  const medFlags = flags.filter((f) => f.risk_level === "medium")
  const lowFlags = flags.filter((f) => f.risk_level === "low")

  const isUrlScan = scan.content_type === "url_scan" || scan.content_type === "website_copy"

  return (
    <Document>
      {/* ──── PAGE 1: COVER ──── */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverTop} />
        <View style={s.coverBody}>
          <Text style={s.coverTitle}>Compliance Scan Report</Text>
          <Text style={s.coverSubtitle}>FDA/FTC Regulatory Compliance Analysis</Text>

          <Text style={s.coverClinic}>{clinicName}</Text>
          <Text style={s.coverMeta}>Scan Date: {dateStr}</Text>
          <Text style={s.coverMeta}>Content Type: {contentTypeLabel(scan.content_type)}</Text>
          {isUrlScan && scan.original_text && scan.original_text.startsWith("http") && (
            <Text style={s.coverMeta}>URL: {scan.original_text.split("\n")[0]}</Text>
          )}

          <View style={s.coverScoreSection}>
            <Text style={[s.coverScoreNumber, { color: scoreColor(score) }]}>{score}</Text>
            <Text style={s.coverScoreLabel}>Compliance Score</Text>
            <Text style={[s.coverScoreInterpretation, { color: scoreColor(score) }]}>
              {scoreLabel(score)}
            </Text>
          </View>
        </View>
        <View style={s.coverFooter}>
          <View>
            <Text style={s.coverBrand}>Prepared by</Text>
            <Text style={s.coverBrandName}>RegenCompliance</Text>
            <Text style={s.coverBrand}>compliance.regenportal.com</Text>
          </View>
          <Text style={s.coverBrand}>Confidential</Text>
        </View>
      </Page>

      {/* ──── PAGE 2: EXECUTIVE SUMMARY ──── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Executive Summary</Text>
        <Text style={s.sectionSubtitle}>
          This compliance scan analyzed the submitted {contentTypeLabel(scan.content_type).toLowerCase()} content
          and assigned a score of {score}/100, indicating a "{scoreLabel(score)}" compliance posture.
          {flags.length > 0
            ? ` A total of ${flags.length} potential compliance issue${flags.length !== 1 ? "s were" : " was"} identified.`
            : " No compliance issues were identified in the scanned content."}
        </Text>

        <View style={s.summaryGrid}>
          <View style={s.summaryCard}>
            <Text style={s.summaryCardLabel}>Overall Score</Text>
            <Text style={[s.summaryCardValue, { color: scoreColor(score) }]}>{score}/100</Text>
            <Text style={s.summaryCardSub}>{scoreLabel(score)}</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryCardLabel}>Total Flags</Text>
            <Text style={s.summaryCardValue}>{flags.length}</Text>
            <Text style={s.summaryCardSub}>issue{flags.length !== 1 ? "s" : ""} found</Text>
          </View>
        </View>

        <View style={s.summaryGrid}>
          <View style={s.summaryCard}>
            <Text style={s.summaryCardLabel}>High Risk</Text>
            <Text style={[s.summaryCardValue, { color: highFlags.length > 0 ? COLORS.red : COLORS.darkGray }]}>
              {highFlags.length}
            </Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryCardLabel}>Medium Risk</Text>
            <Text style={[s.summaryCardValue, { color: medFlags.length > 0 ? COLORS.yellow : COLORS.darkGray }]}>
              {medFlags.length}
            </Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryCardLabel}>Low Risk</Text>
            <Text style={[s.summaryCardValue, { color: lowFlags.length > 0 ? COLORS.blue : COLORS.darkGray }]}>
              {lowFlags.length}
            </Text>
          </View>
        </View>

        <View style={s.disclaimerBox}>
          <Text style={s.disclaimerText}>
            This report is educational guidance only and does not constitute legal advice. It is intended to
            highlight potential compliance concerns based on FDA and FTC regulations for healthcare marketing.
            Always consult qualified healthcare marketing counsel before making final compliance decisions.
          </Text>
        </View>

        <PageFooter clinicName={clinicName} />
      </Page>

      {/* ──── PAGES 3+: DETAILED FINDINGS ──── */}
      {flags.length > 0 && (
        <Page size="A4" style={s.page} wrap>
          <Text style={s.sectionTitle}>Detailed Findings</Text>
          <Text style={s.sectionSubtitle}>
            Each flagged phrase is listed below with its risk level, the specific violation, reasoning,
            and a compliant alternative. Findings are grouped by risk severity.
          </Text>

          {highFlags.length > 0 && (
            <>
              <Text style={[s.riskGroupHeader, { color: COLORS.red }]}>
                High Risk ({highFlags.length})
              </Text>
              {highFlags.map((flag, i) => (
                <FlagDetail key={`h-${i}`} flag={flag} index={i} total={highFlags.length} />
              ))}
            </>
          )}

          {medFlags.length > 0 && (
            <>
              <Text style={[s.riskGroupHeader, { color: COLORS.yellow }]}>
                Medium Risk ({medFlags.length})
              </Text>
              {medFlags.map((flag, i) => (
                <FlagDetail key={`m-${i}`} flag={flag} index={i} total={medFlags.length} />
              ))}
            </>
          )}

          {lowFlags.length > 0 && (
            <>
              <Text style={[s.riskGroupHeader, { color: COLORS.blue }]}>
                Low Risk ({lowFlags.length})
              </Text>
              {lowFlags.map((flag, i) => (
                <FlagDetail key={`l-${i}`} flag={flag} index={i} total={lowFlags.length} />
              ))}
            </>
          )}

          <PageFooter clinicName={clinicName} />
        </Page>
      )}

      {/* ──── FINAL PAGE: RECOMMENDATIONS ──── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Recommendations</Text>

        <View style={s.recBox}>
          <Text style={s.recText}>
            {score >= 80
              ? "Your content shows strong compliance awareness. Address the minor issues noted above to further strengthen your regulatory posture. Regular compliance scanning is recommended as regulations and enforcement priorities evolve."
              : score >= 50
              ? "Several medium-risk issues were identified in your content. We recommend reviewing and rewriting the flagged sections before publishing. Pay particular attention to any high-risk flags, as these represent the most significant regulatory exposure."
              : "Critical compliance issues were found in your content. We strongly recommend a full content review with qualified healthcare marketing counsel before publishing. The flagged phrases represent significant regulatory risk under current FDA and FTC guidelines."}
          </Text>
        </View>

        <Text style={[s.sectionTitle, { fontSize: 12, marginTop: 24 }]}>Next Steps</Text>
        <View style={{ marginBottom: 16 }}>
          <Text style={[s.recText, { marginBottom: 6 }]}>
            1. Review each flagged phrase and its compliant alternative provided in this report.
          </Text>
          <Text style={[s.recText, { marginBottom: 6 }]}>
            2. Replace non-compliant language with the suggested alternatives or equivalent compliant phrasing.
          </Text>
          <Text style={[s.recText, { marginBottom: 6 }]}>
            3. Re-scan the updated content to verify compliance improvements.
          </Text>
          <Text style={[s.recText, { marginBottom: 6 }]}>
            4. Consult with qualified healthcare marketing counsel for any remaining questions.
          </Text>
        </View>

        <View style={s.divider} />

        <View style={s.disclaimerBox}>
          <Text style={s.disclaimerText}>
            DISCLAIMER: This compliance report is provided for educational and informational purposes only.
            It does not constitute legal advice, medical advice, or regulatory guidance. The analysis is based
            on publicly available FDA and FTC guidelines and may not reflect the most recent regulatory changes.
            RegenCompliance is not a law firm and does not provide legal services. Always consult with qualified
            healthcare marketing counsel and regulatory professionals before making compliance decisions.
          </Text>
        </View>

        <View style={{ marginTop: 30, alignItems: "center" }}>
          <View style={{ height: 2, width: 40, backgroundColor: COLORS.green, marginBottom: 10 }} />
          <Text style={{ fontSize: 10, color: COLORS.green, fontFamily: "Helvetica-Bold" }}>
            Powered by RegenCompliance
          </Text>
          <Text style={{ fontSize: 8, color: COLORS.lightGray, marginTop: 2 }}>
            compliance.regenportal.com
          </Text>
        </View>

        <PageFooter clinicName={clinicName} />
      </Page>
    </Document>
  )
}

/* ─── Flag detail component ──────────────────────────────── */
function FlagDetail({ flag, index, total }: { flag: ScanFlag; index: number; total: number }) {
  return (
    <View style={s.flagSection} wrap={false}>
      <View style={s.flagHeader}>
        <View style={[s.flagBadge, { backgroundColor: riskColor(flag.risk_level) }]}>
          <Text style={{ fontSize: 8, fontWeight: "bold", fontFamily: "Helvetica-Bold", color: COLORS.white }}>
            {flag.risk_level.toUpperCase()}
          </Text>
        </View>
        <Text style={s.flagNumber}>
          {index + 1} of {total}
        </Text>
      </View>
      <View style={s.flagBody}>
        <View style={s.flagRow}>
          <Text style={s.flagLabel}>Flagged Text:</Text>
          <Text style={[s.flagValue, { fontStyle: "italic" }]}>"{flag.matched_text}"</Text>
        </View>
        <View style={s.flagRow}>
          <Text style={s.flagLabel}>Violation:</Text>
          <Text style={s.flagValue}>{flag.banned_phrase}</Text>
        </View>
        <View style={s.flagRow}>
          <Text style={s.flagLabel}>Reason:</Text>
          <Text style={s.flagValue}>{flag.reason}</Text>
        </View>
        <View style={s.flagAltBox}>
          <Text style={s.flagAltLabel}>Compliant Alternative:</Text>
          <Text style={s.flagAltText}>{flag.alternative}</Text>
        </View>
      </View>
    </View>
  )
}

/* ─── SITE COMPLIANCE REPORT ─────────────────────────────── */
export interface SitePageData {
  id: string
  url: string
  title: string | null
  compliance_score: number | null
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  last_scanned_at: string | null
  flags?: ScanFlag[]
}

export interface SiteReportData {
  domain: string
  name: string | null
  compliance_score: number | null
  last_scanned_at: string | null
  pages: SitePageData[]
}

export function SitePdfDocument({
  site,
  clinicName,
}: {
  site: SiteReportData
  clinicName: string
}) {
  const pages = site.pages || []
  const scannedPages = pages.filter((p) => p.compliance_score !== null)
  const avgScore = site.compliance_score ?? (
    scannedPages.length > 0
      ? Math.round(scannedPages.reduce((sum, p) => sum + (p.compliance_score || 0), 0) / scannedPages.length)
      : 0
  )
  const issuePages = scannedPages.filter((p) => (p.compliance_score || 0) < 80)
  const cleanPages = scannedPages.filter((p) => (p.compliance_score || 0) >= 80)
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const siteName = site.name || site.domain

  return (
    <Document>
      {/* ──── COVER PAGE ──── */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverTop} />
        <View style={s.coverBody}>
          <Text style={s.coverTitle}>Site Compliance Report</Text>
          <Text style={s.coverSubtitle}>Full Website FDA/FTC Compliance Analysis</Text>

          <Text style={s.coverClinic}>{clinicName}</Text>
          <Text style={s.coverMeta}>Site: {siteName}</Text>
          <Text style={s.coverMeta}>Domain: {site.domain}</Text>
          <Text style={s.coverMeta}>Report Date: {dateStr}</Text>
          <Text style={s.coverMeta}>Pages Analyzed: {scannedPages.length}</Text>

          <View style={s.coverScoreSection}>
            <Text style={[s.coverScoreNumber, { color: scoreColor(avgScore) }]}>{avgScore}</Text>
            <Text style={s.coverScoreLabel}>Overall Site Score</Text>
            <Text style={[s.coverScoreInterpretation, { color: scoreColor(avgScore) }]}>
              {scoreLabel(avgScore)}
            </Text>
          </View>
        </View>
        <View style={s.coverFooter}>
          <View>
            <Text style={s.coverBrand}>Prepared by</Text>
            <Text style={s.coverBrandName}>RegenCompliance</Text>
            <Text style={s.coverBrand}>compliance.regenportal.com</Text>
          </View>
          <Text style={s.coverBrand}>Confidential</Text>
        </View>
      </Page>

      {/* ──── SUMMARY PAGE ──── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Site Overview</Text>
        <Text style={s.sectionSubtitle}>
          This report covers the compliance analysis for {site.domain}. A total of {pages.length} page{pages.length !== 1 ? "s were" : " was"}
          {" "}crawled, with {scannedPages.length} successfully scanned for compliance issues.
        </Text>

        <View style={s.summaryGrid}>
          <View style={s.summaryCard}>
            <Text style={s.summaryCardLabel}>Site Score</Text>
            <Text style={[s.summaryCardValue, { color: scoreColor(avgScore) }]}>{avgScore}/100</Text>
            <Text style={s.summaryCardSub}>{scoreLabel(avgScore)}</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryCardLabel}>Pages Scanned</Text>
            <Text style={s.summaryCardValue}>{scannedPages.length}</Text>
            <Text style={s.summaryCardSub}>of {pages.length} total</Text>
          </View>
        </View>

        <View style={s.summaryGrid}>
          <View style={s.summaryCard}>
            <Text style={s.summaryCardLabel}>Pages With Issues</Text>
            <Text style={[s.summaryCardValue, { color: issuePages.length > 0 ? COLORS.red : COLORS.darkGray }]}>
              {issuePages.length}
            </Text>
            <Text style={s.summaryCardSub}>score below 80</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryCardLabel}>Clean Pages</Text>
            <Text style={[s.summaryCardValue, { color: cleanPages.length > 0 ? COLORS.greenDark : COLORS.darkGray }]}>
              {cleanPages.length}
            </Text>
            <Text style={s.summaryCardSub}>score 80 or above</Text>
          </View>
        </View>

        <View style={s.disclaimerBox}>
          <Text style={s.disclaimerText}>
            This report is educational guidance only and does not constitute legal advice. Scores reflect
            automated analysis at time of scan and may not account for all regulatory requirements.
          </Text>
        </View>

        <PageFooter clinicName={clinicName} />
      </Page>

      {/* ──── PER-PAGE RESULTS ──── */}
      <Page size="A4" style={s.page} wrap>
        <Text style={s.sectionTitle}>Page-by-Page Results</Text>
        <Text style={s.sectionSubtitle}>
          Each scanned page is listed below with its compliance score, flag counts, and top issues identified.
        </Text>

        {scannedPages
          .sort((a, b) => (a.compliance_score || 0) - (b.compliance_score || 0))
          .map((pg, i) => {
            const pgScore = pg.compliance_score || 0
            const totalFlags = pg.high_risk_count + pg.medium_risk_count + pg.low_risk_count
            const truncUrl = pg.url.length > 80 ? pg.url.slice(0, 77) + "..." : pg.url

            return (
              <View key={i} style={s.sitePageSection} wrap={false}>
                <View style={s.sitePageHeader}>
                  <View style={{ flex: 1 }}>
                    {pg.title && (
                      <Text style={[s.sitePageUrl, { marginBottom: 2 }]}>{pg.title}</Text>
                    )}
                    <Text style={{ fontSize: 8, color: COLORS.medGray }}>{truncUrl}</Text>
                  </View>
                  <Text style={[s.sitePageScore, { color: scoreColor(pgScore) }]}>{pgScore}</Text>
                </View>
                <View style={s.sitePageBody}>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <Text style={{ fontSize: 8.5, color: COLORS.medGray }}>
                      {totalFlags} flag{totalFlags !== 1 ? "s" : ""}
                    </Text>
                    {pg.high_risk_count > 0 && (
                      <Text style={{ fontSize: 8.5, color: COLORS.red }}>
                        {pg.high_risk_count} high
                      </Text>
                    )}
                    {pg.medium_risk_count > 0 && (
                      <Text style={{ fontSize: 8.5, color: COLORS.yellow }}>
                        {pg.medium_risk_count} medium
                      </Text>
                    )}
                    {pg.low_risk_count > 0 && (
                      <Text style={{ fontSize: 8.5, color: COLORS.blue }}>
                        {pg.low_risk_count} low
                      </Text>
                    )}
                  </View>
                  {/* Top flags if available */}
                  {pg.flags && pg.flags.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      {pg.flags.slice(0, 3).map((flag, fi) => (
                        <View key={fi} style={[s.sitePageFlagRow, { alignItems: "flex-start" }]}>
                          <View style={[s.sitePageFlagBadge, { backgroundColor: riskColor(flag.risk_level) }]}>
                            <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: COLORS.white }}>
                              {flag.risk_level.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={s.sitePageFlagText}>"{flag.matched_text}"</Text>
                        </View>
                      ))}
                      {pg.flags.length > 3 && (
                        <Text style={{ fontSize: 8, color: COLORS.lightGray, marginTop: 2 }}>
                          + {pg.flags.length - 3} more flag{pg.flags.length - 3 !== 1 ? "s" : ""}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            )
          })}

        <PageFooter clinicName={clinicName} />
      </Page>

      {/* ──── RECOMMENDATIONS ──── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Recommendations</Text>

        <View style={s.recBox}>
          <Text style={s.recText}>
            {avgScore >= 80
              ? "Your website shows strong overall compliance awareness. Address the minor issues noted in the pages above to further strengthen your regulatory posture. Continue to monitor your content regularly as regulations evolve."
              : avgScore >= 50
              ? "Several pages on your website contain medium-risk compliance issues. We recommend prioritizing the lowest-scoring pages for review and rewriting flagged content before it remains published. Pay particular attention to any high-risk flags."
              : "Critical compliance issues were found across multiple pages on your website. We strongly recommend a comprehensive content audit with qualified healthcare marketing counsel. The flagged content represents significant regulatory risk under current FDA and FTC guidelines."}
          </Text>
        </View>

        <Text style={[s.sectionTitle, { fontSize: 12, marginTop: 24 }]}>Priority Actions</Text>
        <View style={{ marginBottom: 16 }}>
          <Text style={[s.recText, { marginBottom: 6 }]}>
            1. Start with the lowest-scoring pages - these carry the highest regulatory risk.
          </Text>
          <Text style={[s.recText, { marginBottom: 6 }]}>
            2. Review each flagged phrase and replace with compliant alternatives.
          </Text>
          <Text style={[s.recText, { marginBottom: 6 }]}>
            3. Re-scan individual pages after updating to verify compliance improvements.
          </Text>
          <Text style={[s.recText, { marginBottom: 6 }]}>
            4. Schedule regular site-wide scans to maintain ongoing compliance.
          </Text>
          <Text style={[s.recText, { marginBottom: 6 }]}>
            5. Consult with qualified healthcare marketing counsel for complex compliance questions.
          </Text>
        </View>

        <View style={s.divider} />

        <View style={s.disclaimerBox}>
          <Text style={s.disclaimerText}>
            DISCLAIMER: This compliance report is provided for educational and informational purposes only.
            It does not constitute legal advice, medical advice, or regulatory guidance. The analysis is based
            on publicly available FDA and FTC guidelines and may not reflect the most recent regulatory changes.
            RegenCompliance is not a law firm and does not provide legal services. Always consult with qualified
            healthcare marketing counsel and regulatory professionals before making compliance decisions.
          </Text>
        </View>

        <View style={{ marginTop: 30, alignItems: "center" }}>
          <View style={{ height: 2, width: 40, backgroundColor: COLORS.green, marginBottom: 10 }} />
          <Text style={{ fontSize: 10, color: COLORS.green, fontFamily: "Helvetica-Bold" }}>
            Powered by RegenCompliance
          </Text>
          <Text style={{ fontSize: 8, color: COLORS.lightGray, marginTop: 2 }}>
            compliance.regenportal.com
          </Text>
        </View>

        <PageFooter clinicName={clinicName} />
      </Page>
    </Document>
  )
}
