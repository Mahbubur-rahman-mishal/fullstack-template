# Agentic workflow

How Claude Code agents collaborate on this repo, and why it's set up this way.

## Roles

| Agent                                           | Owns                                                             | Can edit?                                       |
| ----------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| **Orchestrator** (the main Claude Code session) | Planning, contracts, docs, quality gates, talking with the owner | Yes                                             |
| `backend-engineer`                              | `backend/`                                                       | Yes                                             |
| `frontend-engineer`                             | `frontend/` (SPA and edge Worker)                                | Yes                                             |
| `test-engineer`                                 | `e2e/`, plus test gaps anywhere                                  | Tests only                                      |
| `devops-engineer`                               | `infra/`, `.github/`, `.devcontainer/`, runbooks                 | Yes. Deploy commands need the owner's approval. |
| `reviewer`                                      | –                                                                | **No** (read-only tools)                        |

Definitions live in `.claude/agents/*.md`. Each one has a narrow scope, the tools it's allowed, a definition of done, and a fixed report format.

## Feature flow

```text
Issue / request
  → Orchestrator: plan + acceptance criteria (+ ADR if architectural)
  → Orchestrator: API contract (OpenAPI change), agreed before coding
  → backend-engineer ∥ frontend-engineer      (parallel, separate git worktrees)
  → test-engineer: E2E journey + gap analysis
  → reviewer: independent review of all changed files
  → Orchestrator: fix loop, run all quality gates, update docs
  → PR → CI → owner merges
```

## Why it works

- **Contract first makes parallel work safe.** Backend and frontend build against the same agreed interface, so they can't drift apart.
- **Narrow scopes** keep each agent's context small and focused, and stop one agent overwriting another's work.
- **An independent reviewer** that can't edit gives honest feedback. It reviews code it didn't write.
- **Hooks enforce the critical rules** in Claude Code itself (secrets, migration immutability), rather than relying on prompt instructions.
- **Evidence over claims.** Agents report the exact commands they ran, and the orchestrator re-runs the gates before trusting a report.

## When _not_ to use agents

Each agent starts cold and has to re-read context, which costs time. Do it directly for:

- single-file or obvious edits;
- documentation tweaks;
- questions about the code.

Use agents when work spans areas, can run in parallel, or benefits from an independent review.

## Writing a good agent brief

1. **Goal**, in one sentence.
2. **Acceptance criteria:** testable bullet points.
3. **Context:** relevant files, ADRs and the contract excerpt.
4. **Constraints:** what not to touch, and any deadline or scope limits.
5. **Expected report:** the agent file defines this. Remind it to include the verification commands it ran.
