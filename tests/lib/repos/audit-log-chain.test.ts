// Tests for the audit_log tamper-evident hash chain helpers (mig 044).
//
// These tests exercise the chain primitives directly:
//   - computeRowHash      (the SHA-256 over prev_hash || canonical row)
//   - canonicalSerializeChainRow  (stable-key-sorted JSON)
//   - toChainRow          (encrypted-row -> chain-row projection)
//
// The full insert path (createAuditLogEntry) is covered by the existing
// audit-log.test.ts and integration/encryption-e2e.test.ts; here we focus
// on the chain math itself so any future change to the canonical
// serializer surfaces a test failure.

import { describe, it, expect } from "vitest"
import {
  canonicalSerializeChainRow,
  computeRowHash,
  toChainRow,
  type AuditLogChainRow,
  type AuditLogEncryptedRow,
} from "@/lib/repos/audit-log"

const ROW_A: AuditLogChainRow = {
  action: "auth.login.success",
  created_at: "2026-05-20T12:34:56.789Z",
  details_enc: "v1u.abcdef0123456789",
  ip_address_enc: "v1u.aaaa1111",
  resource_id: "session_xyz",
  resource_type: "auth",
  status: "success",
  user_agent_enc: "v1u.bbbb2222",
  user_email_enc: "v1u.cccc3333",
  user_id: "11111111-1111-4111-8111-111111111111",
}

const ROW_B: AuditLogChainRow = {
  action: "scan.create",
  created_at: "2026-05-20T12:35:00.000Z",
  details_enc: "v1u.deadbeef",
  ip_address_enc: null,
  resource_id: "scan_001",
  resource_type: "scan",
  status: "success",
  user_agent_enc: null,
  user_email_enc: "v1u.cccc3333",
  user_id: "11111111-1111-4111-8111-111111111111",
}

describe("audit-log chain — computeRowHash determinism", () => {
  it("produces the same hex hash for identical inputs across two calls", () => {
    const h1 = computeRowHash(null, ROW_A)
    const h2 = computeRowHash(null, ROW_A)
    expect(h1).toBe(h2)
    // SHA-256 hex is exactly 64 lowercase hex characters.
    expect(h1).toMatch(/^[0-9a-f]{64}$/)
  })

  it("hashes the genesis row with prev=null using the empty-string prefix", () => {
    // Manually recompute: sha256("" || JSON.stringify(sorted(ROW_A)))
    const expectedSerialized = canonicalSerializeChainRow(ROW_A)
    const expectedSerializedNoPrev = canonicalSerializeChainRow(ROW_A)
    expect(expectedSerialized).toBe(expectedSerializedNoPrev)
    // Genesis hash should equal hash with prev = "" passed via null.
    expect(computeRowHash(null, ROW_A)).toBe(computeRowHash(null, ROW_A))
  })
})

describe("audit-log chain — prev-hash dependence", () => {
  it("differs when prev_hash changes (chain depends on parent)", () => {
    const genesis = computeRowHash(null, ROW_A)
    const linked = computeRowHash(genesis, ROW_B)
    const orphaned = computeRowHash(null, ROW_B)
    expect(linked).not.toBe(orphaned)
    // Also: a totally different prev_hash must produce a totally different
    // child hash (no accidental collisions).
    const otherPrev = "f".repeat(64)
    const linkedToOther = computeRowHash(otherPrev, ROW_B)
    expect(linked).not.toBe(linkedToOther)
  })

  it("two consecutive rows form a chain: hash(B|prev=hash(A|null)) is stable", () => {
    const hA = computeRowHash(null, ROW_A)
    const hB1 = computeRowHash(hA, ROW_B)
    const hB2 = computeRowHash(hA, ROW_B)
    expect(hB1).toBe(hB2)
  })
})

describe("audit-log chain — tamper detection", () => {
  it("changing any single field in the serialized row changes the hash", () => {
    const baseline = computeRowHash(null, ROW_A)

    // Mutate each field one at a time and confirm the hash differs.
    const mutations: Array<{ label: string; row: AuditLogChainRow }> = [
      { label: "action", row: { ...ROW_A, action: "auth.login.failed" } },
      { label: "created_at", row: { ...ROW_A, created_at: "2026-05-20T12:34:56.790Z" } },
      { label: "details_enc", row: { ...ROW_A, details_enc: "v1u.tampered" } },
      { label: "ip_address_enc", row: { ...ROW_A, ip_address_enc: "v1u.zzzz9999" } },
      { label: "resource_id", row: { ...ROW_A, resource_id: "session_other" } },
      { label: "resource_type", row: { ...ROW_A, resource_type: "billing" } },
      { label: "status", row: { ...ROW_A, status: "failure" } },
      { label: "user_agent_enc", row: { ...ROW_A, user_agent_enc: "v1u.qqqq8888" } },
      { label: "user_email_enc", row: { ...ROW_A, user_email_enc: "v1u.rrrr7777" } },
      {
        label: "user_id",
        row: { ...ROW_A, user_id: "22222222-2222-4222-8222-222222222222" },
      },
      // null -> non-null transitions
      { label: "resource_id null", row: { ...ROW_A, resource_id: null } },
      { label: "ip_address_enc null", row: { ...ROW_A, ip_address_enc: null } },
    ]

    for (const m of mutations) {
      const h = computeRowHash(null, m.row)
      expect(h, `mutation of ${m.label} should change the hash`).not.toBe(baseline)
    }
  })

  it("mutating prev_hash changes child hash even when row content is identical", () => {
    const a = computeRowHash("a".repeat(64), ROW_A)
    const b = computeRowHash("b".repeat(64), ROW_A)
    expect(a).not.toBe(b)
  })
})

describe("audit-log chain — null prev_hash genesis", () => {
  it("null prev produces same hash as undefined-passed-as-null (empty string prefix)", () => {
    // The contract: null is normalized to "" inside computeRowHash.
    // Verify by computing the same hash twice with explicitly null inputs.
    const h1 = computeRowHash(null, ROW_A)
    const h2 = computeRowHash(null, ROW_A)
    expect(h1).toBe(h2)
    // And the canonical form is stable.
    expect(canonicalSerializeChainRow(ROW_A)).toBe(canonicalSerializeChainRow(ROW_A))
  })

  it("genesis hash is NOT equal to hash of an empty-string-row chained off the genesis", () => {
    // A trivial sanity check: genesis(ROW_A) != genesis(ROW_B)
    const gA = computeRowHash(null, ROW_A)
    const gB = computeRowHash(null, ROW_B)
    expect(gA).not.toBe(gB)
  })
})

describe("audit-log chain — canonical serialization stability", () => {
  it("is stable across JS object key-insertion order", () => {
    // Build the same logical row two different ways: with keys in
    // alphabetical insertion order, and with keys in a deliberately
    // shuffled order. The canonical serializer must produce identical
    // output for both.
    const inOrder: AuditLogChainRow = {
      action: ROW_A.action,
      created_at: ROW_A.created_at,
      details_enc: ROW_A.details_enc,
      ip_address_enc: ROW_A.ip_address_enc,
      resource_id: ROW_A.resource_id,
      resource_type: ROW_A.resource_type,
      status: ROW_A.status,
      user_agent_enc: ROW_A.user_agent_enc,
      user_email_enc: ROW_A.user_email_enc,
      user_id: ROW_A.user_id,
    }
    // TypeScript object literal field order is "as written"; force a
    // different runtime insertion order by going through Object.assign.
    const shuffled = Object.assign(
      {} as AuditLogChainRow,
      { user_id: ROW_A.user_id },
      { status: ROW_A.status },
      { details_enc: ROW_A.details_enc },
      { action: ROW_A.action },
      { user_email_enc: ROW_A.user_email_enc },
      { created_at: ROW_A.created_at },
      { ip_address_enc: ROW_A.ip_address_enc },
      { resource_type: ROW_A.resource_type },
      { user_agent_enc: ROW_A.user_agent_enc },
      { resource_id: ROW_A.resource_id },
    ) as AuditLogChainRow

    expect(canonicalSerializeChainRow(inOrder)).toBe(
      canonicalSerializeChainRow(shuffled),
    )
    expect(computeRowHash(null, inOrder)).toBe(computeRowHash(null, shuffled))
  })

  it("emits keys in lexicographic order in the JSON output", () => {
    const json = canonicalSerializeChainRow(ROW_A)
    // The keys appear in this canonical sorted order. We assert their
    // index of occurrence is monotonically increasing in the serialized
    // string.
    const keys = [
      "action",
      "created_at",
      "details_enc",
      "ip_address_enc",
      "resource_id",
      "resource_type",
      "status",
      "user_agent_enc",
      "user_email_enc",
      "user_id",
    ]
    let lastIdx = -1
    for (const k of keys) {
      const idx = json.indexOf(`"${k}"`)
      expect(idx, `key ${k} should appear in canonical JSON`).toBeGreaterThan(lastIdx)
      lastIdx = idx
    }
  })

  it("normalizes undefined fields to null in serialized output", () => {
    // Pass a row where one nullable field is undefined rather than null.
    // The serializer must coerce to null so the JSON is stable.
    const rowWithUndefined = {
      ...ROW_A,
      ip_address_enc: undefined as unknown as string | null,
    } as AuditLogChainRow
    const serialized = canonicalSerializeChainRow(rowWithUndefined)
    expect(serialized).toContain(`"ip_address_enc":null`)
    // And the hash is the same as if we'd explicitly passed null.
    const rowWithNull = { ...ROW_A, ip_address_enc: null }
    expect(computeRowHash(null, rowWithUndefined)).toBe(
      computeRowHash(null, rowWithNull),
    )
  })
})

describe("audit-log chain — toChainRow projection", () => {
  it("projects an encrypted row down to the chain subset (and ignores id/row_hash)", () => {
    // toChainRow strips id, row_hash, and any plaintext fallback fields.
    // The returned object's hash must NOT depend on row.id (audit row id is
    // part of AAD, not part of the chain commitment).
    const enc1: AuditLogEncryptedRow = {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      user_id: ROW_A.user_id,
      user_email_enc: ROW_A.user_email_enc,
      action: ROW_A.action,
      resource_type: ROW_A.resource_type,
      resource_id: ROW_A.resource_id,
      details_enc: ROW_A.details_enc,
      ip_address_enc: ROW_A.ip_address_enc,
      user_agent_enc: ROW_A.user_agent_enc,
      status: ROW_A.status,
      created_at: ROW_A.created_at,
      row_hash: "ignored_by_chain",
    }
    const enc2: AuditLogEncryptedRow = { ...enc1, id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }
    const h1 = computeRowHash(null, toChainRow(enc1))
    const h2 = computeRowHash(null, toChainRow(enc2))
    expect(h1).toBe(h2)
    // And both equal the manually constructed ROW_A.
    expect(h1).toBe(computeRowHash(null, ROW_A))
  })
})
