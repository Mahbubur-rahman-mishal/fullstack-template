# Git workflow

**Trunk-based development:** `main` is always releasable, and work happens on short-lived branches.

## Branches

- Name branches `<type>/<short-description>`, for example `feat/habit-streaks`, `fix/login-rate-limit` or `docs/adr-0012`.
- Keep a branch alive for days, not weeks. If a feature is large, split it into smaller PRs.
- Parallel agent work uses `git worktree`, one worktree per agent task. See [agentic-workflow.md](agentic-workflow.md).

## Commits: Conventional Commits

```text
<type>(<scope>): <subject>

[optional body: why, not what]

[optional footer: BREAKING CHANGE: ..., Refs #12]
```

- **Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`, `revert`, `style`.
- **Scopes:** `backend`, `frontend`, `e2e`, `infra`, `ci`, `docs`, `deps`, `claude`, `devcontainer`, `repo`. The scope is optional.
- Lefthook and commitlint enforce this locally, and CI re-checks PR titles from M4.
- Why it matters: release-please generates version numbers and the changelog from these messages (M8).

## Pull requests

- Every change reaches `main` through a PR. **`main` is protected by a ruleset**: a PR is required, there are no force-pushes or deletions, and history stays linear.
- PRs are **squash-merged**, so the PR title becomes the commit on `main` and must follow Conventional Commits.
- Fill in the PR template: what changed, why, how it was tested, risk, and rollback.
- CI must be green (from M4). The reviewer agent must have reviewed the change, and the owner merges.
- Branches are deleted automatically after merge.

## Releases (from M7 and M8)

- Each merge to `main` produces an image tagged `sha-<commit>` and deployed by digest.
- release-please opens a release PR that bumps the semantic version and updates `CHANGELOG.md`.
