"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface BetaCheckoutButtonProps {
  children: React.ReactNode
  className?: string
}

export function BetaCheckoutButton({ children, className }: BetaCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Redirecting...")
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null)
  const [soldOut, setSoldOut] = useState(false)
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch("/api/beta/spots")
      .then((res) => res.json())
      .then((data) => {
        if (data.remaining !== undefined) {
          setSpotsRemaining(data.remaining)
          if (data.remaining <= 0) setSoldOut(true)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    return () => {
      if (slowTimer.current) clearTimeout(slowTimer.current)
    }
  }, [])

  async function handleClick() {
    if (soldOut) return
    setLoading(true)
    setLoadingText("Redirecting...")

    // If Stripe takes more than 2 seconds, update the message
    slowTimer.current = setTimeout(() => {
      setLoadingText("Preparing checkout...")
    }, 2000)

    try {
      const res = await fetch("/api/stripe/checkout-beta", { method: "POST" })
      const data = await res.json()

      if (res.status === 409) {
        setSoldOut(true)
        setSpotsRemaining(0)
        setLoading(false)
        toast.error("Beta spots are sold out.")
        return
      }

      if (data.url) {
        window.location.href = data.url
        // Keep loading state while redirecting to Stripe
      } else {
        if (slowTimer.current) clearTimeout(slowTimer.current)
        setLoading(false)
        toast.error("Failed to start checkout. Please try again.")
      }
    } catch {
      if (slowTimer.current) clearTimeout(slowTimer.current)
      setLoading(false)
      toast.error("Something went wrong. Please try again.")
    }
  }

  if (soldOut) {
    return (
      <button disabled className={className} style={{ opacity: 0.5, cursor: "not-allowed" }}>
        Beta Sold Out
      </button>
    )
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}

export function BetaSpotsCounter({ className }: { className?: string }) {
  const [spots, setSpots] = useState<{ remaining: number; total: number } | null>(null)

  useEffect(() => {
    fetch("/api/beta/spots")
      .then((res) => res.json())
      .then((data) => {
        if (data.remaining !== undefined) {
          setSpots({ remaining: data.remaining, total: data.total })
        }
      })
      .catch(() => {})
  }, [])

  if (!spots) return null

  if (spots.remaining <= 0) {
    return (
      <span className={className}>
        All {spots.total} beta spots claimed!
      </span>
    )
  }

  return (
    <span className={className}>
      Only {spots.remaining} of {spots.total} beta spots left!
    </span>
  )
}
