# Security policy

## Reporting a vulnerability

Please report vulnerabilities **privately** through GitHub's [private vulnerability reporting](https://github.com/Mahbubur-rahman-mishal/fullstack-template/security/advisories/new). Don't open a public issue.

Include:

- a description of the issue and its impact;
- steps to reproduce, or a proof of concept;
- affected files, versions or commits.

You can expect an acknowledgement within **5 working days**. A fix or mitigation plan follows once the report is confirmed.

## Supported versions

Only the latest commit on `main` is supported.

## Security practices in this repository

- Dependency updates (Dependabot), secret scanning with push protection, and static analysis (CodeQL) in CI.
- No long-lived CI credentials: deployments authenticate with OIDC (Workload Identity Federation).
- Secrets are isolated per environment ([ADR 0009](docs/adr/0009-secrets-management.md)). The authentication design follows OWASP guidance ([ADR 0004](docs/adr/0004-session-based-authentication.md)).
