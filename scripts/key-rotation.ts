// V1 -> V2 key rotation harness. NOT IMPLEMENTED; placeholder for the next
// rotation event.
//
// Procedure (per docs/security/key-custody.md §Rotation):
//   1. Set ENCRYPTION_KEY_V2 in env alongside V1
//   2. Run this script: it iterates every encrypted column in every table,
//      decrypts under V1, re-encrypts under V2, writes the v2u./v2r./v2s.
//      envelope back to the row.
//   3. Verify a random sample by reading via the repo (which dispatches by
//      envelope prefix — implementation pending).
//   4. Deploy app that prefers V2 envelopes; V1 envelopes still decrypt
//      during the overlap window.
//   5. After 7-day soak, remove V1 from env.

async function main() {
  throw new Error("Key rotation is not implemented in v1. See docs/security/key-custody.md.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
