<!--
  DEMO NOTE: GitHub auto-fills this template into every new PR's
  description box. Every checklist item below maps directly to a rule from
  the blueprint (docs/Enterprise_Playwright_Copilot_Final_Blueprint.md) —
  this is what makes "human review" concrete rather than a vague step in a
  diagram. HTML comments like this one are invisible once the PR is
  published, but visible while editing — a good place for reviewer notes
  that shouldn't need to survive to the final PR.
-->

## What / why

<!-- Business flow, and why this test/change is needed -->

## Checklist (blueprint section 64/65)

<!-- Each line below is a literal item from the blueprint's "Definition of
     Done" (section 64) and "PR Review Checklist" (section 65) — actually
     check each box rather than leaving them unchecked. -->
- [ ] Flow exists in `flows.json` with correct `@app`/`@flow` tags
- [ ] Raw recording is not included in this PR
- [ ] Existing Pages/Components/Workflows/Fixtures were searched before adding new ones
- [ ] Locators follow the preferred hierarchy (no CSS/XPath/`nth()` misuse)
- [ ] No `page.waitForTimeout()`; assertions are web-first
- [ ] Test is independently executable (no order/state dependency on other tests)
- [ ] Lint, typecheck, and flow validation pass locally
- [ ] No secrets, credentials, or live `storageState` committed
