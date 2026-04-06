"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Clock, Search, RefreshCw, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Scan } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <Badge variant="outline">N/A</Badge>
  const color = score >= 80 ? "bg-green-500/10 text-green-700 dark:text-green-400"
    : score >= 50 ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
    : "bg-red-500/10 text-red-700 dark:text-red-400"
  return <Badge variant="outline" className={color}>{score}</Badge>
}

export default function HistoryPage() {
  const [page, setPage] = useState(1)
  const [contentType, setContentType] = useState("all")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  const params = new URLSearchParams({ page: String(page), limit: "20" })
  if (contentType !== "all") params.set("content_type", contentType)
  if (search) params.set("search", search)

  const { data, isLoading } = useSWR(`/api/scans?${params}`, fetcher)
  const scans: Scan[] = data?.scans || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Scan History</h2>
        <p className="text-muted-foreground">View all past compliance scans.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1) } }}
            className="pl-8"
          />
        </div>
        <Select value={contentType} onValueChange={(v) => { setContentType(v ?? "all"); setPage(1) }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="website_copy">Website Copy</SelectItem>
            <SelectItem value="social_post">Social Post</SelectItem>
            <SelectItem value="ad_copy">Ad Copy</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="script">Script</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : scans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mb-4 opacity-30" />
            <p>No scans yet. Head to the Scanner to check your first piece of content.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="whitespace-nowrap" title={new Date(scan.created_at).toLocaleString()}>
                      {timeAgo(scan.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {scan.content_type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ScoreBadge score={scan.compliance_score} />
                    </TableCell>
                    <TableCell>{scan.flag_count}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {scan.original_text.slice(0, 80)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link
                          href={`/dashboard/history/${scan.id}`}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7")}
                        >
                          <Eye className="h-3 w-3" />
                        </Link>
                        <Link
                          href={`/dashboard/scanner?text=${encodeURIComponent(scan.original_text)}`}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7")}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
