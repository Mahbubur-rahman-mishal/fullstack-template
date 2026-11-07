# Architecture Decision Records

An ADR captures **one significant decision**: its context, what was decided, and the consequences. ADRs are never edited after acceptance except for status changes. To change a decision, write a new ADR that supersedes the old one.

Create a new one by copying [template.md](template.md) to `NNNN-short-title.md`.

| #                                                 | Decision                                                      | Status   |
| ------------------------------------------------- | ------------------------------------------------------------- | -------- |
| [0001](0001-record-architecture-decisions.md)     | Record architecture decisions                                 | Accepted |
| [0002](0002-monorepo-modular-monolith.md)         | Monorepo with a modular monolith backend                      | Accepted |
| [0003](0003-contract-first-rest-api.md)           | Contract-first REST API with OpenAPI                          | Accepted |
| [0004](0004-session-based-authentication.md)      | Session-based authentication (username/password + Google)     | Accepted |
| [0005](0005-serverless-hosting.md)                | Serverless hosting: Cloudflare, Cloud Run, Neon in Singapore  | Accepted |
| [0006](0006-private-backend-behind-edge-proxy.md) | Private Cloud Run behind a Cloudflare Worker edge proxy       | Accepted |
| [0007](0007-database-migrations.md)               | Immutable, expand/contract migrations run as a pre-deploy job | Accepted |
| [0008](0008-no-in-process-background-work.md)     | No in-process background work                                 | Accepted |
| [0009](0009-secrets-management.md)                | Secrets management                                            | Accepted |
| [0010](0010-cost-guardrails.md)                   | Cost guardrails and budget kill switch                        | Accepted |
| [0011](0011-lts-toolchain-and-dev-container.md)   | LTS toolchain in a Dev Container                              | Accepted |
