# Engineering log

A short retrospective for each milestone: what was delivered, the key decisions, the problems found along the way, and measurable outcomes.

---

## M0: Foundations (2026-11)

**Delivered:**

- Repository conventions.
- A reproducible Dev Container (Java 25 LTS, Node 26 LTS, pnpm 12, Terraform, gcloud).
- An AI-agent operating model with five scoped specialists and enforced guard hooks.
- Commit conventions enforced by git hooks.
- 11 architecture decision records.
- Architecture, testing, workflow and done-criteria documentation.

**Key decisions:**

- **Hosting moved from always-on VMs to serverless before any infrastructure was built** ([ADR 0005](adr/0005-serverless-hosting.md)). An Oracle Always Free VM design was fully specified first. Re-evaluating against the refined requirements (a hard $1/month ceiling, minimal operations) favoured Cloud Run and Neon. It also removed the whole host-management layer: OS patching, Ansible, VPN access and ARM builds.
- **Cost safety is enforced by architecture, not alerts** ([ADR 0006](adr/0006-private-backend-behind-edge-proxy.md), [ADR 0010](adr/0010-cost-guardrails.md)). Budget alerts lag by hours and can't cap spend. Making the backend private behind a free-tier edge proxy bounds worst-case cost structurally.
- **Region chosen by data locality, not price.** The database provider has no Tokyo region, so the compute moved to Singapore, next to the database. That avoids about 70 ms on every query.

**Issues found and resolved:**

| Symptom                                                                 | Root cause                                                                                                                                 | Resolution                                                                                                              |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| The container's create step failed with git's "dubious ownership" error | The bind-mounted repository's owner (UID) differs from the container user. Git's `safe.directory` check ran before the folder was trusted. | Register `safe.directory` at the start of the create step, before any tool invokes git                                  |
| `ERR_PNPM_IGNORED_BUILDS` during install                                | pnpm 12 blocks dependency lifecycle scripts by default, a supply-chain protection                                                          | Explicit allow-list (`allowBuilds`) for the single package that needs a build step, instead of disabling the protection |
| The commit-message hook took **58.6 s**                                 | `node_modules` was read through the Windows to Linux bind mount, which is slow for many small files                                        | Moved `node_modules` to a named Docker volume: **58.6 s → 1.5 s (about 40× faster)**                                    |

**Verification:**

- The Dev Container builds cleanly from scratch.
- 10 guard-hook tests pass on both Windows and Linux.
- An invalid commit message is rejected and a valid one accepted.
