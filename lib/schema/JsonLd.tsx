/**
 * <JsonLd /> emits a single JSON-LD <script> tag. Accepts either a single
 * schema object or an array, and serialises them as a JSON array. This is
 * the only file in the codebase that should call
 * `dangerouslySetInnerHTML` for structured data - everything else funnels
 * through here.
 *
 * Browsers do not execute application/ld+json blocks, so a CSP nonce is not
 * required for the CSP to allow them. The optional `nonce` prop is forwarded
 * anyway so callers that pass one (e.g. the root layout) stay tidy.
 */
import type { ReactElement } from "react"

type SchemaLike = Record<string, unknown>

interface JsonLdProps {
  schema: SchemaLike | SchemaLike[]
  nonce?: string
}

export function JsonLd({ schema, nonce }: JsonLdProps): ReactElement {
  const payload = Array.isArray(schema) ? schema : [schema]
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // Schemas are server-built from typed builders; no user input flows here.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: payload.length === 1 ? JSON.stringify(payload[0]) : JSON.stringify(payload),
      }}
    />
  )
}
