---
description: Page Object and Component modeling rules
applyTo: "pages/**/*.ts,components/**/*.ts,apps/**/pages/**/*.ts,apps/**/components/**/*.ts"
---

Pages model an application surface (`LoginPage`, `CartPage`, ...). Components
model a reusable UI element that multiple Pages compose (`NavigationComponent`,
`DataTable`, ...).

- Locators and small UI interactions live here. Business-flow assertions,
  test data construction, and API calls do not — those belong in the test,
  a Workflow, or the data/API layers.
- `expectLoaded()` (or similar page-invariant checks) is fine — that
  represents the page's stable state, not a scenario's business outcome.
- No mandatory base-class inheritance. A `BasePage` is allowed only for
  behavior that is genuinely common across almost every Page in this app,
  and must stay minimal — do not add generic click/wait/scroll helpers
  Playwright already provides.
- Before adding a new Page or Component, search this app's own `pages`/
  `components` folders first (`apps/<app>/pages`, `apps/<app>/components`
  in a multi-app repo) for something that already models this surface or
  element, then ask before assuming reuse across a different application.
- Do not move a Component into `packages/core` just because it looks
  similar to one in another app — only when the semantics are identical
  (blueprint section 34).
