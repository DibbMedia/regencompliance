import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // Vitest's default excludes node_modules but not the temp agent
    // worktrees the Claude Code harness leaves in .claude/worktrees/.
    // Without this exclude, vitest discovers stale duplicate test files
    // inside detached worktree checkouts and runs them against the main
    // source, producing confusing dupe failures.
    exclude: [
      "node_modules/**",
      "dist/**",
      ".next/**",
      ".claude/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
})
