# 0007. Immutable, expand/contract migrations run as a pre-deploy job

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

Schema changes are the riskiest part of a deploy. Cloud Run rollbacks only move traffic back to the old app version; they **never undo the schema**. Running migrations at app startup would also slow every cold start, and would put DDL credentials into the running app.

## Decision

- **Flyway** owns the schema. JPA only validates it (`ddl-auto=validate`).
- **Immutable:** a migration on `main` is never edited. A Claude Code hook blocks such edits. Fixes ship as a new `V<n>__*.sql`.
- **Expand/contract:** every migration must keep working with the **previous** app version.
  - Add columns as nullable or with defaults.
  - Rename in three steps: add the new column, backfill, then drop the old one in a _later_ release.
  - Never drop something the previous version still reads.
  - Run long operations such as `CREATE INDEX CONCURRENTLY` in their own non-transactional migration.
- **When migrations run:** as the Cloud Run job `migrate-{env}`, using the same image with a `migrate` profile and the `migrator` role. The pipeline runs it **before** the new version gets traffic.
  - If it fails, the deploy stops. Postgres DDL is transactional, so a failed migration rolls back cleanly.
- **Least privilege:** the app connects as role `app`, which can read and write data but can't change the schema. Only `migrator` holds DDL rights.
- **CI check (from M7b):** the previous release's image runs its smoke tests against the newly migrated schema. This is the N-1 compatibility test.

## Alternatives considered

- **Flyway at app startup:** simpler, but slower cold starts, DDL rights held by the running app, and failures surface only during traffic.
- **Hibernate `ddl-auto=update`:** non-deterministic and unreviewable. Never acceptable in production.
- **Liquibase:** equivalent capability, but Flyway's plain SQL is simpler to read and review.

## Consequences

- **Positive:** rollback is always safe one version back. Faster cold starts. The running app can't damage the schema.
- **Negative:** destructive changes take two releases. Rolling back more than one version is not guaranteed.
