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
  Globe,
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import {
  CONTENT_TEMPLATES,
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
    icon: Globe,
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
  service: "Website Pages",
  marketing: "Marketing Materials",
  ads: "Ads & Social Media",
}

const CATEGORY_DESCRIPTIONS: Record<TemplateCategory, string> = {
  service: "Compliance-ready service pages for your clinic website.",
  marketing: "Pre-written marketing copy for emails, landing pages, and brochures.",
  ads: "Short-form ad copy and social post templates for Meta, Google, TikTok.",
}

const SECTION_ORDER: TemplateCategory[] = ["service", "marketing", "ads"]

export default function TemplatesPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContentTemplate | null>(null)
  const [copied, setCopied] = useState(false)

  const groupedTemplates = useMemo(() => {
    const query = search.toLowerCase()
    const groups = new Map<TemplateCategory, ContentTemplate[]>()
    for (const t of CONTENT_TEMPLATES) {
      if (
        search &&
        !t.title.toLowerCase().includes(query) &&
        !t.description.toLowerCase().includes(query)
      ) {
        continue
      }
      const list = groups.get(t.category) ?? []
      list.push(t)
      groups.set(t.category, list)
    }
    return groups
  }, [search])

  const totalResults = useMemo(
    () => Array.from(groupedTemplates.values()).reduce((a, b) => a + b.length, 0),
    [groupedTemplates],
  )

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
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => setSelectedTemplate(null)}
          className="flex items-center gap-1.5 text-sm text-white/65 hover:text-white transition-colors"
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
              <span className="text-xs text-white/55">
                {selectedTemplate.wordCount} words
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              {selectedTemplate.title}
            </h1>
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

  // Sectioned view
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">
          Resources
        </p>
        <h1 className="text-3xl font-bold text-white inline-flex items-center gap-2">
          Content Templates
          <HelpTooltip text="Pre-written, compliance-ready marketing copy templates for your clinic website and marketing materials." />
        </h1>
        <p className="text-white/60 mt-1">
          Production-ready compliant copy for service pages, marketing materials, and ads.
        </p>
        <p className="text-xs text-white/55 mt-2 font-medium">
          {CONTENT_TEMPLATES.length} templates available
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/[0.03] border-white/10 text-white/80 placeholder:text-white/40 focus-visible:border-[#55E039]/30 focus-visible:ring-[#55E039]/10"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/60"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Sections */}
      {totalResults === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-5">
            <FileText className="h-8 w-8 text-white/35" />
          </div>
          <p className="text-white/80 font-medium mb-1">No templates match your search</p>
          <p className="text-white/60 text-sm">Try a different keyword or clear the search.</p>
        </div>
      ) : (
        SECTION_ORDER.map((category) => {
          const items = groupedTemplates.get(category)
          if (!items || items.length === 0) return null
          const style = CATEGORY_STYLES[category]
          const Icon = style.icon
          return (
            <section key={category} className="space-y-4">
              <div className="flex items-end justify-between gap-3 flex-wrap border-b border-white/[0.06] pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${style.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${style.text}`} />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {CATEGORY_LABELS[category]}
                    </h2>
                  </div>
                  <p className="text-sm text-white/65">
                    {CATEGORY_DESCRIPTIONS[category]}
                  </p>
                </div>
                <span className="text-xs font-medium text-white/60 shrink-0">
                  {items.length} template{items.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className="group text-left rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200 flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-[#55E039] transition-colors line-clamp-2">
                        {template.title}
                      </h3>
                      <span className="text-[10px] text-white/40 font-medium shrink-0 mt-0.5">
                        {template.wordCount}w
                      </span>
                    </div>
                    <p className="text-xs text-white/65 leading-relaxed line-clamp-2 flex-1">
                      {template.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-[10px] text-white/55 group-hover:text-[#55E039] transition-colors">
                      View template
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
