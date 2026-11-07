# Contributing

Thanks for your interest in improving this template.

## Development setup

Open the repository in the Dev Container (see the [README](README.md#getting-started)). All tooling is pinned there, and builds, tests and git commands are expected to run inside it.

## Workflow

1. **Open or pick an issue** with clear acceptance criteria. For architectural changes, propose an ADR first ([template](docs/adr/template.md)).
2. **Branch** from `main`: `feat/…`, `fix/…`, `docs/…` ([git workflow](docs/engineering/git-workflow.md)).
3. **Contract first:** API changes start with the OpenAPI document ([ADR 0003](docs/adr/0003-contract-first-rest-api.md)).
4. **Implement with tests** at the right level ([testing strategy](docs/engineering/testing-strategy.md)), following the [coding standards](docs/engineering/coding-standards.md).
5. **Open a PR** using the template. The title must follow [Conventional Commits](https://www.conventionalcommits.org/), because PRs are squash-merged.
6. CI must pass and the [definition of done](docs/engineering/definition-of-done.md) must be met before merge.

## Ground rules

- Never commit secrets. Use `.env.example` to document configuration.
- Never edit a database migration that is already on `main`. Add a new one.
- No changes that introduce cloud costs without an accepted ADR ([ADR 0010](docs/adr/0010-cost-guardrails.md)).

## Reporting security issues

Please don't open public issues for vulnerabilities. See [SECURITY.md](SECURITY.md).
