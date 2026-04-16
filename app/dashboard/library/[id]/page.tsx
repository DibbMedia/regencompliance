"use client"

import Link from "next/link"
import useSWR from "swr"
import { use } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Building2,
  Calendar,
  FileText,
  AlertTriangle,
} from "lucide-react"
import type { EnforcementActionWithRules, ComplianceRule } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const RISK_STYLES: Record<string, { badge: string; dot: string }> = {
  high: {
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-500",
  },
  medium: {
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    dot: "bg-yellow-500",
  },
  low: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
  },
}

const AGENCY_STYLES: Record<string, string> = {
  FDA: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FTC: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DOJ: "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  fda_warning: "FDA Warning Letter",
  fda_483: "FDA 483 Observation",
  fda_cber: "FDA CBER",
  ftc_press: "FTC Press Release",
  ftc_guidance: "FTC Guidance",
  doj_fraud: "DOJ Healthcare Fraud",
  manual: "Manual Entry",
}

function formatDate(date: string | null): string {
  if (!date) return "Date unknown"
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function LibraryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data, isLoading, error } = useSWR<{ action: EnforcementActionWithRules }>(
    `/api/library/${id}`,
    fetcher,
  )

  const action = data?.action

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/library"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-[#55E039] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Enforcement Actions
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 rounded-xl border border-white/10 bg-white/[0.03] animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl border border-white/10 bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        </div>
      ) : error || !action ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-5">
            <AlertTriangle className="h-8 w-8 text-white/20" />
          </div>
          <p className="text-white/50 font-medium mb-1">Enforcement action not found</p>
          <p className="text-white/30 text-sm">
            The action you&apos;re looking for may have been removed or is not yet published.
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {action.agency && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    AGENCY_STYLES[action.agency] || "bg-white/[0.04] text-white/40 border-white/10"
                  }`}
                >
                  {action.agency}
                </span>
              )}
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider border border-white/10 bg-white/[0.04] text-white/50">
                {SOURCE_TYPE_LABELS[action.source_type] || action.source_name}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-white/40">
                <Calendar className="h-3 w-3" />
                {formatDate(action.source_date)}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white inline-flex items-center gap-2">
                <Building2 className="h-6 w-6 text-white/40" />
                {action.company_name || action.source_name}
              </h1>
              {action.product_or_treatment && (
                <p className="text-sm text-white/50">{action.product_or_treatment}</p>
              )}
            </div>

            {action.summary ? (
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Summary</p>
                <p className="text-sm text-white/75 leading-relaxed">{action.summary}</p>
              </div>
            ) : (
              <div className="rounded-lg bg-white/[0.02] border border-dashed border-white/[0.08] p-4">
                <p className="text-xs text-white/45 italic">
                  No AI summary available for this action — review the source document and the cited
                  violations below.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/[0.04]">
              <a
                href={action.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-white/[0.04] text-white/70 hover:text-[#55E039] hover:border-[#55E039]/30 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View source document
              </a>
              <span className="text-xs text-white/40 inline-flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {action.compliance_rules?.length || 0} cited violation{(action.compliance_rules?.length || 0) === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Rules */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Cited Violations</h2>
            {(!action.compliance_rules || action.compliance_rules.length === 0) ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
                <p className="text-white/40 text-sm">No phrase-level rules linked to this action yet.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06] overflow-hidden">
                {action.compliance_rules.map((rule: ComplianceRule) => {
                  const riskStyle = RISK_STYLES[rule.risk_level] || RISK_STYLES.low
                  return (
                    <div
                      key={rule.id}
                      className="flex items-stretch hover:bg-white/[0.03] transition-colors duration-200"
                    >
                      <div className={`w-1 shrink-0 ${riskStyle.dot}`} />
                      <div className="flex-1 p-4 sm:p-5 space-y-3 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskStyle.badge}`}>
                            {rule.risk_level}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-white/10 bg-white/[0.04] text-white/50">
                            {rule.category.replace("_", " ")}
                          </span>
                          {rule.applies_to.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-white/[0.06] bg-white/[0.02] text-white/40"
                            >
                              {t.replace("_", " ")}
                            </span>
                          ))}
                          {rule.applies_to.length > 4 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-white/[0.06] bg-white/[0.02] text-white/30">
                              +{rule.applies_to.length - 4}
                            </span>
                          )}
                        </div>

                        <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                          <div className="rounded-lg bg-red-500/[0.06] border border-red-500/10 px-3 py-2 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-red-400/70 mb-1">Banned</p>
                            <p className="text-sm font-medium text-red-400 break-words">{rule.banned_phrase}</p>
                          </div>
                          <div className="hidden sm:flex items-center justify-center">
                            <ArrowRight className="h-4 w-4 text-white/20" />
                          </div>
                          <div className="flex sm:hidden justify-center">
                            <ArrowRight className="h-3.5 w-3.5 text-white/20 rotate-90" />
                          </div>
                          <div className="rounded-lg bg-[#55E039]/[0.04] border border-[#55E039]/10 px-3 py-2 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#55E039]/70 mb-1">Use Instead</p>
                            <p className="text-sm text-[#55E039] break-words">{rule.compliant_alternative}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
