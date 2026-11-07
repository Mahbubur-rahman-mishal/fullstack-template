# Roadmap

Small, PR-sized milestones. Each one delivers a working capability and ends with verifiable acceptance criteria. Milestones are tracked as [GitHub Milestones](https://github.com/Mahbubur-rahman-mishal/fullstack-template/milestones). Status values are ⬜ planned, 🟨 in progress and ✅ done.

| #   | Milestone                                              | Status |
| --- | ------------------------------------------------------ | ------ |
| M0  | Foundations                                            | ✅     |
| M1  | Backend skeleton                                       | ⬜     |
| M2  | Frontend skeleton                                      | ⬜     |
| M3  | Container image and local stack                        | ⬜     |
| M4  | Continuous integration                                 | ⬜     |
| M5  | Reference feature, built with the multi-agent workflow | ⬜     |
| M6a | Username and password authentication                   | ⬜     |
| M6b | Sign in with Google                                    | ⬜     |
| M7a | Infrastructure as code and cost guardrails             | ⬜     |
| M7b | Deployment pipeline (staging and prod)                 | ⬜     |
| M7c | Backups and disaster recovery                          | ⬜     |
| M8  | Hardening and template release                         | ⬜     |
| M9  | First product from the template                        | ⬜     |

---

## M0: Foundations

**Focus:** repository hygiene, decision records, agent design, reproducible dev environments.

- [x] Repo on GitHub (public). `main` protected by a ruleset (PR required, squash-only, no force-push or deletion, linear history).
- [x] CLAUDE.md, 5 agent definitions, and hooks that block `.env` access and edits to merged migrations (`pnpm test:hooks` passes).
- [x] The Dev Container builds. `java -version` reports 25 and `node -v` reports 26.
- [x] An invalid commit message is rejected by lefthook and commitlint.
- [x] ADRs 0001–0011, architecture overview and engineering standards written.

## M1: Backend skeleton

**Focus:** Spring Boot structure, Modulith, null-safety, integration testing.

- [ ] `./mvnw verify` passes with Spotless, NullAway, Spring Modulith verification and JaCoCo at 80% or more.
- [ ] Flyway `V1` is applied in a Testcontainers Postgres integration test.
- [ ] `/actuator/health/readiness` returns UP, and errors come back as `ProblemDetail`.
- [ ] JSON structured logging. Virtual threads enabled.

## M2: Frontend skeleton

**Focus:** modern React toolchain, server-state management, component testing.

- [ ] `pnpm --filter frontend lint typecheck test build` passes.
- [ ] The page shows backend health through the client generated from OpenAPI.
- [ ] An MSW-backed component test passes. axe reports no violations.

## M3: Container image and local stack

**Focus:** multi-stage Docker builds, Compose networking, E2E testing.

- [ ] A multi-stage, non-root image builds, with a CDS archive and base image pinned by digest.
- [ ] `docker compose up` brings up a healthy app, Postgres, Mailpit, and a Caddy edge that mimics the Worker routing. Only Caddy publishes ports.
- [ ] A Playwright smoke journey passes against Compose.

## M4: Continuous integration

**Focus:** GitHub Actions, quality gates, supply-chain security.

- [ ] A PR with a failing test, a lint error or a bad PR title **cannot merge**.
- [ ] CodeQL, gitleaks and Trivy run. Actions are pinned to SHAs. Permissions are least-privilege.
- [ ] A typical PR run takes under 10 minutes, using path filters and caches.

## M5: Reference feature (multi-agent workflow)

**Focus:** orchestration, contract-first parallel work, vertical slices.

- [ ] One CRUD feature delivered through plan, contract, parallel backend and frontend work, tests, and review.
- [ ] Unit, integration, component and E2E tests. Reviewer findings resolved. Docs updated.

## M6a: Username and password authentication

**Focus:** Spring Security, sessions, threat modelling.

- [ ] Register, verify email (through Mailpit locally), log in, log out and reset password all work.
- [ ] Argon2id hashing. Rate limiting and temporary lockout proven by tests. All sessions revoked on password change.
- [ ] Cookie flags, CSRF and security headers verified by tests. A security review has no high-severity findings.

## M6b: Sign in with Google

**Focus:** OAuth 2.0 and OIDC (PKCE, state, nonce), account linking.

- [ ] Google login works locally. Account linking happens only when both emails are verified.
- [ ] E2E tests cover both login methods (Google is mocked in CI).

## M7a: Infrastructure as code and cost guardrails

**Focus:** Terraform, IAM, cost engineering.

- [ ] `terraform apply` creates the GCP, Cloudflare and Neon resources. A second apply shows 0 changes.
- [ ] Budget alerts fire in a test, and the kill switch is tested. Only the required APIs are enabled.
- [ ] Calling Cloud Run directly without a token returns **403**.

## M7b: Deployment pipeline

**Focus:** build once and promote, keyless CI authentication, progressive rollout.

- [ ] A merge deploys to staging automatically, by digest. Migrations run before traffic shifts.
- [ ] Prod requires approval. **A deliberately broken release rolls itself back.**
- [ ] The N-1 migration compatibility test is green. Cold-start time is measured and recorded.

## M7c: Backups and disaster recovery

**Focus:** RPO and RTO, encryption, restore drills.

- [ ] Nightly encrypted backups with a monitored heartbeat. Retention policy verified.
- [ ] **Restore drill completed** and the recovery time recorded. A prod backup is decrypted locally with the offline key.

## M8: Hardening and template release

- [ ] Correlation IDs, uptime monitoring, image provenance attestation.
- [ ] The secret-rotation runbook is rehearsed. An optional cold-start experiment is done (Java AOT cache or native image).
- [ ] The repo is marked as a GitHub template with a rename script. A new project works in under 30 minutes by following the README.

## M9: First product from the template

- [ ] A product repository generated from the template replaces the demo deployment, and the generation guide is validated end to end.
