// Next.js instrumentation hook — runs once per server process on startup.
// Validates the env schema defined in lib/env.ts so missing / malformed
// secrets fail loudly at boot instead of silently at the first bad request.
export async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' ||
    process.env.NEXT_RUNTIME === 'edge'
  ) {
    const { validateEnv } = await import('./lib/env')
    validateEnv()
  }
}
