"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import { BrandIcon } from "@/components/brand-icon"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"
import { MarketingBg } from "@/components/marketing-bg"
import Link from "next/link"

const resetPasswordSchema = z.object({
  password: z.string()
    .min(12, "Password must be at least 12 characters.")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
})

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [sessionError, setSessionError] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  useEffect(() => {
    let cancelled = false
    let fallback: ReturnType<typeof setTimeout> | null = null

    const finalizeReady = () => {
      if (cancelled) return
      if (fallback) {
        clearTimeout(fallback)
        fallback = null
      }
      setReady(true)
    }

    // Supabase processes the recovery token from the URL hash and emits
    // PASSWORD_RECOVERY when the session is ready. Listen for that AND
    // poll getSession in case the user reloaded post-recovery.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "INITIAL_SESSION" && session)) {
        finalizeReady()
      }
    })

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) finalizeReady()
    })

    // Long fallback: if the hash hasn't processed in 8 seconds (slow
    // network, broken JS), THEN show the invalid-link state. Old code
    // bailed at 2s which flickered "Invalid link" on slow connections.
    fallback = setTimeout(() => {
      if (cancelled) return
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) return
        if (session) finalizeReady()
        else setSessionError(true)
      })
    }, 8000)

    return () => {
      cancelled = true
      if (fallback) clearTimeout(fallback)
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  async function handleSubmit(data: ResetPasswordInput) {
    setLoading(true)
    // Server proxy runs HIBP breach check + per-IP rate limit + revokes other
    // sessions. The recovery session set by the URL hash is read from cookies.
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: data.password }),
    })
    const body = await res.json().catch(() => ({}))

    setLoading(false)

    if (!res.ok) {
      if (res.status === 429) {
        toast.error("Too many requests. Please wait a few minutes and try again.")
      } else {
        toast.error(body?.error || "Failed to reset password. Please try again.")
      }
      return
    }

    setSuccess(true)
    toast.success("Password updated successfully!")
    setTimeout(() => router.push("/login"), 3000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden flex items-center justify-center px-3 sm:px-4">
      <MarketingBg />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <BrandIcon className="h-10 w-10" />
          <span className="text-xl font-bold text-white">RegenCompliance</span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm p-7">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-10 w-10 text-[#55E039]" />
              </div>
              <h1 className="text-xl font-bold text-white">Password updated</h1>
              <p className="text-sm text-white/60 leading-relaxed">
                Your password has been reset. Redirecting to login...
              </p>
              <Loader2 className="h-5 w-5 animate-spin text-[#55E039] mx-auto" />
            </div>
          ) : sessionError ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="h-10 w-10 text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Invalid or expired link</h1>
              <p className="text-sm text-white/60 leading-relaxed">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block text-sm text-[#55E039]/80 hover:text-[#55E039] transition-colors mt-2"
              >
                Request new reset link
              </Link>
            </div>
          ) : !ready ? (
            <div className="text-center space-y-4">
              <Loader2 className="h-6 w-6 animate-spin text-[#55E039] mx-auto" />
              <p className="text-sm text-white/60">Verifying reset link...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <h1 className="text-xl font-bold text-white">Set new password</h1>
                <p className="text-sm text-white/60 mt-1">
                  Enter your new password below.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="At least 12 characters"
                              disabled={loading}
                              className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            disabled={loading}
                            className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-bold shadow-lg shadow-[#55E039]/25 hover:shadow-[#55E039]/40 hover:brightness-110"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
