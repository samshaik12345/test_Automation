Enterprise Playwright + TypeScript automation framework. Full architecture:
`docs/Enterprise_Playwright_Copilot_Final_Blueprint.md`. Read it before making
structural suggestions.

## Non-negotiables

- Official Playwright guidance is the primary authority. Prefer native
  Playwright capabilities over custom wrappers.
- The recorder produces raw material only. Normalize it before it is
  proposed for commit: search for reuse, fix locators, remove arbitrary
  waits, move business assertions into the test, add `@app`/`@flow` tags.
- Never use Playwright MCP, at any stage, for any reason — including
  recording, exploration, generation, healing, or debugging. This holds
  even though MCP now ships inside `@playwright/test` core.
- Never use the Playwright Agent CLI (`playwright-cli`) to drive a live
  browser during recording or execution. It may only be used, if enabled
  for this workspace, to inspect an already-existing trace, failure, or
  test after a human has requested help — never to explore the app or
  invent scenarios.
- Never propose using Playwright's native Planner, Generator, or Healer
  agents. They are excluded by architectural decision (blueprint section 6).
- Never modify source code as part of a CI/regression run. Code changes
  happen only during development, with a human reviewing the diff.
- Search the repository for an existing Page, Component, Workflow,
  Fixture, API client, Builder, or Utility before creating a new one
  (blueprint section 21). State what you searched and why nothing matched
  before adding a new abstraction.

## Standards to enforce in every suggestion

- Locators: `getByRole`/`getByLabel`/`getByPlaceholder`/`getByText` first;
  `getByTestId` where the app exposes one as a stable contract. Avoid CSS
  classes, deep selectors, XPath, and `nth()` unless position is the actual
  requirement.
- Waits: rely on Playwright's auto-waiting and web-first assertions
  (`toBeVisible`, `toHaveText`, `waitForResponse`, `expect.poll`, ...).
  Never suggest `page.waitForTimeout(...)`.
- Tests own scenario intent and business assertions. Pages own UI surface
  behavior. Components own reusable UI elements. Workflows own repeated
  multi-page business activity — only when reuse justifies it (see the
  decision table in blueprint section 16).
- Every test needs `@app:<application>` and `@flow:<business-flow>` tags,
  and the flow must exist in that app's `flows.json`.
- Fixtures (`test.extend()`) are the dependency-injection mechanism —
  never global singletons or deep `BaseTest` inheritance.
- Keep `packages/core/**` application-agnostic. Flag anything there that
  references an application name, endpoint, or login flow.

When in doubt, prefer asking a clarifying question over generating a new
abstraction.
