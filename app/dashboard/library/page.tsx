"use client"

import { useState } from "react"
import useSWR from "swr"
import { BookOpen, Search, ArrowRight, LayoutGrid, Table as TableIcon, X } from "lucide-react"
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
import type { ComplianceRule } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const RISK_COLORS = {
  high: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
}

export default function LibraryPage() {
  const [search, setSearch] = useState("")
  const [riskLevel, setRiskLevel] = useState("all")
  const [category, setCategory] = useState("all")
  const [treatment, setTreatment] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("library-disclaimer-dismissed") === "true"
    return false
  })

  const params = new URLSearchParams()
  if (riskLevel !== "all") params.set("risk_level", riskLevel)
  if (category !== "all") params.set("category", category)
  if (treatment !== "all") params.set("treatment", treatment)
  if (search) params.set("search", search)

  const { data, isLoading } = useSWR(`/api/library?${params}`, fetcher)
  const rules: ComplianceRule[] = data?.rules || []

  function dismissDisclaimer() {
    setDismissed(true)
    localStorage.setItem("library-disclaimer-dismissed", "true")
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Compliance Library</h2>
        <p className="text-muted-foreground">
          Live database of FDA/FTC-flagged phrases. Updated automatically.
        </p>
        {rules.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">{rules.length} rules tracked</p>
        )}
      </div>

      {!dismissed && (
        <div className="relative rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm">
          <button onClick={dismissDisclaimer} className="absolute top-2 right-2">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <p>
            Using this library for reference? Always have final content reviewed by a qualified
            healthcare marketing attorney. Educational only, not legal advice.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search phrases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v ?? "all")}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="health_claims">Health Claims</SelectItem>
            <SelectItem value="fda_approval">FDA Approval</SelectItem>
            <SelectItem value="efficacy">Efficacy</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
          </SelectContent>
        </Select>
        <Select value={treatment} onValueChange={(v) => setTreatment(v ?? "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Treatment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Treatments</SelectItem>
            <SelectItem value="prp">PRP</SelectItem>
            <SelectItem value="stem_cell">Stem Cell</SelectItem>
            <SelectItem value="exosomes">Exosomes</SelectItem>
            <SelectItem value="bmac">BMAC</SelectItem>
            <SelectItem value="whartons_jelly">Wharton&apos;s Jelly</SelectItem>
            <SelectItem value="prolotherapy">Prolotherapy</SelectItem>
            <SelectItem value="peptide">Peptide</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-4 opacity-30" />
            <p>No rules match your filters.</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <Card key={rule.id} className="relative">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-xs">{rule.category.replace("_", " ")}</Badge>
                  <Badge className={`text-xs uppercase ${RISK_COLORS[rule.risk_level]}`}>
                    {rule.risk_level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-red-500/10 px-2 py-1 text-sm text-red-700 dark:text-red-400 font-medium">
                    {rule.banned_phrase}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="rounded-md bg-green-500/10 px-2 py-1 text-sm text-green-700 dark:text-green-400">
                    {rule.compliant_alternative}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {rule.applies_to.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      {t.replace("_", " ")}
                    </Badge>
                  ))}
                  {rule.applies_to.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{rule.applies_to.length - 3}</Badge>
                  )}
                </div>
                {rule.source_url && (
                  <div className="text-xs text-muted-foreground">
                    <a href={rule.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {rule.source_name || "Source"} →
                    </a>
                    {rule.source_date && ` · ${new Date(rule.source_date).toLocaleDateString()}`}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk</TableHead>
                <TableHead>Banned Phrase</TableHead>
                <TableHead>Compliant Alternative</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Badge className={`text-xs uppercase ${RISK_COLORS[rule.risk_level]}`}>
                      {rule.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-red-700 dark:text-red-400 font-medium">
                    {rule.banned_phrase}
                  </TableCell>
                  <TableCell className="text-green-700 dark:text-green-400">
                    {rule.compliant_alternative}
                  </TableCell>
                  <TableCell>{rule.category.replace("_", " ")}</TableCell>
                  <TableCell className="text-xs">
                    {rule.source_url ? (
                      <a href={rule.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {rule.source_name || "Source"}
                      </a>
                    ) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
