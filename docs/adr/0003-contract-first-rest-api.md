# 0003. Contract-first REST API with OpenAPI

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

The frontend and backend are written in different languages, and often by different agents working in parallel. Hand-written API types drift apart, and the mismatch is only discovered at runtime.

## Decision

- The API is **REST over JSON**, described by **OpenAPI 3.1**.
- **The contract is agreed first.** An API change starts as a reviewed change to the OpenAPI document, before implementation.
- The backend publishes the spec with springdoc, and CI checks that the generated spec matches the committed `backend/openapi.json`.
- The frontend generates its types and client from that file (`openapi-typescript` and `openapi-fetch`). Generated code is never hand-edited.
- Errors are **RFC 9457 `ProblemDetail`** (`application/problem+json`).
- Versioning: additive changes only. A breaking change needs a new path version and an ADR.

## Alternatives considered

- **GraphQL:** more power than this template needs, and caching and security are more complex.
- **tRPC or shared TypeScript types:** impossible with a Java backend.
- **Code-first without a committed spec:** drift is invisible in PR diffs.

## Consequences

- **Positive:** compile-time type safety across the stack. Backend and frontend can work in parallel safely. API changes are visible in review.
- **Negative:** a regeneration step, plus a CI check to keep it honest.
