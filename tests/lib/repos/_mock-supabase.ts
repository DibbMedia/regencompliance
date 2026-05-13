// Shared mock Supabase client for repo tests. Models the slice of supabase-js
// the lib/repos/* modules use: from().insert/update/delete/select chain with
// .eq/.is/.order/.range/.single/.maybeSingle and direct await on the builder.
import type { SupabaseClient } from "@supabase/supabase-js"

export interface QueryCall {
  table: string
  op: "select" | "insert" | "update" | "delete"
  payload?: unknown
  filters: Array<{ kind: string; col?: string; val?: unknown }>
}

export interface MockDb {
  calls: QueryCall[]
  rows: Map<string, Record<string, unknown>>
}

function findEqVal(call: QueryCall, col: string): unknown {
  const f = call.filters.find((x) => x.kind === "eq" && x.col === col)
  return f?.val
}

function matchesFilters(row: Record<string, unknown>, call: QueryCall): boolean {
  for (const f of call.filters) {
    if (f.kind === "eq") {
      if (row[f.col!] !== f.val) return false
    } else if (f.kind === "is") {
      if (f.val === null) {
        const v = row[f.col!]
        if (v !== null && v !== undefined) return false
      }
    }
  }
  return true
}

export function makeMockSupabase(db: MockDb): SupabaseClient {
  function chain(table: string, op: QueryCall["op"], payload?: unknown) {
    const call: QueryCall = { table, op, payload, filters: [] }
    db.calls.push(call)
    const builder = {
      _resolveData(): unknown {
        if (op === "insert") {
          const row = { ...(payload as Record<string, unknown>) }
          if (!row.created_at) row.created_at = new Date().toISOString()
          if (table === "waitlist" && row.launch_email_sent_at === undefined) {
            row.launch_email_sent_at = null
          }
          if (table === "beta_applications" && row.accepted_terms_at === undefined) {
            row.accepted_terms_at = new Date().toISOString()
          }
          if (table === "beta_purchases") {
            if (row.claimed === undefined) row.claimed = false
            if (row.claimed_by === undefined) row.claimed_by = null
            if (row.stripe_payment_intent_id === undefined) row.stripe_payment_intent_id = null
            if (row.reserved_at === undefined) row.reserved_at = null
            if (row.reservation_expires_at === undefined) row.reservation_expires_at = null
          }
          db.rows.set(row.id as string, row)
          return row
        }
        if (op === "update") {
          const updates = payload as Record<string, unknown>
          const matched = Array.from(db.rows.values()).filter((r) =>
            matchesFilters(r, call),
          )
          const out: Record<string, unknown>[] = []
          for (const r of matched) {
            const merged = { ...r, ...updates }
            db.rows.set(r.id as string, merged)
            out.push(merged)
          }
          return out
        }
        if (op === "select") {
          return Array.from(db.rows.values()).filter((r) => matchesFilters(r, call))
        }
        if (op === "delete") {
          const matched = Array.from(db.rows.values()).filter((r) =>
            matchesFilters(r, call),
          )
          for (const r of matched) db.rows.delete(r.id as string)
          return matched
        }
        return null
      },
      select() {
        return builder
      },
      eq(col: string, val: unknown) {
        call.filters.push({ kind: "eq", col, val })
        return builder
      },
      is(col: string, val: unknown) {
        call.filters.push({ kind: "is", col, val })
        return builder
      },
      order() {
        return builder
      },
      range() {
        return builder
      },
      async single() {
        const data = builder._resolveData() as unknown
        if (Array.isArray(data)) {
          if (data.length === 0) return { data: null, error: { message: "no rows" } }
          return { data: data[0], error: null }
        }
        return { data, error: null }
      },
      async maybeSingle() {
        const data = builder._resolveData() as unknown
        if (Array.isArray(data)) {
          return { data: data[0] ?? null, error: null }
        }
        return { data: data ?? null, error: null }
      },
      then(resolve: (v: { data: unknown; error: null }) => void) {
        const data = builder._resolveData()
        const arr = Array.isArray(data) ? data : data == null ? [] : [data]
        resolve({ data: arr, error: null })
      },
    }
    return builder
  }
  return {
    from(table: string) {
      return {
        select() {
          return chain(table, "select")
        },
        insert(payload: unknown) {
          return chain(table, "insert", payload)
        },
        update(payload: unknown) {
          return chain(table, "update", payload)
        },
        delete() {
          return chain(table, "delete")
        },
      }
    },
  } as unknown as SupabaseClient
}

export function findEqFilter(call: QueryCall, col: string): unknown {
  return findEqVal(call, col)
}
