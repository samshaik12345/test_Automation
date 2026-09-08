---
description: Scenario intent and assertions for spec files
applyTo: "tests/**/*.spec.ts,apps/**/tests/**/*.spec.ts"
---

A test answers "what behavior is being verified", not "which elements were
clicked." Keep it readable end to end without jumping into a Page or
Workflow to understand what's being asserted.

- Compose from fixtures (`todoPage`, a Workflow, `testData`, ...). Do not
  call `page.*` directly in a test that has an equivalent Page/Component
  method available.
- Business/outcome assertions live in the test, not in the Page Object.
- Every test declares `{ tag: ['@app:<app>', '@flow:<flow>', ...] }` and the
  flow id must already exist in that app's `flows.json` — if it doesn't,
  say so and ask whether to add it rather than inventing a new flow.
- Use `test.step()` for meaningful activities (authenticate, create data,
  submit, verify) — not for every click.
- No `page.waitForTimeout()`. No hardcoded dynamic identifiers (emails,
  ids, account numbers) — pull those from a Builder/Factory/TDM fixture.
- One spec file may hold several related tests. Don't force one-test-per-file.
