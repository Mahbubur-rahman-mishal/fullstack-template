# 0005. Serverless hosting: Cloudflare, Cloud Run, Neon in Singapore

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

- The infrastructure budget is a **hard maximum of $1/month, with $0 as the target**.
- Operational simplicity takes priority over always-on availability. Cold starts are acceptable for the initial 5–10 users.
- An Oracle Always Free VM design (two A1 VMs with Compose, Caddy, Ansible and Tailscale) was evaluated and rejected. It meant OS patching and host hardening. Oracle had also just halved its free ARM allowance to 2 OCPU / 12 GB in June 2026, without notice.
- Neon has **no Tokyo region**. The nearest is Singapore (`aws-ap-southeast-1`).

## Decision

| Concern           | Choice                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------- |
| Frontend and edge | Cloudflare Workers with Static Assets (free)                                              |
| Backend           | Google Cloud Run, **`asia-southeast1` (Singapore)**, scale to zero, request-based billing |
| Database          | Neon Postgres free plan, `aws-ap-southeast-1`, one project per environment                |
| Image registry    | Google Artifact Registry in the same region (pulls are free)                              |
| CI/CD             | GitHub Actions, using Workload Identity Federation to reach GCP                           |

Cloud Run runs **next to the database**. Each request crosses the Tokyo–Singapore distance once (about 70 ms), instead of once per SQL query.

**Portability rules:**

- The app is a twelve-factor container. All config comes from env vars or mounted files, and it keeps no local state.
- **No cloud SDKs** in app code. Plain Postgres, with no Neon-specific features.
- Logs go to stdout. Standard health endpoints.
- A Compose and Caddy setup in the repo mirrors production routing, so the same image runs on any VM or container platform.

## Alternatives considered

- **Oracle Always Free VMs:** always on, but high maintenance and a fragile free tier.
- **Render or Koyeb free tiers:** slower cold starts and fewer controls.
- **Cloud Run in Tokyo with Neon in Singapore:** about 70 ms added to every query.
- **Supabase in Tokyo:** free projects pause after 7 days without activity.

## Consequences

- **Positive:**
  - Expected cost is about $0.
  - No servers to maintain.
  - Zero-downtime deploys, and instant rollback by shifting traffic between revisions.
  - Scales up by raising limits.
- **Negative:**
  - **Cold start of about 4–8 s** after roughly 15 minutes idle (mitigations are in ADR 0006 and M8).
  - Data lives in Singapore.
  - Three free tiers that could change.
  - Neon's endpoint is public: protected by TLS and credentials, but not on a private network.
- **Follow-ups:**
  - Verify in the billing console that the free tier applies in `asia-southeast1` (M7a).
  - Measure the cold start (M7b).
