# Wave 2D — Deferred Items

Phase 5 (audit_log + impersonation_sessions encryption). These items were
intentionally NOT touched in this wave because the surrounding files are
owned by another wave or by the main integration session. Hand back to the
main session at integration time.

## Stripe webhook audit write (DEFERRED to main session)

**File:** `app/api/stripe/webhook/route.ts:87`

There is a direct `audit_log` insert at the top of the Stripe webhook handler
for the `stripe.webhook` event-received audit (`user_id = NULL` → system-key
path).

**Why deferred:** the Stripe webhook is the shared-file conflict hotspot
called out in `docs/user-level-encryption-plan.md §12.9`. It is touched by
profiles (4 reads), notifications (4 inserts), audit_log (1 insert), and
beta_purchases (3 updates). Refactoring it here would collide with Waves
2A / 2B / 2C / 2E and Wave 1's stripe integration work.

**Replacement (main session should apply):**

```ts
import { createAuditLogEntry } from "@/lib/repos/audit-log"

// ...inside the handler, after auth verification:
await createAuditLogEntry(serviceClient, {
  action: "stripe.webhook",
  resource_type: "webhook_event",
  resource_id: event.id,
  status: "success",
  details: {
    event_type: event.type,
    // ...whatever shape the existing call passes
  },
})
```

The call goes through the repo's two-phase insert pattern: client-allocated
UUID, AAD-bound `*_enc` envelopes for every column. NULL `user_id` triggers
the system-key (`v1s.`) envelope per the audit-log repo dispatch in
`lib/repos/audit-log.ts`.

If the existing call is fire-and-forget (no await), the main session may keep
it that way by wrapping in `void createAuditLogEntry(...).catch(console.error)`,
matching the contract of `lib/audit-log.ts:logAudit`.

## Cross-check items (Wave 2A owns; verify after Wave 2A lands)

Wave 2D refactored `lib/audit-log.ts:logAudit` to route every existing
callsite through `createAuditLogEntry` automatically. Once Wave 2A's changes
land, verify the following files no longer write audit_log directly. If they
still do, they will not be encrypted - either route through `logAudit` (fire
and forget) or through `createAuditLogEntry` (awaitable, typed):

- `app/api/admin/users/route.ts`
- `app/api/admin/users/[id]/route.ts`
- `app/api/admin/admins/route.ts`
- `app/api/admin/admins/[id]/route.ts` — also verify that the
  "delete all impersonation sessions on admin revoke" path was switched
  from `.eq("admin_email", row.email)` (column is dropped by mig 040) to
  `deleteAllSessionsForAdmin(serviceClient, adminUserId)` from
  `lib/repos/impersonation-sessions.ts`. The admin's `user_id` needs to be
  looked up via `find_auth_user_id_by_email` (mig 030) first since
  `platform_admins` stores email, not user_id.
- `app/api/user/delete/route.ts` — should call `anonymizeAuditLogForUser`
  from the audit-log repo for §12.3 anonymization.
- `app/api/user/export/route.ts` — read path; should decrypt via repo if it
  exposes audit_log rows to the user.

## Read-side cleanup (not in Wave 2D scope)

These admin-facing READ surfaces still reference plaintext columns. They
will break at runtime after mig 040 drops `user_email` / `details` /
`ip_address` / `user_agent`. Track for a follow-up read-side migration:

- `app/api/admin/audit-log/route.ts` — selects plaintext columns, uses
  `ilike("user_email", ...)` filter. Should switch to `listAuditLogForAdmin`
  from the repo and drop the email-substring filter per §12.6 (admin pivots
  to user_id via `find_auth_user_id_by_email`).
- `app/api/account/security-events/route.ts` — selects plaintext columns
  for the customer-facing security activity feed. Should route through the
  repo and drop the `or(user_email.eq.${email})` clause.
- `app/api/admin/stats/route.ts` — only references `audit_log` for the
  `csp.violation` count; counts only, no plaintext column access. Safe.
