// Integration test for /api/profile (Wave 2A).
//
// Covers the encrypt-on-write + decrypt-on-read contract of the route:
//   1. GET returns the decrypted profile (clinic_name + treatments visible
//      to the caller in plaintext).
//   2. GET returns 401 when the user is unauthenticated.
//   3. PATCH encrypts clinic_name + treatments before they hit Supabase
//      (the mock asserts the ciphertext envelopes never carry plaintext).
//   4. PATCH returns the decrypted profile after write.
//
// Uses a hand-rolled mock of `@/lib/supabase/server` whose .from().select()
// /.update() chain accepts the shape `lib/repos/profiles.ts` expects.
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest"
import {
  encryptProfileWrite,
  type ProfileEncryptedRow,
} from "@/lib/repos/profiles"

const VALID_KEY = "f".repeat(64)
const USER_ID = "11111111-1111-4111-8111-111111111111"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

interface State {
  user: { id: string; email: string } | null
  row: ProfileEncryptedRow | null
  lastUpdate: Record<string, unknown> | null
}

const state: State = {
  user: null,
  row: null,
  lastUpdate: null,
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: state.user } }),
    },
    from: () => {
      const builder = {
        select(_cols: string) {
          return {
            eq(_col: string, _val: unknown) {
              return {
                maybeSingle: async () => ({ data: state.row, error: null }),
                single: async () => {
                  if (!state.row) {
                    return { data: null, error: { message: "no row" } }
                  }
                  return { data: state.row, error: null }
                },
              }
            },
          }
        },
        update(patch: Record<string, unknown>) {
          state.lastUpdate = patch
          return {
            eq(_col: string, _val: unknown) {
              return {
                select(_cols: string) {
                  return {
                    single: async () => {
                      const merged = { ...(state.row as ProfileEncryptedRow), ...patch }
                      state.row = merged as ProfileEncryptedRow
                      return { data: merged, error: null }
                    },
                  }
                },
              }
            },
          }
        },
      }
      return builder
    },
  }),
}))

vi.mock("@/lib/impersonation", () => ({
  requireWriteMode: async () => null,
}))

function baseRow(overrides: Partial<ProfileEncryptedRow> = {}): ProfileEncryptedRow {
  return {
    id: USER_ID,
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

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/profile/route")
}

describe("GET /api/profile", () => {
  beforeEach(() => {
    state.user = { id: USER_ID, email: "owner@clinic.com" }
    state.lastUpdate = null
  })

  it("401 when unauthenticated", async () => {
    state.user = null
    state.row = baseRow()
    const { GET } = await loadRoute()
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it("404 when no profile row", async () => {
    state.row = null
    const { GET } = await loadRoute()
    const res = await GET()
    expect(res.status).toBe(404)
  })

  it("200 returns decrypted profile", async () => {
    const enc = encryptProfileWrite(USER_ID, {
      clinic_name: "Sunrise Stem Cell",
      treatments: ["PRP", "Exosomes"],
    })
    state.row = baseRow({
      clinic_name_enc: enc.clinic_name_enc ?? null,
      treatments_enc: enc.treatments_enc ?? null,
    })
    const { GET } = await loadRoute()
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.clinic_name).toBe("Sunrise Stem Cell")
    expect(body.treatments).toEqual(["PRP", "Exosomes"])
  })
})

describe("PATCH /api/profile", () => {
  beforeEach(() => {
    state.user = { id: USER_ID, email: "owner@clinic.com" }
    state.row = baseRow()
    state.lastUpdate = null
  })

  it("401 when unauthenticated", async () => {
    state.user = null
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clinic_name: "Foo" }),
      }),
    )
    expect(res.status).toBe(401)
  })

  it("400 on invalid body (clinic_name over 200 chars)", async () => {
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clinic_name: "x".repeat(300) }),
      }),
    )
    expect(res.status).toBe(400)
  })

  it("encrypts clinic_name on write and returns decrypted body", async () => {
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clinic_name: "Roundtrip Clinic" }),
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.clinic_name).toBe("Roundtrip Clinic")

    // The mock captured the update patch - assert ciphertext + no plaintext.
    expect(state.lastUpdate).not.toBeNull()
    const patch = state.lastUpdate as Record<string, unknown>
    expect(typeof patch.clinic_name_enc).toBe("string")
    expect(patch.clinic_name_enc as string).toMatch(/^v1u\./)
    expect(patch).not.toHaveProperty("clinic_name")
    expect(JSON.stringify(patch)).not.toContain("Roundtrip Clinic")
  })

  it("encrypts treatments as a JSON envelope", async () => {
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ treatments: ["NAD+", "PRP"] }),
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.treatments).toEqual(["NAD+", "PRP"])

    const patch = state.lastUpdate as Record<string, unknown>
    expect(typeof patch.treatments_enc).toBe("string")
    expect(patch.treatments_enc as string).toMatch(/^v1u\./)
    expect(patch).not.toHaveProperty("treatments")
    expect(JSON.stringify(patch)).not.toContain("NAD+")
  })
})
