"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  Search,
  Copy,
  Check,
  Shield,
  X,
  Megaphone,
  Share2,
  ArrowRight,
  ChevronLeft,
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import {
  CONTENT_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type ContentTemplate,
  type TemplateCategory,
} from "@/lib/content-templates"

const CATEGORY_STYLES: Record<
  TemplateCategory,
  { bg: string; text: string; icon: typeof FileText }
> = {
  service: {
    bg: "bg-[#55E039]/10 border-[#55E039]/20",
    text: "text-[#55E039]",
    icon: FileText,
  },
  marketing: {
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-400",
    icon: Share2,
  },
  ads: {
    bg: "bg-purple-500/10 border-purple-500/20",
    text: "text-purple-400",
    icon: Megaphone,
  },
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  service: "Service Page",
  marketing: "Marketing",
  ads: "Ads & Social",
}

export default function TemplatesPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContentTemplate | null>(null)
  const [copied, setCopied] = useState(false)

  const filtered = useMemo(() => {
    return CONTENT_TEMPLATES.filter((t) => {
      const matchesCategory =
        categoryFilter === "all" || t.category === categoryFilter
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, categoryFilter])

  async function copyContent(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Template copied to clipboard!")
    } catch {
      toast.error("Failed to copy")
    }
  }

  function scanTemplate(content: string) {
    const encoded = encodeURIComponent(content)
    router.push(`/dashboard/scanner?prefill=${encoded}`)
  }

  // Expanded template view
  if (selectedTemplate) {
    const style = CATEGORY_STYLES[selectedTemplate.category]
    return (
      <div className="p-6 space-y-6">
        {/* Back */}
        <button
          onClick={() => setSelectedTemplate(null)}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Templates
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={`${style.bg} ${style.text} border text-xs`}
              >
                {CATEGORY_LABELS[selectedTemplate.category]}
              </Badge>
              <span className="text-xs text-white/30">
                {selectedTemplate.wordCount} words
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {selectedTemplate.title}
            </h2>
            <p className="text-white/60 mt-1">
              {selectedTemplate.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => copyContent(selectedTemplate.content)}
              variant="outline"
              size="sm"
              className="border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy to Clipboard
                </>
              )}
            </Button>
            <Button
              onClick={() => scanTemplate(selectedTemplate.content)}
              size="sm"
              className="bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-semibold hover:opacity-90"
            >
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Scan This Template
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <pre className="whitespace-pre-wrap text-sm text-white/70 leading-relaxed font-sans">
            {selectedTemplate.content.split(/(\[.*?\])/).map((part, i) =>
              part.startsWith("[") && part.endsWith("]") ? (
                <span
                  key={i}
                  className="bg-[#55E039]/10 text-[#55E039] px-1 rounded font-medium"
                >
                  {part}
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </pre>
        </div>

        {/* Notes */}
        <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/10 p-5">
          <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">
            Customization Notes
          </h4>
          <p className="text-sm text-white/60 leading-relaxed">
            {selectedTemplate.notes}
          </p>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">
          Resources
        </p>
        <h2 className="text-2xl font-bold text-white inline-flex items-center gap-2">
          Content Templates
          <HelpTooltip text="Pre-written, compliance-ready marketing copy templates for your clinic website and marketing materials." />
        </h2>
        <p className="text-white/60 mt-1">
          Production-ready compliant copy for service pages, marketing
          materials, and ads.
        </p>
        <p className="text-xs text-white/30 mt-2 font-medium">
          {CONTENT_TEMPLATES.length} templates available
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === cat.value
                  ? "bg-[#55E039]/10 text-[#55E039] border border-[#55E039]/20"
                  : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60 hover:bg-white/[0.06]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-10 w-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm">
            No templates found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => {
            const style = CATEGORY_STYLES[template.category]
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className="group text-left rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant="outline"
                    className={`${style.bg} ${style.text} border text-[10px]`}
                  >
                    {CATEGORY_LABELS[template.category]}
                  </Badge>
                  <span className="text-[10px] text-white/25 font-medium">
                    {template.wordCount} words
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#55E039] transition-colors">
                  {template.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
                  {template.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] text-white/25 group-hover:text-[#55E039]/60 transition-colors">
                  View template
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
