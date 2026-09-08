## What / why

<!-- Business flow, and why this test/change is needed -->

## Checklist (blueprint section 64/65)

- [ ] Flow exists in `flows.json` with correct `@app`/`@flow` tags
- [ ] Raw recording is not included in this PR
- [ ] Existing Pages/Components/Workflows/Fixtures were searched before adding new ones
- [ ] Locators follow the preferred hierarchy (no CSS/XPath/`nth()` misuse)
- [ ] No `page.waitForTimeout()`; assertions are web-first
- [ ] Test is independently executable (no order/state dependency on other tests)
- [ ] Lint, typecheck, and flow validation pass locally
- [ ] No secrets, credentials, or live `storageState` committed
