import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";

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
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // Disable the base no-unused-vars in favor of the unused-imports
      // plugin's pair: one for imports (auto-fixable), one for vars
      // (still warning-only, ignores _-prefixed names).
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
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
    // Stale worktree leftovers from agent dispatch. Same reason as the
    // vitest exclude (vitest.config.ts) - without this, every `npm run lint`
    // floods on .claude/worktrees/*/ checkouts that aren't real code.
    ".claude/**",
  ]),
]);

export default eslintConfig;
