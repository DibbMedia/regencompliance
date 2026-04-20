import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const SERVER_ONLY_PATTERNS = [
  {
    group: [
      "stripe",
      "resend",
      "@anthropic-ai/sdk",
      "openai",
      "@aws-sdk/*",
      "pg",
    ],
    message:
      "Server SDK — do not import from client components. Move to a server route, server action, or server-only lib.",
  },
  {
    group: [
      "@/lib/stripe",
      "@/lib/stripe/*",
      "@/lib/email",
      "@/lib/email/*",
      "@/lib/email-templates",
      "@/lib/anthropic",
      "@/lib/anthropic/*",
      "@/lib/supabase/server",
      "@/lib/supabase/server/*",
      "@/lib/audit-log",
      "@/lib/impersonation",
    ],
    message:
      "Server-only module — do not import from client components. Use a server action or API route.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["components/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: SERVER_ONLY_PATTERNS }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
