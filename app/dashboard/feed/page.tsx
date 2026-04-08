"use client"

import useSWR from "swr"
import {
  Rss,
  Scale,
  AlertTriangle,
  Lightbulb,
  Megaphone,
  ExternalLink,
} from "lucide-react"
import type { FeedItem } from "@/app/api/feed/route"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const CATEGORY_CONFIG: Record<
  FeedItem["category"],
  { label: string; icon: typeof Rss; iconBg: string; iconColor: string; badgeBg: string; badgeText: string }
> = {
  rule_update: {
    label: "Rule Update",
    icon: Scale,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    badgeBg: "bg-blue-500/10 border-blue-500/20",
    badgeText: "text-blue-400",
  },
  enforcement: {
    label: "Enforcement Alert",
    icon: AlertTriangle,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    badgeBg: "bg-red-500/10 border-red-500/20",
    badgeText: "text-red-400",
  },
  tip: {
    label: "Tip",
    icon: Lightbulb,
    iconBg: "bg-[#55E039]/10",
    iconColor: "text-[#55E039]",
    badgeBg: "bg-[#55E039]/10 border-[#55E039]/20",
    badgeText: "text-[#55E039]",
  },
  announcement: {
    label: "Announcement",
    icon: Megaphone,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    badgeBg: "bg-purple-500/10 border-purple-500/20",
    badgeText: "text-purple-400",
  },
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function FeedCardSkeleton() {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
      <div className="flex gap-4">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-16 rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="h-5 w-3/4 rounded bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-full rounded bg-white/[0.04] animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-white/[0.04] animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function FeedCard({ item }: { item: FeedItem }) {
  const config = CATEGORY_CONFIG[item.category]
  const Icon = config.icon

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300">
      <div className="flex gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}>
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badgeBg} ${config.badgeText}`}>
              {config.label}
            </span>
            <span className="text-xs text-white/30">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">{item.title}</h3>
          <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
          {(item as any).source_url && (
            <a
              href={(item as any).source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#55E039]/70 hover:text-[#55E039] transition-colors mt-1"
            >
              <ExternalLink className="h-3 w-3" />
              View source
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FeedPage() {
  const { data, error, isLoading } = useSWR<{ items: FeedItem[] }>(
    "/api/feed",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">Updates</p>
        <h2 className="text-2xl font-bold text-white">Compliance Feed</h2>
        <p className="text-sm text-white/40 mt-1">
          Stay updated on FDA/FTC enforcement news and rule changes that affect your clinic.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <FeedCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-white/10 mx-auto mb-4" />
          <p className="text-sm text-white/40">Failed to load feed. Please try again later.</p>
        </div>
      )}

      {/* Empty */}
      {data && data.items.length === 0 && (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-12 text-center">
          <Rss className="h-12 w-12 text-white/10 mx-auto mb-4" />
          <p className="text-sm font-medium text-white/60">No compliance updates yet</p>
          <p className="text-xs text-white/30 mt-1">Check back soon for the latest FDA/FTC news and rule changes.</p>
        </div>
      )}

      {/* Feed Items */}
      {data && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
