# 0010. Cost guardrails and budget kill switch

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

The project has a **hard infrastructure budget of $1/month**: exceeding it is not acceptable, even briefly. GCP budgets alert, but they don't stop spending on their own. Billing data also lags by several hours.

## Decision

Defence in depth, ordered from strongest to weakest:

1. **Architecture limits worst-case cost:**
   - Cloud Run is private behind the Worker (ADR 0006), so all traffic is capped by Cloudflare's free quota.
   - Max instances: staging 1, prod 2. Min instances 0.
   - 30-second request timeout. 1 vCPU / 1 GiB per instance.
2. **Free plans stop instead of billing.** Neon free suspends compute or blocks writes at its limits. Cloudflare free returns errors.
3. **GCP budget of $1:**
   - email alerts at $0.10, $0.50 and $1.00 of actual spend;
   - an alert when forecast spend goes over $1.
4. **Kill switch:** when actual spend reaches **$0.50**, a Pub/Sub message triggers a function that **removes billing from the project**, which stops all GCP services.
   - The threshold is half the budget to absorb the delay in billing data.
   - Recovery means re-linking billing (runbook).
5. **Paid features are switched off.** Terraform enables only the required APIs. These are **never** used:
   - Cloud Run min-instances;
   - load balancers;
   - Cloud NAT and VPC connectors;
   - Cloud Armor;
   - Artifact Analysis scanning (Trivy in CI does this instead);
   - Cloud Build.
6. **Housekeeping:**
   - Artifact Registry cleanup keeps 10 recent images and deletes untagged images after 7 days, staying under the 0.5 GB free limit.
   - Cloud Logging keeps 30 days, with health-check noise excluded.
   - The reviewer and devops agents flag any change with cost impact.
   - A monthly cost-review checklist.

**Expected cost:** about $0.00–0.05/month. **Worst case** with all guardrails in place: about $3/month in theory; the kill switch stops it at about $0.50 plus whatever billing delay adds.

## Alternatives considered

- **Alerts only:** they can't enforce a hard cap.
- **Keep-warm pings or min-instances to avoid cold starts:** about $8/month, and they use up Neon's compute hours.

## Consequences

- **Positive:** a hard ceiling, enforced by architecture rather than hope.
- **Negative:** if the kill switch fires, **the app is down** until billing is re-linked. Resources may be deleted if billing stays disabled for a long time. This is a deliberate choice: losing availability is preferred to overspending.
