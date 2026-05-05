import { BrandIcon } from "@/components/brand-icon"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-6 sm:py-12">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <BrandIcon className="h-9 w-9" />
          <span className="text-lg font-bold text-white tracking-tight">
            Regen<span className="text-[#55E039]">Compliance</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
