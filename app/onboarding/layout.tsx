import { Shield } from "lucide-react"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#55E039] to-[#3BB82A] shadow-[0_0_20px_rgba(85,224,57,0.2)]">
            <Shield className="h-4.5 w-4.5 text-[#0a0a0a]" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Regen<span className="text-[#55E039]">Compliance</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
