"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"

const TREATMENTS = [
  { slug: "prp", label: "PRP (Platelet-Rich Plasma)" },
  { slug: "stem_cell", label: "Stem Cell Therapy" },
  { slug: "exosomes", label: "Exosomes" },
  { slug: "bmac", label: "BMAC (Bone Marrow Aspirate Concentrate)" },
  { slug: "whartons_jelly", label: "Wharton's Jelly" },
  { slug: "prolotherapy", label: "Prolotherapy" },
  { slug: "peptide", label: "Peptide Therapy" },
  { slug: "other", label: "Other Regenerative Treatments" },
]

export default function OnboardingTreatmentsPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function toggleTreatment(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  async function handleFinish(skip = false) {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const updates: Record<string, unknown> = { onboarding_complete: true }
    if (!skip && selected.length > 0) {
      updates.treatments = selected
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)

    setLoading(false)
    if (error) {
      toast.error("Failed to save. Please try again.")
      return
    }

    router.push("/dashboard/scanner")
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-2">
          <p className="text-sm text-muted-foreground mb-1">Step 2 of 2</p>
          <Progress value={100} />
        </div>
        <CardTitle>What treatments does your clinic offer?</CardTitle>
        <CardDescription>
          This helps us tailor compliance rules to your specific services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TREATMENTS.map((t) => (
            <div key={t.slug} className="flex items-center space-x-2">
              <Checkbox
                id={t.slug}
                checked={selected.includes(t.slug)}
                onCheckedChange={() => toggleTreatment(t.slug)}
              />
              <Label htmlFor={t.slug} className="cursor-pointer">
                {t.label}
              </Label>
            </div>
          ))}
        </div>
        <Button
          className="w-full"
          disabled={loading || selected.length === 0}
          onClick={() => handleFinish(false)}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Finish Setup
        </Button>
        <button
          type="button"
          className="w-full text-center text-sm text-muted-foreground hover:underline"
          onClick={() => handleFinish(true)}
          disabled={loading}
        >
          Skip for now
        </button>
      </CardContent>
    </Card>
  )
}
