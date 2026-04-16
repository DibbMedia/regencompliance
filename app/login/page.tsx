"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Shield, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "@/lib/validations"
import { createClient } from "@/lib/supabase/client"
import { MarketingBg } from "@/components/marketing-bg"
import { IS_LAUNCHED } from "@/lib/env"
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

    // Check if account is locked
    try {
      const lockCheck = await fetch("/api/auth/check-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })
      const lockData = await lockCheck.json()
      if (!lockData.allowed) {
        setLoading(false)
        setFormError("Account temporarily locked due to too many failed login attempts. Please try again in 30 minutes.")
        return
      }
    } catch {
      // Continue if check fails
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setLoading(false)
      // Record failed attempt
      fetch("/api/auth/check-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, success: false }),
      }).catch(() => {})

      if (error.message.includes("Invalid login")) {
        setFormError("Invalid email or password.")
      } else {
        setFormError(error.message)
      }
      return
    }

    // Clear failed attempts on success
    fetch("/api/auth/check-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, success: true }),
    }).catch(() => {})

    // Check subscription status and show appropriate welcome message
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
    try {
      fetch("/api/beta/claim", { method: "POST" })
    } catch {
      // Non-blocking
    }

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
      if (typeof msg === "string" && msg.toLowerCase().includes("already registered")) {
        setFormError("An account with this email already exists. Try logging in.")
      } else {
        setFormError(msg)
      }
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#55E039] to-[#3BB82A] shadow-lg shadow-[#55E039]/25">
            <Shield className="h-5 w-5 text-white" />
          </div>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#55E039] to-[#3BB82A] shadow-lg shadow-[#55E039]/25">
            <Shield className="h-5 w-5 text-white" />
          </div>
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

          {/* Tab toggle — only shown when site is launched */}
          {IS_LAUNCHED && (
            <div className="flex mb-6 rounded-lg bg-white/[0.03] border border-white/10 p-1" role="tablist">
              <button
                role="tab"
                aria-selected={mode === "login"}
                onClick={() => { setMode("login"); setFormError(null) }}
                disabled={isFormDisabled}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === "login" ? "bg-[#55E039] text-[#0a0a0a] shadow-md" : "text-white/40 hover:text-white/60"
                }`}
              >
                Log In
              </button>
              <button
                role="tab"
                aria-selected={mode === "signup"}
                onClick={() => { setMode("signup"); setFormError(null) }}
                disabled={isFormDisabled}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === "signup" ? "bg-[#55E039] text-[#0a0a0a] shadow-md" : "text-white/40 hover:text-white/60"
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
                <Link href="/waitlist" className="text-[#55E039] hover:text-[#6FF055] font-semibold transition-colors">
                  Join the waitlist →
                </Link>
              </p>
            )}
            <Link href="/" className="block text-xs text-white/40 hover:text-white/60 transition-colors">
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
