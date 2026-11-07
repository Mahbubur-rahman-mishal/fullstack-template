# Definition of done

A change is **done** only when every applicable item is true. The orchestrator checks it before opening a PR, and the reviewer checks it again.

## Every change

- [ ] Every acceptance criterion is met and demonstrated, with a test or a recorded manual check.
- [ ] The quality gates pass locally (see the commands in CLAUDE.md).
- [ ] No secrets, debug output or commented-out code.
- [ ] Docs are updated: README or architecture for behaviour changes, an ADR for decisions, a runbook for operational changes.
- [ ] Conventional commit or PR title, with the PR template filled in.
- [ ] The reviewer agent reports **APPROVE**, with no blocking findings left.

## Backend changes

- [ ] Unit tests cover the logic. An integration test (Testcontainers) covers persistence and HTTP.
- [ ] Any new migration follows expand/contract, and existing migrations are untouched.
- [ ] The OpenAPI spec is updated, and the frontend client regenerated, if the API changed.
- [ ] Authorisation is checked on any new endpoint, and input is validated.

## Frontend changes

- [ ] Component tests cover the behaviour. Loading, error and empty states exist.
- [ ] axe passes, and the feature is keyboard-navigable.

## Infrastructure and CI changes

- [ ] Cost impact is stated (it must be "none", unless the owner approved otherwise).
- [ ] `terraform validate` and `actionlint` pass. The runbook is updated, and there's a rollback plan.
