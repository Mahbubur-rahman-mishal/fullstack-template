# Coding standards

Formatting is automated. Never argue about it in review: run the formatter. The rules below cover what tools can't decide for you.

## General

- Names say _what_ something is. Comments say _why_, never _what_.
- Prefer small, pure functions and immutable data.
- No dead code, commented-out code, or TODOs without a linked issue.
- Fail fast at boundaries: validate input where it enters the system, then trust it internally.

## Backend (Java 25, Spring Boot 4)

**Structure.** Code is organised by feature, and Spring Modulith verifies module boundaries in a test.

```text
io.github.mahbuburrahmanmishal.template
├── TemplateApplication.java
├── shared/            # cross-cutting: errors, web, security config, time
└── <feature>/         # e.g. habit/
    ├── HabitController.java     (web: request/response records, validation)
    ├── HabitService.java        (use cases, transactions)
    ├── Habit.java               (JPA entity, package-private where possible)
    ├── HabitRepository.java
    └── internal/                (implementation details hidden from other modules)
```

- Modules talk to each other through public service APIs or application events, never through another module's repositories or entities.

**Language and framework.**

- Use records for DTOs, commands and events. **Entities are never exposed over HTTP.**
- Use sealed interfaces and pattern matching for closed sets of results.
- Constructor injection only, with `final` fields. No field injection.
- Use `@ConfigurationProperties` records with `@Validated` for configuration. No `@Value` scattered across classes.
- Mark every package `@NullMarked` (JSpecify). NullAway fails the build on null-safety violations. Use `Optional` only as a return type.
- Errors: throw domain exceptions and map them centrally (`@RestControllerAdvice`) to RFC 9457 `ProblemDetail`. Never leak stack traces.
- Put `@Transactional` on service methods, not controllers. Keep transactions short.
- Time comes from an injected `Clock` and is stored as `Instant`/`timestamptz`. Never call `LocalDateTime.now()` directly.
- Use `RestClient` for outbound HTTP, with explicit timeouts.

**Persistence.**

- Flyway owns the schema, and `spring.jpa.hibernate.ddl-auto=validate`.
- Migration files are `V<n>__<snake_case_description>.sql`. They're immutable once on `main`, and changes follow expand/contract (ADR 0007).
- Avoid N+1 queries: use fetch joins or entity graphs, and assert on query counts in tests where it matters.

**Formatting:** Spotless with palantir-java-format, run by `./mvnw spotless:apply`.

## Frontend (React 19, TypeScript)

**Structure.**

```text
frontend/src
├── app/                 # router, providers, layout
├── features/<feature>/  # components, hooks, schemas for one feature
├── components/ui/       # shadcn/ui primitives (generated, then owned)
├── api/generated/       # OpenAPI client: generated, never hand-edited
└── lib/                 # small shared utilities
```

- TypeScript `strict`. No `any`, and no unchecked `as` casts at API boundaries. Parse with zod instead.
- Server state lives in TanStack Query. UI state lives in local `useState` or the URL. Add no global store unless a real need appears.
- Forms use react-hook-form with zod. The same schema drives validation and the types.
- Style with Tailwind utility classes. Use `cn()` for conditional classes, and design tokens through CSS variables (shadcn theme). Support dark mode.
- Accessibility to WCAG 2.2 AA:
  - semantic elements;
  - every input labelled;
  - visible focus;
  - colour contrast checked;
  - axe passes.
- Every async UI shows loading, error and empty states. Expect cold starts.
- Formatting is Prettier with the Tailwind plugin. Linting is ESLint (typescript-eslint, react-hooks, jsx-a11y).

## SQL

- Write keywords in lowercase and use `snake_case` identifiers.
- Every table has a primary key plus `created_at`/`updated_at` as `timestamptz`.
- Foreign keys are indexed. Use `text` with check constraints instead of Postgres enums, because they're easier to evolve.

## Infrastructure and CI

- Terraform: `terraform fmt`, use modules for anything instantiated per environment, and never use hard-coded secrets.
- Actions are pinned by SHA with least-privilege `permissions`. Shell scripts use `set -euo pipefail` and must pass shellcheck.
