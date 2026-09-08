# Enterprise Playwright + Copilot Framework — Starter Skeleton

This is exactly what `npm init playwright@latest` generates
(`playwright.config.ts`, `tests/example.spec.ts`, `.gitignore`,
`.github/workflows/playwright.yml` — all present, all unmodified), with the
enterprise framework from `docs/Enterprise_Playwright_Copilot_Final_Blueprint.md`
layered on top: a golden example test against the public TodoMVC demo
(https://demo.playwright.dev/todomvc), a Page Object, a fixture, a flow
registry, and the full `.github/` Copilot customization layer.

For the step-by-step guide — from an empty folder through native
Playwright init, layering the framework on top, VS Code/Copilot setup,
and exactly what to type into Copilot Chat at each stage of the
recorder-to-PR workflow — see `docs/VSCode-Copilot-Playwright-Playbook.md`.

## Quick start

```bash
npm install
npx playwright install --with-deps chromium
npx playwright test          # runs both the native example and the golden example
npx playwright show-report   # view the HTML report
```

## Record a new flow

```bash
npm run record   # opens the recorder against the sample app's base URL
```

Save the output under `_recordings/`, then in Copilot Chat:

```
/normalize-recording _recordings/<your-file>.ts
```

See the playbook doc for the full pipeline through PR and CI.
