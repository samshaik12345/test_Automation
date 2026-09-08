---
description: Shared core must stay application-agnostic
applyTo: "packages/core/**/*.ts"
---

Everything here is infrastructure with genuinely shared semantics:
configuration, generic fixtures, generic data lifecycle, generic API
infrastructure, diagnostics, logging, reporting, shared types.

- Zero application-specific semantics. No application name, endpoint URL,
  login flow, selector, or business term may appear here.
- If a change here is motivated by one application's need, stop and ask
  whether it belongs in that application's own layer instead
  (blueprint section 33 — "bad candidates for core").
- Anything added here is a shared-core candidate only when the same
  semantics (not just similar-looking code) are needed identically across
  multiple applications (blueprint section 34).
- A change here can affect every application. Call this out explicitly and
  suggest running the full framework check suite, not just this app's tests.
