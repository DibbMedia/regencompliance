"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Library, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Action {
  id: string
  source_url: string
  source_type: string
  source_name: string
  source_date: string | null
  agency: string | null
  company_name: string | null
  product_or_treatment: string | null
  summary: string | null
  rule_count: number
  is_published: boolean
  created_at: string
}

export default function AdminLibraryPage() {
  const [filter, setFilter] = useState<"all" | "published" | "unpublished">("all")
  const query = filter === "all" ? "" : `?published=${filter === "published"}`
  const { data, isLoading } = useSWR<{ actions: Action[] }>(
    `/api/admin/enforcement-actions${query}`,
    fetcher,
  )

  async function togglePublish(a: Action) {
    await fetch(`/api/admin/enforcement-actions/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !a.is_published }),
    })
    mutate(`/api/admin/enforcement-actions${query}`)
  }

  const actions = data?.actions ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Enforcement Actions</h1>
          <p className="text-sm text-white/40 mt-1">
            All FDA / FTC / DOJ enforcement actions. Toggle publish to hide drafts from customers.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
          {(["all", "published", "unpublished"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                filter === f
                  ? "bg-[#55E039]/10 text-[#55E039] border border-[#55E039]/20"
                  : "text-white/60 hover:bg-white/[0.05] border border-transparent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-medium text-white/40">Agency</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Date</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Company</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Summary</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40 text-center">Rules</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40 text-center">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                  <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                </td>
              </tr>
            ) : actions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-white/40">
                  <Library className="h-6 w-6 mx-auto mb-2 text-white/20" />
                  No actions.
                </td>
              </tr>
            ) : (
              actions.map((a) => (
                <tr key={a.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white/80 text-xs font-mono">{a.agency ?? "-"}</td>
                  <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">
                    {a.source_date ? new Date(a.source_date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-white/80 max-w-[200px] truncate" title={a.company_name ?? undefined}>
                    {a.company_name ?? a.source_name}
                  </td>
                  <td className="px-4 py-3 text-white/60 max-w-[420px] text-xs line-clamp-2">
                    {a.summary ?? <span className="italic text-white/30">Missing summary</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-white/60">{a.rule_count}</td>
                  <td className="px-4 py-3 text-center">
                    {a.is_published ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#55E039]/20 bg-[#55E039]/10 px-2 py-0.5 text-[10px] font-medium text-[#55E039]">
                        <Eye className="h-3 w-3" /> published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/40">
                        <EyeOff className="h-3 w-3" /> hidden
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <a
                      href={a.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-[#55E039] mr-3"
                    >
                      <ExternalLink className="h-3 w-3" />
                      source
                    </a>
                    <button
                      onClick={() => togglePublish(a)}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/70 hover:bg-white/[0.08]"
                    >
                      {a.is_published ? "Unpublish" : "Publish"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card stack */}
      <div className="md:hidden space-y-2">
        {isLoading ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/55">
            <Loader2 className="h-5 w-5 mx-auto animate-spin" />
          </div>
        ) : actions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-10 px-6 text-center text-white/55">
            <Library className="h-6 w-6 mx-auto mb-2 text-white/30" />
            No actions.
          </div>
        ) : (
          actions.map((a) => (
            <div key={a.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/70">
                  {a.agency ?? "-"}
                </span>
                {a.is_published ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#55E039]/20 bg-[#55E039]/10 px-2 py-0.5 text-[10px] font-medium text-[#55E039]">
                    <Eye className="h-3 w-3" /> published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/55">
                    <EyeOff className="h-3 w-3" /> hidden
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-white">{a.company_name ?? a.source_name}</p>
              <p className="text-xs text-white/55 mt-1 line-clamp-3">
                {a.summary ?? <span className="italic text-white/40">Missing summary</span>}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/55">
                <span>
                  {a.source_date ? new Date(a.source_date).toLocaleDateString() : "-"} - {a.rule_count} rule{a.rule_count === 1 ? "" : "s"}
                </span>
                <div className="flex gap-2">
                  <a
                    href={a.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-white/70 hover:bg-white/[0.06]"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Source
                  </a>
                  <button
                    onClick={() => togglePublish(a)}
                    className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-white/70 hover:bg-white/[0.08]"
                  >
                    {a.is_published ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
