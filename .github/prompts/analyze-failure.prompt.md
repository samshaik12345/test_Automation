---
description: Diagnose an existing Playwright test failure from its evidence
argument-hint: path to the failing spec, or to a trace.zip / test-results folder
agent: failure-analyst
---

Diagnose the failure related to `${input}` using only evidence that already
exists (trace, HTML report, console/network/page-error output, the test
source). Do not re-run the test yourself and do not open a live browser to
explore the application.

1. Classify the likely cause: application defect, automation defect, data
   defect, environment defect, or infrastructure/transient defect
   (blueprint section 47). State your confidence.
2. Point to the specific evidence that supports the classification (a
   trace step, a console error, a network response, a diff between
   expected and actual).
3. If this looks like an automation defect, propose a fix as a diff and
   explain why — but do not apply it. The fix gets applied and re-run
   manually after review.
4. If this looks like flakiness rather than a deterministic failure, say
   so explicitly and note it as a quarantine candidate rather than
   proposing a speculative fix.
