"use client"

import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Download, RefreshCw, Copy, Check } from "lucide-react"
import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Scan, ScanFlag } from "@/lib/types"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ScanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const { data: scan, isLoading } = useSWR<Scan>(`/api/scans/${id}`, fetcher)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!scan) {
    return <p className="text-muted-foreground">Scan not found.</p>
  }

  const flags = (scan.flags || []) as ScanFlag[]
  const scoreColor = (scan.compliance_score ?? 0) >= 80 ? "text-[#55E039]"
    : (scan.compliance_score ?? 0) >= 50 ? "text-yellow-500" : "text-red-500"

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={`text-4xl font-bold ${scoreColor}`}>{scan.compliance_score ?? "N/A"}</span>
        <div className="space-y-0.5">
          <p className="text-sm">{new Date(scan.created_at).toLocaleString()}</p>
          <div className="flex gap-2">
            <Badge variant="outline">{scan.content_type.replace("_", " ")}</Badge>
            {scan.scan_duration_ms && (
              <span className="text-xs text-muted-foreground">{scan.scan_duration_ms}ms</span>
            )}
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <a
            href={`/api/scans/${id}/export`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download className="mr-1 h-3 w-3" />
            Export PDF
          </a>
          <Link
            href={`/dashboard/scanner`}
            onClick={() => {
              // Store in sessionStorage for scanner to pick up
              if (typeof window !== "undefined") {
                sessionStorage.setItem("rescan_text", scan.original_text)
              }
            }}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Re-scan
          </Link>
        </div>
      </div>

      {/* Original text */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Original Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{scan.original_text}</p>
        </CardContent>
      </Card>

      {/* Flags */}
      {flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Flagged Content ({flags.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {flags.map((flag, i) => (
              <div key={i} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    &quot;{flag.matched_text}&quot;
                  </Badge>
                  <Badge
                    variant={flag.risk_level === "high" ? "destructive" : "secondary"}
                    className="text-xs uppercase"
                  >
                    {flag.risk_level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{flag.reason}</p>
                <p className="text-sm text-[#55E039] bg-[#55E039]/10 rounded-md p-2">
                  {flag.alternative}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rewrite */}
      {scan.rewritten_text && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Compliant Rewrite</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(scan.rewritten_text!)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{scan.rewritten_text}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
