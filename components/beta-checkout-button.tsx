"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface BetaCheckoutButtonProps {
  children: React.ReactNode
  className?: string
}

export function BetaCheckoutButton({ children, className }: BetaCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null)
  const [soldOut, setSoldOut] = useState(false)

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

  async function handleClick() {
    if (soldOut) return
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout-beta", { method: "POST" })
      const data = await res.json()

      if (res.status === 409) {
        setSoldOut(true)
        setSpotsRemaining(0)
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
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
          Redirecting...
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
