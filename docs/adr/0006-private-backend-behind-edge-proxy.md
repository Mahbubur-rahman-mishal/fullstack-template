# 0006. Private Cloud Run behind a Cloudflare Worker edge proxy

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

1. Session cookies need the SPA and API on the **same origin**. Browsers increasingly block third-party cookies, and same-origin avoids CORS entirely.
2. A public Cloud Run URL can be hit directly by anyone. Busy 24/7, one instance would cost about **$65/month**, far above the $1 cap.
3. Cold starts should not show users a blank page.

## Decision

- A **Cloudflare Worker** (`web-{env}`) is the only public entry point.
  - `/*` serves the SPA's static files. These are free, unlimited, and never cold.
  - `/api/*` is proxied to Cloud Run. **All backend routes, including OAuth callbacks, live under `/api`.**
- **Cloud Run is private.** There is no `allUsers` invoker. The Worker attaches a Google **ID token** minted from an `edge-{env}` service account that may only invoke its own environment's service. Google rejects unauthenticated requests before they reach the container, and those requests aren't billed.
- The Worker sets `X-Forwarded-For` (from `CF-Connecting-IP`), `X-Forwarded-Proto` and `X-Forwarded-Host`. Spring trusts them, which is safe because only the Worker can reach Cloud Run.
- The Worker adds the security headers (CSP, HSTS, `frame-ancestors 'none'`, Referrer-Policy).
- On page load, the SPA calls `/api/warmup` to start the backend while the user is still reading or typing. The UI shows "connecting…" states.

## Alternatives considered

- **Public Cloud Run with a shared-secret header:** requests still reach (and bill) the container. This is the fallback if service-account key creation is blocked.
- **Google HTTPS load balancer with Cloudflare IP allow-listing:** about $18/month.
- **Spring Boot serving the SPA on Cloud Run:** a blank page during cold starts, no edge caching, and no cost ceiling.
- **SPA on Pages with the API on a separate domain:** cross-site cookies and CORS.

## Consequences

- **Positive:**
  - First-party cookies, and no CORS.
  - Worst-case cost is held to about $3/month by Cloudflare's free cap of 100,000 requests a day, plus the max-instances limits.
  - The UI loads instantly.
  - Free DDoS protection and WAF.
- **Negative:**
  - The Worker holds a **long-lived GCP service-account key**: Cloudflare has no keyless federation with Google. It is scoped to a single service and rotated every 90 days.
  - One more component to understand.
  - If Cloudflare's daily free quota runs out, the API returns errors until the next day.
