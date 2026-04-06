"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Shield, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "@/lib/validations"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

function LoginContent() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

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
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    setLoading(false)

    if (error) {
      if (error.message.includes("Invalid login")) {
        toast.error("Invalid email or password.")
      } else {
        toast.error(error.message)
      }
      return
    }

    toast.success("Signed in successfully!")
    router.push("/dashboard/scanner")
  }

  async function handleSignup(data: SignupInput) {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("An account with this email already exists. Try logging in.")
      } else {
        toast.error(error.message)
      }
      return
    }

    toast.success("Account created! Check your email to verify, then log in.")
    setMode("login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#0a0a0a]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-[#55E039]/[0.05] rounded-full blur-[150px]" />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#55E039] to-[#3BB82A] shadow-lg shadow-[#55E039]/25">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">RegenCompliance</span>
        </div>

        <Card className="bg-white/[0.03] border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-white">
              {mode === "login" ? "Sign in to your account" : "Create your account"}
            </CardTitle>
            <CardDescription className="text-white/50">
              {mode === "login"
                ? "Enter your credentials to access the dashboard."
                : "Get started with RegenCompliance today."}
            </CardDescription>
          </CardHeader>

          {/* Tab toggle */}
          <div className="flex mx-6 mt-2 mb-4 rounded-lg bg-white/[0.03] border border-white/10 p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "login" ? "bg-[#55E039] text-[#0a0a0a] shadow-md" : "text-white/50 hover:text-white/70"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "signup" ? "bg-[#55E039] text-[#0a0a0a] shadow-md" : "text-white/50 hover:text-white/70"
              }`}
            >
              Sign Up
            </button>
          </div>

          <CardContent>
            {mode === "login" ? (
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
                        <FormLabel className="text-white/70">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
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
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-bold shadow-lg shadow-[#55E039]/25 hover:shadow-[#55E039]/40 hover:brightness-110"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </Form>
            ) : (
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
                              placeholder="At least 8 characters"
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
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
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
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-4 text-center">
              <Link href="/" className="text-xs text-white/30 hover:text-white/50 transition-colors">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        {searchParams.get("subscribed") === "true" && (
          <p className="text-center text-sm text-[#55E039] mt-4">
            Payment received! Create your account or log in to get started.
          </p>
        )}
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
