"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function NavigationProgress() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // The whole point of this component is to flash a progress bar on
    // navigation - that requires setState immediately when pathname
    // changes. The 500ms timer below clears the cascade naturally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-0.5">
      <div className="h-full bg-gradient-to-r from-[#55E039] to-[#3BB82A] animate-[progress_0.5s_ease-in-out]" />
    </div>
  )
}
