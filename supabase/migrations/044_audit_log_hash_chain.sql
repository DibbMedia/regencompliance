-- ============================================================
-- Migration 044: Tamper-evident hash chain on audit_log
-- ============================================================
-- Adds a `row_hash` column to `audit_log` so each row carries the
-- SHA-256 of (previous row's row_hash || canonical serialization of
-- this row's persisted fields). The chain forms an append-only
-- tamper-evident log: anyone with service-role write access can
-- still mutate or delete rows, but a periodic verifier
-- (`scripts/verify-audit-chain.ts`) will detect the break because
-- the next row's hash no longer matches the mutated parent.
--
-- Coverage:
--   - All audit_log INSERTs after this migration applies start
--     populating row_hash via `lib/repos/audit-log.ts`.
--   - Existing rows (858+ pre-this-migration) have NULL row_hash
--     and form an unverifiable prefix. A separate, one-time
--     operator backfill script (out of scope for this migration)
--     can chain-hash the historical rows in `created_at ASC` order
--     if/when the operator decides to. The verifier only walks
--     `row_hash IS NOT NULL` rows so the historical prefix is
--     simply skipped, not flagged as a break.
--
-- Algorithm (see lib/repos/audit-log.ts → computeRowHash):
--   row_hash = sha256_hex(
--     (prev_row_hash_hex ?? "") ||
--     canonical_json_sorted_keys({
--       action, created_at, details_enc, ip_address_enc,
--       resource_id, resource_type, status, user_agent_enc,
--       user_email_enc, user_id
--     })
--   )
-- The serializer keys off the ENCRYPTED columns (post-Phase-5
-- shape), because the chain asserts the persisted state on disk,
-- not the plaintext interpretation. A tamper that swaps an
-- encrypted envelope for another valid envelope still changes the
-- hash.
--
-- Race / fork caveat:
--   Two near-concurrent INSERTs can both read the same most-recent
--   row_hash (their SELECTs interleave before either's INSERT), so
--   the chain forks. v1 accepts this; the production audit-log
--   write rate is low enough (single-digit writes/sec) that the
--   fork rate is near zero. Concurrent-insert forks are detected
--   and reported separately by the verifier (they match the
--   "chain-off-grandparent" pattern); only post-hoc mutations
--   (stored hash matches NEITHER the linear extension off the
--   previous row's stored hash NOR the fork-off-grandparent
--   pattern) cause exit-code 1. See scripts/verify-audit-chain.ts
--   for the classification algorithm and `expectedLinear` /
--   `expectedFork` distinction.
--
-- All ALTERs are IF NOT EXISTS so the migration is rerunnable.

ALTER TABLE audit_log
  ADD COLUMN IF NOT EXISTS row_hash text;

-- Partial index so the verifier's "WHERE row_hash IS NOT NULL
-- ORDER BY created_at ASC" walk is cheap, and lookups for the
-- previous row's hash on insert are also cheap.
CREATE INDEX IF NOT EXISTS idx_audit_log_row_hash_created
  ON audit_log (created_at DESC)
  WHERE row_hash IS NOT NULL;

COMMENT ON COLUMN audit_log.row_hash IS
  'Hex SHA-256 over (previous row_hash || canonical-serialized-this-row). Tamper-evident chain. See lib/repos/audit-log.ts:computeRowHash + scripts/verify-audit-chain.ts.';
