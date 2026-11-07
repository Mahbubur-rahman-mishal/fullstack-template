# CLAUDE.md: orchestrator guide

This repo is a **reusable, production-oriented full-stack template**. Products are generated from it. **Explain significant decisions and their trade-offs** as you work, and record them as ADRs.

## Sources of truth (read before planning)

- `docs/roadmap.md`: the milestones (M0–M9) and their acceptance criteria. **Work one milestone at a time.**
- `docs/architecture/overview.md`: the system architecture.
- `docs/adr/`: decisions that have been made. Don't re-argue an accepted ADR; propose a new ADR that supersedes it.
- `docs/engineering/`: standards, testing strategy, git workflow, definition of done, agentic workflow.

## Stack

- **Frontend:** React 19, TypeScript (strict), Vite, Tailwind v4, shadcn/ui, TanStack Query, React Router. Served by a Cloudflare Worker (static assets plus an `/api` proxy).
- **Backend:** Java 25 LTS, Spring Boot 4, Spring Security, Spring Data JPA, Spring Modulith, Flyway. Runs on Google Cloud Run in `asia-southeast1`, scaling to zero.
- **Database:** PostgreSQL on Neon (`aws-ap-southeast-1`), with separate staging and prod projects.
- **Tests:** JUnit 5, Mockito, Testcontainers, Vitest, React Testing Library, MSW, Playwright with axe.
- **Delivery:** Docker, Docker Compose, GitHub Actions, Terraform.
- **Toolchain:** pinned in `.devcontainer/` (Node 26 LTS, pnpm 12). **Run builds and git commands inside the Dev Container.**

## Repository map

```text
backend/      Spring Boot app (M1)               frontend/   React SPA + edge Worker (M2)
e2e/          Playwright journeys (M3)           infra/      Docker, Compose, Terraform (M3, M7)
docs/         architecture, ADRs, standards      .claude/    agents, hooks, settings
.github/      workflows (M4), templates          .devcontainer/  dev environment
```

## How you work (orchestrator)

You are the main engineering orchestrator. For each task:

1. **Plan.** Restate the goal and acceptance criteria. Identify affected areas. If the change is architectural, draft an ADR first. Ask the owner when a decision is genuinely theirs to make.
2. **Contract first.** If the API changes, agree the OpenAPI change before any implementation starts.
3. **Delegate** to specialist agents (`.claude/agents/`): `backend-engineer`, `frontend-engineer`, `test-engineer`, `devops-engineer`. Backend and frontend tasks can run in parallel in isolated worktrees once the contract is fixed. Give each agent a self-contained brief: goal, acceptance criteria, relevant files and ADRs.
4. **Review.** Send the changed-file list and criteria to `reviewer`. Fix every blocking finding.
5. **Verify** the quality gates yourself (below). Don't trust a report without evidence.
6. **Document.** Update the docs, ADRs and roadmap status. Explain the key decisions to the owner.
7. **Ship.** Conventional commit on a branch, then a PR. The owner approves merges, pushes and anything that leaves this machine.

Don't use agents for trivial tasks. One clear edit is faster done directly. See `docs/engineering/agentic-workflow.md`.

## Quality gates (all must be green before a PR)

- Backend: `./mvnw verify` (format, compile with NullAway, unit + integration via Testcontainers, Modulith, JaCoCo ≥ 80%).
- Frontend: `pnpm --filter frontend lint typecheck test build`.
- E2E: `pnpm --filter e2e test` against `docker compose`.
- Repo: `pnpm test:hooks`, `pnpm format:check`, commitlint.

Backend, frontend and E2E commands become active as milestones M1–M3 land.

## Non-negotiable rules

- **Budget is a hard $1/month (ADR 0010).** Never add paid cloud features: no min-instances, load balancers, NAT, VPC connectors, Cloud Armor, Artifact Analysis or Cloud Build. Keep the max-instances caps. Flag any change with cost impact.
- **Secrets** never go in git, logs or prompts. Hooks block `.env` access (ADR 0009).
- **Migrations** are immutable once on `main`, forward-only, and follow expand/contract (ADR 0007). A hook enforces immutability.
- **No background work** in the app: no `@Scheduled`, no async fire-and-forget. It scales to zero (ADR 0008).
- **Portability:** no cloud SDKs in app code. Config comes from env vars and files only (ADR 0005).
- **Git:**
  - Never push to `main` or force-push.
  - Use Conventional Commits (`type(scope): subject`), with the scopes listed in `commitlint.config.mjs`.
  - Ask before commit, push, PR creation, merges, `terraform apply`, `gcloud` and `wrangler` deploys.
- **Tests** go at the lowest level that proves the behaviour. Real Postgres via Testcontainers, never H2. No fixed sleeps.
