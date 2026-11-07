# 0008. No in-process background work

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

Under Cloud Run's request-based billing, CPU is throttled to almost nothing whenever no request is being processed, and an idle instance may be shut down at any time. A background thread, `@Scheduled` method or fire-and-forget `@Async` task may therefore never run, or may be cut off halfway.

## Decision

- **No `@Scheduled`, no `@Async` fire-and-forget, and no in-memory queues** in the app.
- Work triggered by a request finishes **inside that request**, for example sending the verification email. Timeouts keep it bounded.
- Periodic work runs as a scheduled job outside the request path:
  - **Cleanup** of expired sessions, tokens and rate-limit buckets runs as a Cloud Run job, triggered on a schedule.
  - **Backups** run as a scheduled GitHub Actions workflow.
- Spring Session's built-in cleanup cron is disabled. The cleanup job covers it.

## Alternatives considered

- **Instance-based billing (always-on CPU):** background work becomes reliable, but you pay for every second an instance is alive. That breaks the $1 budget.
- **Cloud Tasks or Pub/Sub for async work:** a good next step if async workloads grow. Unnecessary now.

## Consequences

- **Positive:** behaviour is predictable on serverless, with no "works locally, silently fails in prod" surprises.
- **Negative:** slightly slower requests where work is done inline, and job definitions to maintain.
- The reviewer agent flags any background-execution annotation as a blocking finding.
