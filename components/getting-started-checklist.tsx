"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Shield,
  BarChart3,
  RefreshCw,
  Globe,
  Users,
  BookOpen,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface ChecklistState {
  first_scan?: boolean
  review_score?: boolean
  try_rewrite?: boolean
  add_site?: boolean
  invite_team?: boolean
  explore_library?: boolean
  dismissed?: boolean
  tutorial_completed?: boolean
}

const TASKS = [
  {
    key: "first_scan",
    title: "Run your first scan",
    description: "Paste content or enter a URL to check compliance",
    href: "/dashboard/scanner",
    icon: Shield,
  },
  {
    key: "review_score",
    title: "Review your compliance score",
    description: "See your score breakdown and flagged phrases",
    href: "/dashboard/history",
    icon: BarChart3,
  },
  {
    key: "try_rewrite",
    title: "Try an AI rewrite",
    description: "Let AI rewrite flagged content to be compliant",
    href: "/dashboard/scanner",
    icon: RefreshCw,
  },
  {
    key: "add_site",
    title: "Add your website for monitoring",
    description: "Get weekly automated compliance scans",
    href: "/dashboard/sites",
    icon: Globe,
  },
  {
    key: "invite_team",
    title: "Invite your team",
    description: "Collaborate on compliance with your team members",
    href: "/dashboard/account/team",
    icon: Users,
  },
  {
    key: "explore_library",
    title: "Browse enforcement actions",
    description: "Browse FDA/FTC enforcement actions and the phrases they flagged",
    href: "/dashboard/library",
    icon: BookOpen,
  },
] as const

interface GettingStartedChecklistProps {
  initialChecklist?: ChecklistState
}

export function GettingStartedChecklist({ initialChecklist }: GettingStartedChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistState>(initialChecklist || {})
  const [loading, setLoading] = useState(!initialChecklist)
  const [dismissed, setDismissed] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (initialChecklist) return
    async function load() {
      try {
        const res = await fetch("/api/onboarding-checklist")
        if (res.ok) {
          const data = await res.json()
          setChecklist(data.checklist)
          if (data.checklist.dismissed) setDismissed(true)
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initialChecklist])

  const completedCount = TASKS.filter(
    (t) => checklist[t.key as keyof ChecklistState]
  ).length
  const totalTasks = TASKS.length
  const allComplete = completedCount === totalTasks
  const progressPercent = Math.round((completedCount / totalTasks) * 100)

  async function handleDismiss() {
    setDismissed(true)
    try {
      await fetch("/api/onboarding-checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismissed: true }),
      })
    } catch {
      // silent
    }
  }

  async function markComplete(key: string) {
    const updated = { ...checklist, [key]: true }
    setChecklist(updated)
    try {
      await fetch("/api/onboarding-checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: true }),
      })
    } catch {
      // silent
    }
  }

  if (loading || dismissed || checklist.dismissed || allComplete) return null

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#55E039]/10 shrink-0">
            <Shield className="h-4 w-4 text-[#55E039]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">Getting Started</h3>
            <p className="text-xs text-white/40">
              {completedCount} of {totalTasks} complete
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs">
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#55E039] to-[#3BB82A] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#55E039] tabular-nums shrink-0">
            {progressPercent}%
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 ml-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2.5 sm:p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-2.5 sm:p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
            title="Dismiss checklist"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="sm:hidden px-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#55E039] to-[#3BB82A] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#55E039] tabular-nums">{progressPercent}%</span>
        </div>
      </div>

      {/* Tasks */}
      {!collapsed && (
        <div className="border-t border-white/[0.06] divide-y divide-white/[0.04]">
          {TASKS.map((task) => {
            const isComplete = !!checklist[task.key as keyof ChecklistState]
            const Icon = task.icon

            return (
              <Link
                key={task.key}
                href={task.href}
                onClick={() => {
                  if (task.key === "explore_library" && !isComplete) {
                    markComplete(task.key)
                  }
                }}
                className={`flex items-center gap-3 px-5 py-3 transition-all duration-200 group ${
                  isComplete
                    ? "opacity-50 hover:opacity-70"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-300 shrink-0 ${
                    isComplete
                      ? "bg-[#55E039]/10 border-[#55E039]/30"
                      : "border-white/10 bg-white/[0.03] group-hover:border-white/20"
                  }`}
                >
                  {isComplete && (
                    <Check className="h-3.5 w-3.5 text-[#55E039] animate-in zoom-in-50 duration-300" />
                  )}
                </div>

                {/* Icon */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                    isComplete
                      ? "bg-white/[0.04] text-white/30"
                      : "bg-white/[0.06] text-white/50 group-hover:text-white/70"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isComplete ? "text-white/40 line-through" : "text-white/80"
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-white/30 truncate">{task.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
