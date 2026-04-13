"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Shield, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"
import { MarketingBg } from "@/components/marketing-bg"
import Link from "next/link"

const resetPasswordSchema = z.object({
  password: z.string().min(12, "Password must be at least 12 characters."),
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
    // Supabase automatically picks up the recovery token from the URL hash
    // and establishes a session via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true)
      }
    })

    // Also check if we already have a session (e.g. page reload)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        // Give a moment for the hash to be processed
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (s) {
              setReady(true)
            } else {
              setSessionError(true)
            }
          })
        }, 2000)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  async function handleSubmit(data: ResetPasswordInput) {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: data.password })
    setLoading(false)

    if (error) {
      toast.error(error.message || "Failed to reset password. Please try again.")
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#55E039] to-[#3BB82A] shadow-lg shadow-[#55E039]/25">
            <Shield className="h-5 w-5 text-white" />
          </div>
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
