"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Shield, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"
import { MarketingBg } from "@/components/marketing-bg"
import Link from "next/link"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
})

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function handleSubmit(data: ForgotPasswordInput) {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setLoading(false)

    if (error) {
      toast.error("Something went wrong. Please try again.")
      return
    }

    setSent(true)
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
          {sent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-10 w-10 text-[#55E039]" />
              </div>
              <h1 className="text-xl font-bold text-white">Check your email</h1>
              <p className="text-sm text-white/60 leading-relaxed">
                If an account exists with that email, we sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-[#55E039]/80 hover:text-[#55E039] transition-colors mt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <h1 className="text-xl font-bold text-white">Reset your password</h1>
                <p className="text-sm text-white/60 mt-1">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@yourclinic.com"
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
