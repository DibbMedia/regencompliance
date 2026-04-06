"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"

export default function OnboardingClinicPage() {
  const [clinicName, setClinicName] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB")
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clinicName.trim()) {
      toast.error("Clinic name is required")
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    let logoUrl: string | null = null
    if (logoFile) {
      const ext = logoFile.name.split(".").pop()
      const path = `${user.id}/logo.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, logoFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from("logos").getPublicUrl(path)
        logoUrl = data.publicUrl
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ clinic_name: clinicName, ...(logoUrl && { logo_url: logoUrl }) })
      .eq("id", user.id)

    setLoading(false)
    if (error) {
      toast.error("Failed to save. Please try again.")
      return
    }

    router.push("/onboarding/treatments")
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-2">
          <p className="text-sm text-muted-foreground mb-1">Step 1 of 2</p>
          <Progress value={50} />
        </div>
        <CardTitle>Set up your clinic</CardTitle>
        <CardDescription>Tell us about your clinic to personalize your experience.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinic-name">Clinic Name *</Label>
            <Input
              id="clinic-name"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="Your Clinic Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo (optional)</Label>
            <Input
              id="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
            />
            {logoPreview && (
              <img src={logoPreview} alt="Logo preview" className="h-16 w-16 rounded-md object-cover" />
            )}
            <p className="text-xs text-muted-foreground">PNG, JPG, or WebP. Max 2MB.</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
