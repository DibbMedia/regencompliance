// Shared setup for the encryption end-to-end integration suite.
//
// The crypto module refuses fallback keys in production; here we pin a
// stable test fixture key that is well-formed (64 hex chars) but is one of
// the WEAK_TEST_KEYS values that crypto.ts rejects only when NODE_ENV ==
// "production". Tests run with NODE_ENV unset, so derivation proceeds.
//
// Bumping the key here regenerates every envelope built in this test file;
// no migration to data on disk is needed because we never persist.

import { beforeAll } from "vitest"

export const E2E_KEY = "a".repeat(64)

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = E2E_KEY
})
