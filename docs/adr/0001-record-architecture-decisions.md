# 0001. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

This template will be reused for several projects, and both humans and AI agents work on it. Without a record, the reasons behind decisions get lost: the same debates repeat, and agents may "fix" choices that were deliberate.

## Decision

We will record significant decisions as Architecture Decision Records in `docs/adr/`, using the lightweight format in `template.md`.

- A decision is "significant" if it is hard to reverse, affects several areas, or has a cost, security or portability impact.
- Accepted ADRs are immutable. Changes are made by writing a new ADR that supersedes the old one.
- Agents must read the relevant ADRs before planning, and must propose a new ADR rather than silently deviating from an accepted one.

## Alternatives considered

- **Wiki or chat history:** not versioned with the code, and invisible to agents.
- **Comments in code:** too scattered for cross-cutting decisions.

## Consequences

- **Positive:** onboarding and agent context come from the repo itself. Decisions are reviewable in PRs.
- **Negative:** a small writing overhead for each decision.
