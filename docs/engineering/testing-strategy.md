# Testing strategy

**Principle:** test each behaviour at the **lowest level that can prove it**. Fast tests run on every change. Slow tests cover only what nothing else can.

```text
            ▲  E2E: Playwright + axe, against docker compose        few, critical journeys
           ▲▲  Integration: Spring Boot + Testcontainers Postgres   repositories, migrations, HTTP, security
          ▲▲▲  Component: Vitest + RTL + MSW                         UI behaviour with a mocked API
        ▲▲▲▲▲  Unit: JUnit 5 + Mockito + AssertJ / Vitest           domain logic, services, hooks, utils
```

| Level                   | Tools                                                                    | Use it for                                                               | Don't use it for                      |
| ----------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------- |
| Unit (backend)          | JUnit 5, Mockito, AssertJ                                                | Domain rules, service logic with collaborators mocked                    | Anything involving SQL or HTTP wiring |
| Slice (backend)         | `@WebMvcTest` with `MockMvcTester`, `@DataJpaTest`                       | Controller validation, error mapping, security rules; repository queries | Full workflows                        |
| Integration (backend)   | `@SpringBootTest` + **Testcontainers Postgres** via `@ServiceConnection` | Migrations, transactions, end-to-end HTTP through the real database      | UI                                    |
| Architecture            | Spring Modulith `ApplicationModules.verify()`                            | Module boundaries                                                        | –                                     |
| Component (frontend)    | Vitest, React Testing Library, MSW                                       | What the user sees and does in one feature                               | Styling details                       |
| E2E                     | Playwright, `@axe-core/playwright`                                       | Critical journeys across the real stack: sign up, log in, core feature   | Edge cases already covered lower down |
| Migration compatibility | CI job: previous release image + new schema                              | Expand/contract safety (ADR 0007)                                        | –                                     |

## Rules

- **Real Postgres only.** Never use H2 or another in-memory substitute, because the SQL behaves differently. Testcontainers starts Postgres once and reuses it across tests.
- **Deterministic:** an injected `Clock`, no fixed sleeps, no reliance on test order. Each test creates its own data.
- **Black-box assertions:** assert on outputs and observable state. Don't verify every mock interaction.
- **Locators:** Playwright and RTL query by role, label or text, the way users find things.
- **Flaky tests:** quarantine them with an issue, then fix the root cause. Retries hide real problems.
- **Naming:** `methodOrBehaviour_condition_expectedResult`, or a sentence in `@DisplayName` or `test('...')`.

## Coverage gates

- Backend: JaCoCo line coverage of at least **80%** on `src/main`, excluding generated code and configuration. Enforced by `./mvnw verify`.
- Frontend: Vitest coverage of at least **80%** for `src/features` and `src/lib`.
- Coverage is a floor, not a goal. A meaningful assertion beats extra lines covered.

## What runs where

| When                           | What                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------- |
| On save or commit (local)      | Formatters, plus commitlint on the commit message                            |
| Every PR                       | Everything above except prod smoke tests. Path filters skip untouched areas. |
| After a staging or prod deploy | Smoke tests through the public URL                                           |
