/**
 * Lightweight error tracking utility.
 *
 * Current implementation is a console.error wrapper - the project is not
 * wired to a remote error-tracking service yet. When the operator wires
 * Sentry (or LogRocket, Datadog, etc.):
 *   1. Install the SDK as a dep.
 *   2. Add the SDK import + capture call alongside the console.error below.
 *   3. Add the matching withSentryConfig (or equivalent) wrapper in
 *      next.config.ts.
 *
 * This abstraction means every callsite that already uses `captureError()`
 * gets remote tracking for free once the SDK is wired - no callsite churn.
 *
 * Previously this file `require()`d @sentry/nextjs inside a try/catch as
 * "infra-ready" plumbing, but the require produced a build warning on
 * every deploy and the SDK was never installed anyway. Removed in favor
 * of the honest stance: console-only until an operator commits to wiring
 * a remote tracker.
 */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  console.error("[Error]", error, context)
}
