---
name: playwright-best-practices
description: The organization's approved Playwright engineering standard — locators, waits, assertions, isolation, fixtures. Load whenever writing, normalizing, or reviewing Playwright test code in this repository.
---

# Playwright Best Practices (organization standard)

Curated from official Playwright documentation and this repository's own
architecture decisions. See `docs/Enterprise_Playwright_Copilot_Final_Blueprint.md`
for the full rationale — this file is the condensed, load-bearing version
for day-to-day authoring.

**Source provenance** (update this block whenever the skill is revised —
see blueprint section 61 and `docs/adr/skill-provenance.json`):
- Official Playwright Best Practices: https://playwright.dev/docs/best-practices
- Reviewed: 2026-09-07, against Playwright 1.62.1
- Organization overrides: see "Deviations" below

## Locators

Prefer, in order of preference, not strict hierarchy: `getByRole`,
`getByLabel`, `getByPlaceholder`, `getByText`, `getByTestId` (when the app
exposes test ids as a deliberate automation contract). Avoid CSS classes,
deep selectors, XPath, and `nth()` unless position is the actual
requirement. Use `.filter()`/`.and()`/`.or()` to scope instead of chaining
brittle selectors.

## Waiting and assertions

Trust Playwright's auto-waiting. Never use `page.waitForTimeout()`. Use
web-first assertions (`toBeVisible`, `toHaveText`, `toHaveURL`, ...),
`waitForResponse`/`waitForURL` for network-driven state, and
`expect.poll()` for polling a custom condition. Don't substitute
network-idle for a real user-visible readiness signal.

## Isolation

A test must not depend on another test's execution, order, or browser
context. Use fixtures, unique test data, `storageState`, and API setup to
establish state independently per test.

## Fixtures

`test.extend()` is the dependency-injection mechanism. Test-scoped by
default; worker-scoped only when creation cost is high and state cannot
leak between tests.

## Deviations from vanilla Playwright guidance (organization-specific)

- Tests do not mirror Page folders (blueprint section 8) — Pages are
  shared across flows by design.
- Playwright MCP and the native Planner/Generator/Healer agents are
  excluded at every stage (blueprint sections 5-6), regardless of what
  official Playwright guidance recommends adopting.
