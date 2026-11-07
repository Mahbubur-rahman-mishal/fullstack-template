# Runbooks

Step-by-step procedures for operating the system. Each runbook is written, and **rehearsed**, in the milestone shown.

| Runbook                   | Purpose                                                                                           | Milestone |
| ------------------------- | ------------------------------------------------------------------------------------------------- | --------- |
| `bootstrap-cloud.md`      | Create the GCP project, billing, budget, Terraform state bucket, and Cloudflare and Neon accounts | M7a       |
| `deploy-and-rollback.md`  | Normal deploys, manual promotion to prod, rolling back to a previous revision                     | M7b       |
| `restore-database.md`     | Restore a Neon database from an encrypted backup, or use Neon's 6-hour restore window             | M7c       |
| `disaster-recovery.md`    | Rebuild an environment from Terraform and restore its data, with recorded drill results           | M7c       |
| `kill-switch-recovery.md` | What happens when the $0.50 kill switch fires, and how to re-link billing safely                  | M7a       |
| `secret-rotation.md`      | Rotating each secret type without downtime                                                        | M8        |
| `cost-review.md`          | Monthly checklist: billing report, free-tier usage, Neon compute hours                            | M7a       |
