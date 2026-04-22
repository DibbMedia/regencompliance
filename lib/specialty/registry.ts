import type { SpecialtyMeta } from "./types"
import { meta as medSpas } from "./data/med-spas"
import { meta as weightLoss } from "./data/weight-loss-clinics"
import { meta as regenClinics } from "./data/regen-clinics"
import { meta as dental } from "./data/dental-practices"
import { meta as ivTherapy } from "./data/iv-therapy"
import { meta as aesthetic } from "./data/aesthetic-practices"

export const SPECIALTIES: SpecialtyMeta[] = [
  medSpas,
  weightLoss,
  regenClinics,
  dental,
  ivTherapy,
  aesthetic,
]

export function getSpecialtyBySlug(slug: string): SpecialtyMeta | undefined {
  return SPECIALTIES.find((s) => s.slug === slug)
}

export function getRelatedSpecialties(slug: string, limit = 3): SpecialtyMeta[] {
  return SPECIALTIES.filter((s) => s.slug !== slug).slice(0, limit)
}
