"use client"

import { useState } from "react"
import { Shield, FileSearch, RefreshCw, Globe } from "lucide-react"

interface TutorialModalProps {
  onComplete: () => void
}

const STEPS = [
  {
    icon: Shield,
    title: "Welcome to RegenCompliance",
    description:
      "Your compliance scanner is ready. Here's how to get the most out of it.",
    illustration: "shield",
  },
  {
    icon: FileSearch,
    title: "Scan Your Content",
    description:
      "Paste marketing text, enter a URL, or upload a document. Our AI checks it against 300+ FDA/FTC rules.",
    illustration: "scanner",
  },
  {
    icon: RefreshCw,
    title: "Review & Rewrite",
    description:
      "Get a compliance score, see flagged phrases, and rewrite them with one click.",
    illustration: "score",
  },
  {
    icon: Globe,
    title: "Monitor Your Sites",
    description:
      "Add your website for weekly automated compliance scans. Get notified when something needs attention.",
    illustration: "globe",
  },
]

function StepIllustration({ type }: { type: string }) {
  if (type === "shield") {
    return (
      <div className="relative flex items-center justify-center h-40">
        <div className="absolute w-24 h-24 rounded-full bg-[#55E039]/10 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#55E039]/20 to-[#3BB82A]/10 border border-[#55E039]/20 shadow-[0_0_40px_rgba(85,224,57,0.15)]">
          <Shield className="h-10 w-10 text-[#55E039]" />
        </div>
      </div>
    )
  }

  if (type === "scanner") {
    return (
      <div className="relative flex items-center justify-center h-40">
        <div className="w-56 space-y-2">
          <div className="h-3 rounded-full bg-white/[0.06] w-full" />
          <div className="h-3 rounded-full bg-white/[0.06] w-4/5" />
          <div className="h-3 rounded-full bg-white/[0.06] w-11/12" />
          <div className="mt-3 flex gap-2">
            <div className="h-6 rounded-md bg-red-500/10 border border-red-500/20 px-2 flex items-center">
              <span className="text-[9px] text-red-400 font-bold">FLAGGED</span>
            </div>
            <div className="h-6 rounded-md bg-yellow-500/10 border border-yellow-500/20 px-2 flex items-center">
              <span className="text-[9px] text-yellow-400 font-bold">WARNING</span>
            </div>
            <div className="h-6 rounded-md bg-[#55E039]/10 border border-[#55E039]/20 px-2 flex items-center">
              <span className="text-[9px] text-[#55E039] font-bold">OK</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === "score") {
    return (
      <div className="relative flex items-center justify-center h-40">
        <div className="absolute w-20 h-20 rounded-full bg-[#55E039]/10 blur-2xl" />
        <svg className="w-24 h-24 -rotate-90 relative z-10" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="6" className="stroke-white/[0.06]" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            stroke="#55E039"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * 0.15}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute z-10 flex flex-col items-center">
          <span className="text-2xl font-bold text-[#55E039]">85</span>
          <span className="text-[8px] font-medium text-white/40 uppercase tracking-widest">Score</span>
        </div>
      </div>
    )
  }

  // globe
  return (
    <div className="relative flex items-center justify-center h-40">
      <div className="absolute w-24 h-24 rounded-full bg-blue-500/10 blur-2xl" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <Globe className="h-10 w-10 text-blue-400" />
      </div>
    </div>
  )
}

export function TutorialModal({ onComplete }: TutorialModalProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  async function finish() {
    try {
      await fetch("/api/onboarding-checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorial_completed: true }),
      })
    } catch {
      // silent
    }
    onComplete()
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      finish()
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-white/10 bg-[#111111] shadow-[0_0_80px_rgba(85,224,57,0.08)] overflow-hidden">
        {/* Illustration */}
        <div className="px-8 pt-8">
          <StepIllustration type={current.illustration} />
        </div>

        {/* Content */}
        <div className="px-8 pb-2 text-center">
          <h3 className="text-xl font-bold text-white mb-2">{current.title}</h3>
          <p className="text-sm text-white/60 leading-relaxed max-w-sm mx-auto">
            {current.description}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 py-5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-[#55E039]"
                  : i < step
                  ? "w-2 bg-[#55E039]/40"
                  : "w-2 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <div>
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                Back
              </button>
            ) : (
              <button
                onClick={finish}
                className="text-sm text-white/55 hover:text-white transition-colors"
              >
                Skip Tutorial
              </button>
            )}
          </div>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-sm font-semibold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_25px_rgba(85,224,57,0.45)] hover:brightness-110 transition-all"
          >
            {step === STEPS.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}
