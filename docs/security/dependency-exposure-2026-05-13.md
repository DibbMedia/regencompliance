# Transitive dependency exposure — 2026-05-13

Snapshot of the two transitive HIGH-severity npm advisories surfaced by the
2026-05-13 security audit. Both sit below the CI `npm audit --audit-level=critical`
gate (`.github/workflows/tests.yml`). This file documents the reach paths and
the mitigation rationale so they don't need re-investigating next quarter.

## 1. `@xmldom/xmldom@0.8.12`

- **Advisory chain**: 4 advisories on `<0.8.13` covering DoS via recursion +
  3× XML injection (CWE-91).
- **Reach path**: `mammoth@1.12.0 → @xmldom/xmldom@0.8.12`
- **Runtime entry**: `lib/file-extractor.ts` calls `mammoth` to extract text
  from operator-uploaded `.docx` files in `/api/scan-file`.
- **Why we accept the residual risk**:
  - `/api/scan-file` enforces a **5 MB upload cap** before mammoth ever runs.
  - `validateFile()` does **magic-byte validation** for the DOCX signature; any
    file that isn't a real ZIP container is rejected pre-parse.
  - `mammoth` runs server-side only — no client-side XML parsing.
  - The route is authenticated + rate-limited (15/hr, 200/day).
- **Fix when convenient**: add `"overrides": { "@xmldom/xmldom": "^0.8.13" }`
  to `package.json` and re-run `npm install`. 0.8.13 is the patch release
  in the same minor series so mammoth's usage stays stable.

## 2. `fast-uri@3.1.0`

- **Advisory**: path traversal via %-encoded dots + host confusion (`<=3.1.1`).
- **Reach path**: `shadcn@4.7.0 → @modelcontextprotocol/sdk@1.29.0 → ajv-formats@3.0.1 → ajv@8.18.0 → fast-uri@3.1.0`
- **Runtime entry**: **none.** `shadcn` is a CLI scaffolding tool. It's
  declared in `dependencies` (legacy from initial setup) but never imported
  at runtime — grep `import .* from "shadcn"` returns zero hits in `app/`,
  `lib/`, `proxy.ts`. Tree-shake would drop it.
- **Why we accept the residual risk**: zero runtime reach. The advisory only
  matters if user-controlled input flows into the `fast-uri` parser, which
  cannot happen because the package is never loaded by the deployed bundle.
- **Fix when convenient**: move `shadcn` from `dependencies` to
  `devDependencies` in `package.json`, then re-run `npm install`. Eliminates
  the advisory from `npm audit --omit=dev`.

## CI gate decision

Current gate: `npm audit --audit-level=critical` (lets HIGH through).

Tightening to `--audit-level=high` would block CI until both items above are
addressed. Recommended sequence:

1. Add the `@xmldom/xmldom` override + re-test the `.docx` upload path.
2. Move `shadcn` to `devDependencies` + re-run `npm install` + re-build.
3. Verify `npm audit --omit=dev` reports 0 high + 0 critical.
4. Tighten the CI gate in `.github/workflows/tests.yml` from
   `--audit-level=critical` to `--audit-level=high`.

Until then, this doc is the SOC 2 audit trail for the residual exposure.
