# 0009. Secrets management

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

Secrets include database passwords, the Google OAuth client secret, the Gmail app password, the edge service-account key, and the backup encryption key. Staging and prod must be fully isolated, and nothing secret may ever enter git, CI logs or AI prompts.

## Decision

| Secret                                                               | Where it lives                                                                                                  | Who can read it                          |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| App runtime config (DB `app` password, Google secret, SMTP password) | **Secret Manager** `app-{env}`: one YAML secret per environment, mounted as a file                              | Runtime service account `run-{env}` only |
| Migrator credentials                                                 | Secret Manager `migrator-{env}`                                                                                 | `migrate-{env}` job service account only |
| Edge service-account key                                             | Cloudflare Worker secret (encrypted) on `web-{env}`                                                             | The Worker only                          |
| CI access to GCP                                                     | **None stored.** Workload Identity Federation (keyless OIDC), restricted by repo, branch and GitHub Environment | –                                        |
| Operator secrets (backup private key, cloud console access)          | The owner's password manager, plus an offline copy                                                              | The owner                                |

- **Isolation:** every secret, service account and database credential exists separately for each environment. Nothing is shared.
- **Locally:** a `.env` file (gitignored) for local development only, with documented keys in `.env.example`.
- **Agent safety:** `.claude/hooks/guard.mjs` blocks agents from reading, writing or shelling into `.env` files. Settings deny reading keys, `.pem` files and Terraform state.
- **Scanning:** gitleaks runs in CI, and GitHub secret scanning with push protection is on (free for public repos).
- **Rotation** (runbook in M8):

| Secret                                  | Rotate                                                        |
| --------------------------------------- | ------------------------------------------------------------- |
| Database passwords                      | Every 6 months                                                |
| Edge service-account key                | Every 90 days                                                 |
| Google client secret, SMTP app password | Yearly                                                        |
| Backup encryption key                   | Yearly. The old private key is kept until its backups expire. |
| Any secret                              | **Immediately** on suspected exposure                         |

- **Free-tier limit:** Secret Manager is free up to 6 active secret versions. Old versions are **destroyed** after rotation; merely disabled versions still count.

## Alternatives considered

- **Plain Cloud Run environment variables:** visible to anyone with project read access, and hard to rotate cleanly.
- **SOPS-encrypted files in git:** they would leak into every repo created from the template.
- **One secret per value:** would exceed the 6 free versions.

## Consequences

- **Positive:** no long-lived CI credentials, per-environment isolation, and an auditable access trail.
- **Negative:** one long-lived key remains (the edge service-account key, ADR 0006). Losing the offline backup key makes the backups useless, so it is stored in two places.
