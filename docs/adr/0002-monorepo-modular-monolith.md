# 0002. Monorepo with a modular monolith backend

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

The template serves small teams and solo developers, with a user base starting at 5–10 people. We want clean boundaries that let the system grow, without the operational cost of distributed systems.

## Decision

- **One repository** holds `backend/`, `frontend/`, `e2e/`, `infra/` and `docs/`. A change that spans layers ships as one PR.
- **The backend is a single deployable Spring Boot app, organised by feature modules.** Each top-level package is a module. **Spring Modulith** verifies in a test that modules use only each other's public APIs or events.
- The frontend mirrors this with `src/features/<feature>`.

## Alternatives considered

- **Microservices:** they bring network failures, distributed transactions and many deployments. None of that is justified at this scale, and it multiplies cost on a free tier.
- **A layered monolith** (controllers/, services/, repositories/): boundaries erode quickly, and features end up scattered across folders.
- **Polyrepo:** cross-cutting changes need coordinated PRs, and versions drift apart.

## Consequences

- **Positive:** simple to run, test and deploy. Module boundaries are checked automatically. A module can be extracted into a service later if it ever needs to be.
- **Negative:** everything scales together, which is fine at this size. Module discipline depends on the Modulith test staying green.
