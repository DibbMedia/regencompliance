@AGENTS.md

## Token Conservation

- **Compact at 60%:** Compact the conversation when context reaches 60% capacity. Do not wait until the limit.
- **95% Confidence Rule:** Do not make changes unless you have 95% confidence in what needs to be done. If below 95%, ask clarifying questions until you reach it. Do not guess.
- **Minimal Responses:** Keep responses as short as possible. For routine operations like commits, a single line like "Commit completed successfully" is sufficient. No summaries, no restating what was done, no filler. Every token costs money — treat them accordingly.

## General Preferences

Primary stack: TypeScript (main), Python (scraping/scripts), WordPress/PHP (plugins), CSS/HTML. When generating code, default to TypeScript unless the project context is clearly Python or PHP.

## WordPress / Elementor

- When packaging WordPress plugins as zip files, always use forward slashes for paths (even on Windows) and never reinstall a plugin in a way that wipes user settings or API keys. Confirm with the user before making changes beyond the original request scope.
- When deploying to Hostinger specifically: basic auth headers are stripped by their WAF. Use Application Passwords for WordPress REST API, or prefer XML-RPC. Also be aware their WAF may block AJAX requests from plugins.

## Debugging & Problem Solving

- Do not over-engineer solutions or assume root causes without evidence. When debugging, start with the simplest targeted fix and confirm the hypothesis before building complex solutions (e.g., chunk-per-tick rewrites, abstraction layers).

## UI / Design Standards

- Always ensure text contrast meets visibility standards (no dark-on-dark, no ultra-low opacity text). Test color combinations mentally before applying. When the user rejects UI quality, take it seriously and make substantive changes, not incremental tweaks.
