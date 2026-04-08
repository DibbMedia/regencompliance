"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CheckoutButtonProps {
  children: React.ReactNode
  className?: string
}

export function CheckoutButton({ children, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Redirecting...")
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (slowTimer.current) clearTimeout(slowTimer.current)
    }
  }, [])

  async function handleClick() {
    setLoading(true)
    setLoadingText("Redirecting...")

    // If Stripe takes more than 2 seconds, update the message
    slowTimer.current = setTimeout(() => {
      setLoadingText("Preparing checkout...")
    }, 2000)

    try {
      const res = await fetch("/api/stripe/checkout-guest", { method: "POST" })
      const data = await res.json()
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
