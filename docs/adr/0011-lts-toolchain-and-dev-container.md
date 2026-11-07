# 0011. LTS toolchain in a Dev Container

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

Developer machines drift: host-installed JDKs and Node versions differ between contributors and from CI, which causes "works on my machine" failures and onboarding friction, especially on Windows. The project standardises on current LTS releases for long support windows.

## Decision

- **Java 25 LTS** (Eclipse Temurin). It's the newest LTS, supported by Spring Boot 4, and its AOT cache can shorten cold starts.
- **Node 26 LTS ("Lithium")** with **pnpm 12**, pinned through `packageManager` in `package.json`.
- Spring Boot, Postgres and other versions are pinned when each milestone introduces them. Postgres matches the newest major version Neon supports.
- All tools are pinned in **`.devcontainer/devcontainer.json`**: Java, Node, pnpm, Docker CLI, gh, Terraform, gcloud and Claude Code. Builds, tests and git commands run inside the Dev Container.
- CI uses the same versions (M4).
- **Version policy:** dependencies must be at least two weeks old before adoption, which avoids freshly published or compromised releases. Dependabot proposes updates weekly.

## Alternatives considered

- **Java 21 LTS:** the original choice, but older, with weaker startup features.
- **Local installs with version managers (SDKMAN, nvm):** setup varies per machine, and Windows needs extra work.

## Consequences

- **Positive:** one-step, identical setup for anyone, including on Windows. No host JDK or Node needed.
- **Negative:**
  - The Docker Desktop and VS Code Dev Containers extensions are required.
  - Bind mounts from the Windows filesystem are slower. Cloning into a container volume or WSL is faster.
  - Node 26 only recently became LTS. If a tool lacks support, fall back to Node 24 LTS and record it here.
