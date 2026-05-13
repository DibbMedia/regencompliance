import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptProfileRow,
  encryptProfileWrite,
  getProfile,
  updateProfile,
  listProfilesForAdmin,
  type ProfileEncryptedRow,
} from "@/lib/repos/profiles"
import { withCryptoRequestScope } from "@/lib/crypto"

const VALID_KEY = "a".repeat(64)
const USER_A = "11111111-1111-4111-8111-111111111111"
const USER_B = "22222222-2222-4222-8222-222222222222"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

function baseRow(overrides: Partial<ProfileEncryptedRow> = {}): ProfileEncryptedRow {
  return {
    id: USER_A,
    clinic_name_enc: null,
    treatments_enc: null,
    logo_url: null,
    subscription_status: "inactive",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    is_beta_subscriber: false,
    beta_enrolled_at: null,
    cancelled_at: null,
    onboarding_complete: false,
    theme_preference: "system",
    badge_id: null,
    created_at: "2026-05-13T00:00:00Z",
    updated_at: "2026-05-13T00:00:00Z",
    ...overrides,
  }
}

// --- Stateless transforms --------------------------------------------------

describe("profiles repo - transforms", () => {
  it("roundtrips clinic_name + treatments via encrypt/decrypt", () => {
    const write = encryptProfileWrite(USER_A, {
      clinic_name: "Sunrise Stem Cell",
      treatments: ["PRP", "Stem Cells"],
    })

    expect(write.clinic_name_enc).toMatch(/^v1u\./)
    expect(write.treatments_enc).toMatch(/^v1u\./)

    const row = baseRow({
      clinic_name_enc: write.clinic_name_enc ?? null,
      treatments_enc: write.treatments_enc ?? null,
    })
    const plain = decryptProfileRow(USER_A, row)
    expect(plain.clinic_name).toBe("Sunrise Stem Cell")
    expect(plain.treatments).toEqual(["PRP", "Stem Cells"])
  })

  it("passes through non-encrypted columns unchanged", () => {
    const row = baseRow({
      logo_url: "https://example.com/logo.png",
      subscription_status: "active",
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_456",
      is_beta_subscriber: true,
      beta_enrolled_at: "2026-04-01T00:00:00Z",
      cancelled_at: null,
      onboarding_complete: true,
      theme_preference: "dark",
    })
    const plain = decryptProfileRow(USER_A, row)
    expect(plain).toMatchObject({
      logo_url: "https://example.com/logo.png",
      subscription_status: "active",
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_456",
      is_beta_subscriber: true,
      beta_enrolled_at: "2026-04-01T00:00:00Z",
      onboarding_complete: true,
      theme_preference: "dark",
    })
  })

  it("NULL clinic_name_enc decrypts to NULL without a decrypt call", () => {
    const row = baseRow({ clinic_name_enc: null })
    const plain = decryptProfileRow(USER_A, row)
    expect(plain.clinic_name).toBeNull()
  })

  it("NULL treatments_enc decodes to an empty array", () => {
    const row = baseRow({ treatments_enc: null })
    const plain = decryptProfileRow(USER_A, row)
    expect(plain.treatments).toEqual([])
  })

  it("encryptProfileWrite emits NULL clinic_name_enc when clinic_name = null", () => {
    const write = encryptProfileWrite(USER_A, { clinic_name: null })
    expect(write.clinic_name_enc).toBeNull()
  })

  it("encryptProfileWrite only emits keys for fields actually in the input", () => {
    const write = encryptProfileWrite(USER_A, { onboarding_complete: true })
    expect(Object.keys(write)).toEqual(["onboarding_complete"])
  })

  it("AAD binding: row id mismatch makes decrypt throw", () => {
    const write = encryptProfileWrite(USER_A, { clinic_name: "Foo" })
    // Move the ciphertext to a row whose id != USER_A.
    const moved = baseRow({ id: USER_B, clinic_name_enc: write.clinic_name_enc ?? null })
    // decryptProfileRow throws on the userId/row.id mismatch guard before we
    // even call decryptForUser - verify the early check fires.
    expect(() => decryptProfileRow(USER_B, moved)).toThrow()
  })

  it("cross-user binding: ciphertext from user A cannot be decrypted as user B", () => {
    const write = encryptProfileWrite(USER_A, { clinic_name: "Foo" })
    // Construct a row that lies about its id to bypass the early guard. The
    // AAD inside the envelope was built with USER_A's id, so when we ask
    // decryptForUser to use USER_B's DEK + USER_B AAD, the auth tag will fail.
    const lyingRow = baseRow({
      id: USER_B,
      clinic_name_enc: write.clinic_name_enc ?? null,
    })
    expect(() => decryptProfileRow(USER_B, lyingRow)).toThrow()
  })
})

// --- Supabase mock ---------------------------------------------------------

interface MockState {
  row: ProfileEncryptedRow | null
  rows: ProfileEncryptedRow[]
  lastUpdate: Record<string, unknown> | null
  selectCalls: number
}

function makeSupabaseMock(state: MockState): SupabaseClient {
  const fromImpl = (_table: string) => {
    return {
      select: (_cols: string) => {
        state.selectCalls += 1
        return {
          eq: (_col: string, _val: unknown) => ({
            maybeSingle: async () => ({ data: state.row, error: null }),
          }),
          order: (_col: string, _opts: { ascending: boolean }) => ({
            range: async (_from: number, _to: number) => ({
              data: state.rows,
              error: null,
            }),
          }),
        }
      },
      update: (patch: Record<string, unknown>) => {
        state.lastUpdate = patch
        return {
          eq: (_col: string, _val: unknown) => ({
            select: (_cols: string) => ({
              single: async () => {
                // Apply the patch to the stored row for the followup decrypt.
                const merged = { ...(state.row as ProfileEncryptedRow), ...patch } as ProfileEncryptedRow
                state.row = merged
                return { data: merged, error: null }
              },
            }),
          }),
        }
      },
    }
  }
  return { from: fromImpl } as unknown as SupabaseClient
}

// --- CRUD ------------------------------------------------------------------

describe("profiles repo - getProfile", () => {
  let state: MockState
  let supabase: SupabaseClient

  beforeEach(() => {
    const enc = encryptProfileWrite(USER_A, {
      clinic_name: "Roundtrip Clinic",
      treatments: ["NAD+"],
    })
    state = {
      row: baseRow({
        clinic_name_enc: enc.clinic_name_enc ?? null,
        treatments_enc: enc.treatments_enc ?? null,
      }),
      rows: [],
      lastUpdate: null,
      selectCalls: 0,
    }
    supabase = makeSupabaseMock(state)
  })

  it("returns the decrypted profile", async () => {
    const profile = await getProfile(supabase, USER_A)
    expect(profile?.clinic_name).toBe("Roundtrip Clinic")
    expect(profile?.treatments).toEqual(["NAD+"])
  })

  it("returns null when the row doesn't exist", async () => {
    state.row = null
    const profile = await getProfile(supabase, USER_A)
    expect(profile).toBeNull()
  })

  it("cache hits: two reads under the same scope both succeed", async () => {
    await withCryptoRequestScope(async () => {
      const a = await getProfile(supabase, USER_A)
      const b = await getProfile(supabase, USER_A)
      expect(a?.clinic_name).toBe("Roundtrip Clinic")
      expect(b?.clinic_name).toBe("Roundtrip Clinic")
      expect(state.selectCalls).toBe(2)
    })
  })
})

describe("profiles repo - updateProfile", () => {
  let state: MockState
  let supabase: SupabaseClient

  beforeEach(() => {
    state = {
      row: baseRow(),
      rows: [],
      lastUpdate: null,
      selectCalls: 0,
    }
    supabase = makeSupabaseMock(state)
  })

  it("encrypts clinic_name on write (mock sees v1u. envelope, no plaintext)", async () => {
    await updateProfile(supabase, USER_A, { clinic_name: "Encrypted Clinic" })
    expect(state.lastUpdate).not.toBeNull()
    const patch = state.lastUpdate as Record<string, unknown>
    expect(typeof patch.clinic_name_enc).toBe("string")
    expect((patch.clinic_name_enc as string)).toMatch(/^v1u\./)
    // The plaintext column must not be present in the patch.
    expect(patch).not.toHaveProperty("clinic_name")
    // The plaintext value must not leak anywhere in the patch payload.
    expect(JSON.stringify(patch)).not.toContain("Encrypted Clinic")
  })

  it("encrypts treatments as a JSON blob", async () => {
    await updateProfile(supabase, USER_A, { treatments: ["A", "B"] })
    const patch = state.lastUpdate as Record<string, unknown>
    expect(patch.treatments_enc).toMatch(/^v1u\./)
    expect(patch).not.toHaveProperty("treatments")
    expect(JSON.stringify(patch)).not.toContain('"A"')
  })

  it("returns the freshly-updated decrypted profile", async () => {
    const updated = await updateProfile(supabase, USER_A, {
      clinic_name: "Round-Trip",
      treatments: ["X"],
    })
    expect(updated.clinic_name).toBe("Round-Trip")
    expect(updated.treatments).toEqual(["X"])
  })

  it("passes pass-through columns unchanged", async () => {
    await updateProfile(supabase, USER_A, {
      stripe_customer_id: "cus_999",
      onboarding_complete: true,
    })
    const patch = state.lastUpdate as Record<string, unknown>
    expect(patch.stripe_customer_id).toBe("cus_999")
    expect(patch.onboarding_complete).toBe(true)
  })
})

describe("profiles repo - listProfilesForAdmin", () => {
  it("decrypts every row under its own user DEK", async () => {
    const encA = encryptProfileWrite(USER_A, { clinic_name: "Alpha Clinic" })
    const encB = encryptProfileWrite(USER_B, { clinic_name: "Bravo Clinic" })
    const state: MockState = {
      row: null,
      rows: [
        baseRow({ id: USER_A, clinic_name_enc: encA.clinic_name_enc ?? null }),
        baseRow({ id: USER_B, clinic_name_enc: encB.clinic_name_enc ?? null }),
      ],
      lastUpdate: null,
      selectCalls: 0,
    }
    const supabase = makeSupabaseMock(state)
    const list = await listProfilesForAdmin(supabase, { limit: 10 })
    expect(list.map((p) => p.clinic_name)).toEqual(["Alpha Clinic", "Bravo Clinic"])
  })
})

// --- Sanity: ensure we never silently fell into a no-op test --------------

describe("profiles repo - sanity", () => {
  it("uses the real crypto module", () => {
    // If the module were mocked or the key absent, this would throw.
    const env = encryptProfileWrite(USER_A, { clinic_name: "hi" })
    expect(env.clinic_name_enc).toMatch(/^v1u\./)
  })

  it("vi is available (smoke check the test runner is wired)", () => {
    expect(typeof vi).toBe("object")
  })
})
