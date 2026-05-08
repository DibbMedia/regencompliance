"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { BrandIcon } from "@/components/brand-icon"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "@/lib/validations"
import { createClient } from "@/lib/supabase/client"
import { MarketingBg } from "@/components/marketing-bg"
import { IS_LAUNCHED } from "@/lib/env"
import { marketingUrl } from "@/lib/site-url"
import Link from "next/link"

const ERROR_MESSAGES: Record<string, string> = {
  auth: "Authentication failed. Please try again.",
  auth_failed: "Authentication failed. Please try again.",
  invite_email_mismatch: "The invite link does not match your email address.",
  invite_expired: "This invite link has expired. Please request a new one.",
  session_expired: "Your session expired due to inactivity. Please sign in again.",
}

function LoginContent() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const errorParam = searchParams.get("error")
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] || "An error occurred. Please try again." : null

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  async function handleLogin(data: LoginInput) {
    setLoading(true)
    setFormError(null)

    // Server-side login proxy enforces lockout + IP rate limits authoritatively.
    // Pre-2026-05-05 this used signInWithPassword from the client + an advisory
    // check-login endpoint, which was bypassable.
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setLoading(false)
      if (res.status === 429) {
        setFormError("Too many login attempts. Please wait a few minutes and try again.")
      } else if (body?.allowed === false || body?.lockedUntil) {
        setFormError("Account temporarily locked due to too many failed attempts. Please try again in 30 minutes.")
      } else {
        setFormError(body?.error || "Invalid email or password.")
      }
      return
    }

    // Server set the auth cookies via @supabase/ssr; sync the client SDK so
    // subsequent reads (profile, subscription) hit the same session.
    if (body?.session?.access_token && body?.session?.refresh_token) {
      await supabase.auth.setSession({
        access_token: body.session.access_token,
        refresh_token: body.session.refresh_token,
      })
    }

    // Subscription-aware welcome toast.
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", user.id)
          .maybeSingle()

        if (profile?.subscription_status === "active") {
          toast.success("Welcome back! Your subscription is active.")
        } else {
          toast.success("Signed in successfully!")
        }
      }
    } catch {
      toast.success("Signed in successfully!")
    }

    // Attempt to claim beta purchase if one exists for this email (non-blocking)
    fetch("/api/beta/claim", { method: "POST" }).catch(() => {})

    setRedirecting(true)
    router.push("/dashboard/scanner")
  }

  async function handleSignup(data: SignupInput) {
    setLoading(true)
    setFormError(null)

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    })

    if (!res.ok) {
      setLoading(false)
      const body = await res.json().catch(() => ({}))
      const msg = body.error || "Signup failed. Please try again."
      // The signup endpoint deliberately returns a generic error to prevent
      // user enumeration, so we can't tell here whether the email was
      // already in use. Append the "try logging in" nudge unconditionally
      // so existing-account users have a path forward without leaking
      // which case they hit.
      setFormError(`${msg} If you already have an account, try logging in instead.`)
      return
    }

    setLoading(false)
    toast.success("Account created! Check your email to verify, then log in.")
    setMode("login")
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden flex items-center justify-center px-3 sm:px-4">
        <MarketingBg />
        <div className="relative flex flex-col items-center gap-4">
          <BrandIcon className="h-10 w-10" />
          <Loader2 className="h-6 w-6 animate-spin text-[#55E039]" />
          <p className="text-sm text-white/60">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const isFormDisabled = loading || redirecting

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
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-white">
              {IS_LAUNCHED && mode === "signup" ? "Create your account" : "Sign in to your account"}
            </h1>
            <p className="text-sm text-white/60 mt-1">
              {IS_LAUNCHED && mode === "signup"
                ? "Get started with RegenCompliance today."
                : "Enter your credentials to access the dashboard."}
            </p>
          </div>

          {/* URL param error banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-4">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{errorMessage}</p>
            </div>
          )}

          {/* Inline form error */}
          {formError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-4">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{formError}</p>
            </div>
          )}

          {/* Tab toggle - only shown when site is launched */}
          {IS_LAUNCHED && (
            <div className="flex mb-6 rounded-lg bg-white/[0.03] border border-white/10 p-1" role="tablist">
              <button
                role="tab"
                aria-selected={mode === "login"}
                onClick={() => { setMode("login"); setFormError(null) }}
                disabled={isFormDisabled}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
                  mode === "login" ? "bg-[#55E039] text-[#0a0a0a] shadow-md" : "text-white/65 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                Log In
              </button>
              <button
                role="tab"
                aria-selected={mode === "signup"}
                onClick={() => { setMode("signup"); setFormError(null) }}
                disabled={isFormDisabled}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
                  mode === "signup" ? "bg-[#55E039] text-[#0a0a0a] shadow-md" : "text-white/65 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {IS_LAUNCHED && mode === "signup" ? (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@yourclinic.com"
                          disabled={isFormDisabled}
                          className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 12 characters"
                            disabled={isFormDisabled}
                            className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
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
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@yourclinic.com"
                          disabled={isFormDisabled}
                          className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-white/70">Password</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-xs text-[#55E039]/80 hover:text-[#55E039] transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            disabled={isFormDisabled}
                            className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-bold shadow-lg shadow-[#55E039]/25 hover:shadow-[#55E039]/40 hover:brightness-110"
                  disabled={isFormDisabled}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center space-y-2">
            {!IS_LAUNCHED && (
              <p className="text-xs text-white/50">
                Don&apos;t have access yet?{" "}
                <Link href={marketingUrl("/apply")} className="text-[#55E039] hover:text-[#6FF055] font-semibold transition-colors">
                  Apply for beta →
                </Link>
              </p>
            )}
            <Link href={marketingUrl("/")} className="block text-xs text-white/40 hover:text-white/60 transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
