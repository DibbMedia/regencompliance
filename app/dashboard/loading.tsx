export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
      {/* Welcome skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-36 rounded-lg bg-white/[0.04]" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-xl bg-white/[0.06]" />
          <div className="h-10 w-24 rounded-xl bg-white/[0.04]" />
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-white/[0.06]" />
              <div className="h-3 w-16 rounded bg-white/[0.04]" />
            </div>
            <div className="h-7 w-14 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>

      {/* Health bar skeleton */}
      <div className="rounded-xl bg-white/[0.03] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-white/[0.06]" />
            <div className="h-3 w-40 rounded bg-white/[0.04]" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/[0.06]" />
        </div>
        <div className="h-2 w-full rounded-full bg-white/[0.06]" />
      </div>

      {/* Recent scans skeleton */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-24 rounded bg-white/[0.06]" />
          <div className="h-3 w-16 rounded bg-white/[0.04]" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <div className="h-9 w-9 rounded-lg bg-white/[0.06]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-white/[0.06]" />
                <div className="h-3 w-24 rounded bg-white/[0.04]" />
              </div>
              <div className="h-6 w-10 rounded-full bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
