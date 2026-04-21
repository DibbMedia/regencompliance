import type { ReactNode } from "react"
import { AlertTriangle, Info, ShieldCheck, CheckCircle2, XCircle } from "lucide-react"

export function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-14 mb-5 scroll-mt-24 text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
    >
      {children}
    </h2>
  )
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3
      id={id}
      className="mt-10 mb-3 scroll-mt-24 text-xl font-bold tracking-tight text-white"
    >
      {children}
    </h3>
  )
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[17px] leading-[1.75] text-white/80">{children}</p>
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 text-[19px] leading-[1.7] text-white/85 font-medium">
      {children}
    </p>
  )
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-5 space-y-2.5 text-[17px] leading-[1.7] text-white/80 list-disc pl-6 marker:text-[#55E039]/60">
      {children}
    </ul>
  )
}

export function OL({ children }: { children: ReactNode }) {
  return (
    <ol className="mt-5 space-y-2.5 text-[17px] leading-[1.7] text-white/80 list-decimal pl-6 marker:text-[#55E039]/80 marker:font-bold">
      {children}
    </ol>
  )
}

export function LI({ children }: { children: ReactNode }) {
  return <li className="pl-1">{children}</li>
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-bold text-white">{children}</strong>
}

export function Em({ children }: { children: ReactNode }) {
  return <em className="italic text-white/90">{children}</em>
}

export function BQ({ children }: { children: ReactNode }) {
  return (
    <blockquote className="mt-7 border-l-2 border-[#55E039]/60 bg-[#55E039]/[0.04] pl-6 pr-5 py-4 rounded-r-xl text-[17px] leading-[1.7] text-white/85 italic">
      {children}
    </blockquote>
  )
}

type CalloutVariant = "info" | "warn" | "danger" | "success"
const CALLOUT_CONFIG: Record<CalloutVariant, { ring: string; bg: string; icon: typeof Info; iconColor: string; titleColor: string }> = {
  info: {
    ring: "border-[#89E3E4]/25",
    bg: "bg-[#89E3E4]/[0.06]",
    icon: Info,
    iconColor: "text-[#89E3E4]",
    titleColor: "text-[#89E3E4]",
  },
  warn: {
    ring: "border-amber-400/30",
    bg: "bg-amber-400/[0.06]",
    icon: AlertTriangle,
    iconColor: "text-amber-300",
    titleColor: "text-amber-300",
  },
  danger: {
    ring: "border-red-500/30",
    bg: "bg-red-500/[0.06]",
    icon: XCircle,
    iconColor: "text-red-400",
    titleColor: "text-red-400",
  },
  success: {
    ring: "border-[#55E039]/30",
    bg: "bg-[#55E039]/[0.06]",
    icon: ShieldCheck,
    iconColor: "text-[#55E039]",
    titleColor: "text-[#55E039]",
  },
}

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: CalloutVariant
  title?: string
  children: ReactNode
}) {
  const config = CALLOUT_CONFIG[variant]
  const Icon = config.icon
  return (
    <aside
      role="note"
      className={`mt-8 rounded-2xl border ${config.ring} ${config.bg} px-6 py-5`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} aria-hidden />
        <div className="flex-1">
          {title && (
            <p className={`text-sm font-bold tracking-wide uppercase mb-2 ${config.titleColor}`}>
              {title}
            </p>
          )}
          <div className="text-[16px] leading-[1.65] text-white/80 [&_p]:mt-2 [&_p:first-child]:mt-0">
            {children}
          </div>
        </div>
      </div>
    </aside>
  )
}

export function BeforeAfter({
  bad,
  good,
  reason,
}: {
  bad: string
  good: string
  reason?: string
}) {
  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-red-400" aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-400">
              Non-compliant
            </span>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/90">&ldquo;{bad}&rdquo;</p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-[#55E039]" aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]">
              Compliant alternative
            </span>
          </div>
          <p className="text-[15px] leading-[1.6] text-white/90">&ldquo;{good}&rdquo;</p>
        </div>
      </div>
      {reason && (
        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3">
          <p className="text-[13px] text-white/65 leading-relaxed">
            <span className="font-semibold text-white/80">Why: </span>
            {reason}
          </p>
        </div>
      )}
    </div>
  )
}

export function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-red-400">{value}</p>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-white/70">{label}</p>
      {sub && <p className="mt-3 text-[15px] text-white/65 leading-relaxed">{sub}</p>}
    </div>
  )
}

export function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <aside className="mt-10 rounded-2xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-6 py-6 sm:px-8 sm:py-7">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039] mb-4">
        Key Takeaways
      </p>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#55E039]" aria-hidden />
            <span className="text-[15px] leading-[1.6] text-white/85">{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
