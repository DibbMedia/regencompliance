"use client"

import useSWR from "swr"
import {
  Newspaper,
  Scale,
  AlertTriangle,
  Lightbulb,
  Megaphone,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { FeedItem } from "@/app/api/feed/route"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const CATEGORY_CONFIG: Record<
  FeedItem["category"],
  { label: string; icon: typeof Newspaper; colorClass: string; badgeClass: string }
> = {
  rule_update: {
    label: "Rule Update",
    icon: Scale,
    colorClass: "text-blue-600 dark:text-blue-400",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  enforcement: {
    label: "Enforcement Alert",
    icon: AlertTriangle,
    colorClass: "text-red-600 dark:text-red-400",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
  },
  tip: {
    label: "Tip",
    icon: Lightbulb,
    colorClass: "text-[#55E039]",
    badgeClass: "bg-[#55E039]/10 text-[#55E039] border-[#55E039]/20",
  },
  announcement: {
    label: "Announcement",
    icon: Megaphone,
    colorClass: "text-purple-600 dark:text-purple-400",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
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
    <Card>
      <CardContent className="flex gap-4 py-1">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  )
}

function FeedCard({ item }: { item: FeedItem }) {
  const config = CATEGORY_CONFIG[item.category]
  const Icon = config.icon

  return (
    <Card>
      <CardContent className="flex gap-4 py-1">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted ${config.colorClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}
            >
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>
          <h3 className="font-medium leading-snug">{item.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.body}
          </p>
        </div>
      </CardContent>
    </Card>
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
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper className="h-6 w-6" />
          News Feed
        </h2>
        <p className="text-muted-foreground">
          Stay updated on FDA/FTC enforcement news, compliance rule changes, and
          best practices for regenerative medicine marketing.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <FeedCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mb-4 opacity-20" />
            <p>Failed to load feed. Please try again later.</p>
          </CardContent>
        </Card>
      )}

      {data && data.items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
            <Newspaper className="h-12 w-12 mb-4 opacity-20" />
            <p>No feed items yet. Check back soon!</p>
          </CardContent>
        </Card>
      )}

      {data && data.items.length > 0 && (
        <div className="space-y-4">
          {data.items.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
