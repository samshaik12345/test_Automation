---
description: Framework/architecture/Playwright-standards review of a test file
argument-hint: path to the spec file to review, e.g. tests/ui/manage-todos.spec.ts
agent: framework-reviewer
---

Review `${input}` against `.github/copilot-instructions.md` and the
`.github/instructions/*.instructions.md` file(s) that apply to it. Do not
edit the file — this is read-only review.

Report, in this order, anything that fails:

1. Locator strategy (preferred hierarchy, no CSS/XPath/`nth()` misuse).
2. Waiting/assertion strategy (no arbitrary waits, web-first assertions).
3. Test isolation (no dependency on execution order or another test's state).
4. Correct layering — should anything here actually be in a Page, Component,
   Workflow, or Fixture instead? Is there an existing one it should reuse?
5. Identity tags present and the flow id exists in `flows.json`.
6. Anything that looks over-abstracted for what it's doing (blueprint
   section 69's overengineering guardrail).

If everything passes, say so explicitly rather than inventing nitpicks.
