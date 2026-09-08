# _recordings/

Raw output from the Playwright VS Code Recorder (or `npx playwright codegen`)
lands here temporarily. It is **never merged** (blueprint section 20).

The one file kept in this folder on purpose — `manage-todos.raw.example.ts` —
is not a real recording. It is a deliberately unpolished stand-in, kept only
as a before/after reference so a reviewer (or anyone new to the framework) can compare it
against the normalized version at
`../tests/ui/manage-todos.spec.ts` and see exactly what Copilot's
normalization pass is supposed to fix: no fixtures, no Page Object, no
`test.step`, no identity tags, an arbitrary wait, and a positional `nth()`
locator. Delete it once your team has its own real before/after example.
