# Change Management Policy

**Last reviewed:** 2026-04-24.

## Principles

- Every production change flows through git on `main`.
- Every change is testable via CI before merge.
- Every change is observable via Vercel's deploy log + commit message.
- Destructive changes (DB migrations, secret rotation, dep removal) require pre-commit review.

## Standard flow

1. Work done locally or via Claude Code agent.
2. Commit with conventional-style message (`security:`, `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `ci:`).
3. Push to `main` (or to a feature branch + PR once branch protection is enabled — see roadmap below).
4. CI runs automatically: `secretlint` + `tests` (vitest + tsc) + `npm-audit` + `CodeQL`.
5. All CI jobs must be green before the Vercel deploy is trusted.
6. Vercel auto-deploys on push; production URL refreshes within minutes.
7. Post-deploy verification: `https://compliance.regenportal.com/api/health` returns current commit SHA in the `version` field.

## Commit message conventions

`<type>(<scope>): <subject>` — subject fits in 72 chars. Body (if needed) wraps at 72 and explains *why*, not *what*. Common types:

| Prefix | Use for |
|---|---|
| `feat:` | New user-facing or architectural capability |
| `fix:` | Bug correction, behavior regression |
| `security:` | Hardening, migration-driven access control, crypto |
| `test:` | New tests or test fixes |
| `docs:` | Documentation-only changes |
| `ci:` | CI/CD pipeline edits |
| `chore:` | Cleanup, dep management, non-user-visible ops |
| `refactor:` | Behavior-preserving code reorganization |

Co-author trailer is included for AI-assisted commits.

## Branch protection (roadmap)

**Current:** Push to `main` is unrestricted. Pragmatic for solo SaaS.

**Planned:**
- Require PR + 1 reviewer for `main` when a second contributor joins
- Require all CI checks passing before merge
- Require linear history (rebase-only)
- Dismiss stale approvals on new commits

Block pattern: GitHub → Settings → Branches → Add rule for `main`.

## Database migrations

Location: `supabase/migrations/NNN_description.sql`.

Numbered sequentially. Idempotent when possible (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `ON CONFLICT`).

Workflow:
1. Write migration file. Commit it to the repo.
2. Paste SQL into Supabase SQL editor for production run.
3. Verify with follow-up SELECT against `pg_policies` / `information_schema`.
4. Add shape-guard tests in `tests/lib/migrations.test.ts` for any security-critical policy.
5. Document in session handoff memory so next session knows the migration landed.

**Never:** Run migrations directly from a client library. Always via Supabase SQL editor so the output is observable and the query is logged against your admin identity.

## Dependency updates

Auto-managed via Dependabot:
- `npm`: weekly, groups security + minor-and-patch, PR limit 5
- `github-actions`: monthly

Manual review required for:
- Any major-version bump (Dependabot groups block these; manually bump after audit)
- Any package added to `dependencies` (not just `devDependencies`)
- Any package with a history of supply-chain incidents

Merge blockers:
- `npm audit --omit=dev --audit-level=critical` must pass (CI enforces). High/moderate CVEs surface in the job log and are picked up by the weekly Dependabot group; run `npm audit --omit=dev` locally to see the full report.
- CodeQL must pass
- Tests + type-check must pass

## Emergency hotfixes

If a Sev-1 requires shipping ASAP:
1. Commit directly to `main` with a `fix:` prefix
2. Short-circuit any manual review (branch protection bypass permitted for the developer role in this case)
3. Post-incident review within 24 hours — document why standard process was skipped
4. Consider adding a regression test to prevent recurrence

## Rollback procedure

Every Vercel deploy retains prior deploys as one-click rollback targets:

1. Vercel Dashboard → Deployments → pick the last known-good → "Promote to Production"
2. This redeploys the older commit instantaneously
3. Meanwhile: identify the bad commit, `git revert <sha>`, push the revert — Vercel redeploys once more to bring `main` back in sync

Use rollback liberally; don't debug in prod.

## Change record

Git history is the authoritative change record. `git log --oneline main` shows every production change with timestamp, author, and commit message. CI run history in GitHub Actions provides the evidence trail.
