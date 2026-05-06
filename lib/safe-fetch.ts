import { Agent, fetch as undiciFetch } from "undici"
import { isIP } from "node:net"

import { assertSafeUrl } from "./ssrf"

export interface PinnedFetchInit {
  signal?: AbortSignal
  headers?: Record<string, string>
  redirect?: "manual" | "follow" | "error"
  method?: string
  body?: string | Uint8Array | null
}

/**
 * fetch() variant that pins the underlying TCP connection to the IP
 * resolved by `assertSafeUrl`. Defeats DNS rebinding TOCTOU where the
 * validation lookup returns a public IP and a second lookup at fetch
 * time returns a private one (e.g. 169.254.169.254 IMDS).
 *
 * - SNI / TLS cert validation still uses the URL's hostname (undici sets
 *   `servername` from the request URL, not the connect host).
 * - The Host header is unchanged so virtual-hosted servers route
 *   correctly.
 * - Caller MUST handle redirects manually; we don't follow because each
 *   hop needs its own validation + pin (different hostname could resolve
 *   to a private IP).
 */
export async function pinnedFetch(
  url: string,
  resolvedIps: readonly string[],
  init: PinnedFetchInit = {}
): Promise<Response> {
  if (resolvedIps.length === 0) {
    throw new Error("pinnedFetch: no resolved IPs supplied")
  }
  const ip = resolvedIps[0]
  const family = isIP(ip)
  if (family === 0) {
    throw new Error("pinnedFetch: resolved IP is not a valid v4/v6 address")
  }

  // undici's LookupFunction type expects callback(err, addresses) where
  // `addresses` is `string | LookupAddress[]`. The `as never` cast keeps
  // the implementation simple while still matching the runtime contract -
  // dns.lookup accepts the (err, address, family) form when options.all
  // is false (the default).
  const dispatcher = new Agent({
    connect: {
      lookup: ((
        _hostname: string,
        _options: unknown,
        callback: (
          err: NodeJS.ErrnoException | null,
          address: string,
          family: number,
        ) => void,
      ) => {
        callback(null, ip, family === 6 ? 6 : 4)
      }) as never,
    },
    keepAliveTimeout: 1,
    keepAliveMaxTimeout: 1,
  })

  return (await undiciFetch(url, {
    method: init.method,
    headers: init.headers,
    body: init.body as never,
    signal: init.signal,
    redirect: init.redirect ?? "manual",
    dispatcher,
  })) as unknown as Response
}

/**
 * One-shot safe fetch: validates via assertSafeUrl, then pins the IP for
 * the actual request. Returns null if the URL is unsafe or DNS fails.
 */
export async function safeFetch(
  url: string,
  init: PinnedFetchInit = {}
): Promise<Response | null> {
  const gate = await assertSafeUrl(url)
  if (!gate.ok || !gate.resolvedIps?.length) return null
  return pinnedFetch(url, gate.resolvedIps, init)
}
