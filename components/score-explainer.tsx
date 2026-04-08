"use client"

export function ScoreExplainer({ score }: { score: number }) {
  let label: string

  if (score >= 90) {
    label = "Excellent — minimal compliance risk"
  } else if (score >= 80) {
    label = "Good — minor issues to review"
  } else if (score >= 60) {
    label = "Needs attention — medium-risk violations found"
  } else if (score >= 40) {
    label = "High risk — significant compliance issues"
  } else {
    label = "Critical — multiple serious violations requiring immediate action"
  }

  return (
    <p className="text-xs text-white/40 italic">{label}</p>
  )
}
