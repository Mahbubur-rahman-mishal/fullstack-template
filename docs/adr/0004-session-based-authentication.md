# 0004. Session-based authentication (username/password + Google)

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

Users must be able to sign in with a username and password, or with Google. Apple sign-in was dropped because it needs a paid developer account. The app is a browser SPA served from the same origin as the API (ADR 0006), and the budget rules out paid identity providers.

## Decision

**Spring Security acts as a backend-for-frontend (BFF).** The browser never handles tokens.

- **Passwords:**
  - Hashed with **Argon2id**, using OWASP parameters (m=19 MiB, t=2, p=1), behind `DelegatingPasswordEncoder` so parameters can be upgraded later.
  - NIST 800-63B rules: at least 12 characters and a breached-password check.
  - Email verification and password reset use single-use, hashed tokens that expire after 30 minutes.
  - Responses never reveal whether an account exists.
- **Google:** Spring `oauth2-client` with OIDC, PKCE, state and nonce. Accounts are linked only when **both** emails are verified. The Google app stays in "testing" mode, with users listed by hand, because the $0 option has no custom domain.
- **Sessions:**
  - Stored by **Spring Session JDBC** in Postgres, because Cloud Run instances are ephemeral.
  - The cookie is `__Host-SESSION`, HttpOnly, Secure and `SameSite=Lax`.
  - The session ID rotates on login. 30-minute idle timeout and 7-day absolute timeout.
  - **All sessions are revoked when a password is changed or reset.**
- **CSRF:** Spring Security's SPA CSRF support, with the token in a cookie and echoed back in a header.
- **Abuse protection:**
  - Bucket4j rate limits per IP and per account, with the counters **in Postgres** so they survive instance churn.
  - Temporary account lockout. There is never a permanent lockout, so attackers can't use it to deny service.
  - A Cloudflare rate-limit rule on `/api/auth/*`.
- **Email:** Gmail SMTP with an app password (the $0 option). Mailpit is used locally.

## Alternatives considered

- **JWTs in localStorage:** vulnerable to XSS token theft, and hard to revoke.
- **Auth0, Clerk or Supabase Auth:** less control over the security model, user data held by a third party, and free-tier limits or lock-in.
- **Keycloak:** a whole extra server to run and pay for.

## Consequences

- **Positive:** follows current OWASP guidance for browser apps. Sessions can be revoked. The user data is ours. There are no tokens in JavaScript.
- **Negative:** we own the security of these flows, so a security review is mandatory on auth changes. Every authenticated request reads the session from the database, which is acceptable at this scale.
