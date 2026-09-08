# VS Code + GitHub Copilot + Playwright Recorder — End-to-End Playbook

Companion to `Enterprise_Playwright_Copilot_Final_Blueprint.md`. That
document is the architecture; this one is the literal sequence of clicks,
commands, files, and Copilot Chat prompts to go from an empty folder to a
merged PR running in CI. It assumes the starter skeleton in this repo
(a flat, single-app layout — `tests/`, `pages/`, `fixtures/`, `flows.json`,
`.github/...` at the repo root) as the concrete example — read alongside
the actual files, not in isolation.

Everything here reflects GitHub Copilot's and Playwright's current
mechanisms as of Playwright 1.63.0 and the VS Code Copilot customization
model current as of September 2026. Both surfaces evolve — if a menu name,
CLI prompt, or file location below doesn't match what you see, trust the
in-product docs (`code.visualstudio.com/docs/agent-customization/*` and
`playwright.dev/docs/intro`) over this file, and update this file to match.

**Design principle this whole playbook follows:** nothing here replaces a
file or folder that Playwright itself generates. Every native default —
`playwright.config.ts`, `tests/example.spec.ts`, `.gitignore`,
`.github/workflows/playwright.yml` — stays exactly as Playwright's own
installer creates it. The framework only adds structure around it
(additional folders, additional config files, additional CI checks). If
you already know standard Playwright, everything native here should look
completely familiar; the framework layer is clearly separated from it in
the file tree in section 3.

---

## 0. The one distinction that matters most

Before anything else, get this straight, because the names are confusingly
similar and mixing them up means accidentally breaking the framework's
core governance decision:

| Tool | What it is | Status in this framework |
|---|---|---|
| **Playwright VS Code Recorder** ("Record new" button) / `npx playwright codegen` | A human clicks around a real browser; Playwright watches and writes deterministic code. No AI involved. | **Allowed and expected.** This is how every flow starts. |
| **Playwright Test Runner** (`npx playwright test`, `show-report`, `show-trace`) | Normal, deterministic execution and reporting. | **Allowed everywhere**, locally and in CI. |
| **Playwright Agent CLI** (`playwright-cli`) | A coding-agent tool that lets an LLM drive a live browser itself, step by step. | **Never used to record or execute.** May only be used, if enabled at all, for a human-initiated look at an already-existing failure/trace — never to explore the app or decide what to test. |
| **Playwright MCP** (now bundled in `@playwright/test` as `npx playwright mcp`) | An MCP server that hands an AI agent live browser control. | **Prohibited outright, at every stage**, regardless of it now shipping in core. |
| **Native Playwright Test Agents** (Planner / Generator / Healer) | Playwright's own AI agents for exploring, generating, and self-repairing tests. | **Excluded by decision.** Don't enable them, even experimentally, without discussing it first — they rely on MCP and do exactly what blueprint sections 3/5/6 say not to do. |

The only AI surface used in this framework is **GitHub Copilot Chat
reasoning over static files already on disk** — a raw recording, an
existing test, a trace, a report. It never touches a live browser.

---

## 1. Install your tools

- **VS Code** (latest stable).
- **Node.js** LTS (20.x or newer) — check with `node -v`.
- **Git**, and access to wherever the repo will live.
- VS Code extensions, via the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`):
  - **Playwright Test for VS Code** (publisher: Microsoft, id `ms-playwright.playwright`) — gives you the Testing sidebar, the recorder, and inline run/debug.
  - **GitHub Copilot** and **GitHub Copilot Chat** (publisher: GitHub) — sign in with your GitHub account when prompted; confirm Copilot is enabled for your account.
  - Optional but recommended: **ESLint**, **GitLens**.

Confirm Copilot Chat works: open the Chat view (`Ctrl+Alt+I` / `Cmd+Alt+I`)
and ask it a trivial question. If it asks you to sign in or pick a model,
do that now — pick whatever model is approved for use (see blueprint
section 44; don't just take the default without checking).

---

## 2. From zero to a running native Playwright project

Do this once in a fresh, empty folder before any framework structure
exists, so what Playwright generates on its own is never a mystery.

```bash
mkdir my-project && cd my-project
git init
npm init playwright@latest
```

The installer asks a few questions interactively — answer them like this:

```
✔ Do you want to use TypeScript or JavaScript? · TypeScript
✔ Where to put your end-to-end tests? · tests
✔ Add a GitHub Actions workflow? (y/N) · true
✔ Install Playwright browsers (can be done manually via 'npx playwright install')? (Y/n) · true
```

This generates, exactly as shipped by Playwright, with no modification:

```
package.json                       <- devDependencies: @playwright/test, @types/node
playwright.config.ts               <- full commented default config, all 3 browsers
tests/example.spec.ts              <- Playwright's own sample test (playwright.dev)
.gitignore                         <- node_modules/, /test-results/, /playwright-report/, /blob-report/, /playwright/.cache/, /playwright/.auth/
.github/workflows/playwright.yml   <- default CI: install -> install browsers -> playwright test
```

Confirm it actually works before adding anything:

```bash
npx playwright test
npx playwright show-report
```

You should see the two example tests pass. **Nothing in the rest of this
playbook deletes, renames, or rewrites any of the five items above** —
they keep working exactly as generated. Everything else is additive.

---

## 3. Layer the enterprise framework on top

Two small, additive edits to what section 2 generated:

- `tests/` gains subfolders — `tests/ui/`, `tests/api/`, `tests/e2e/` — for
  your own tests, organized next to Playwright's own `tests/example.spec.ts`,
  which stays in place as a working native reference, not deleted.
- `playwright.config.ts` gets exactly one addition inside the existing
  `use` block: a `baseURL` pointed at your application. Every comment and
  every browser project Playwright generated is left as-is.

Everything else is new, added alongside what's already there — nothing
removed, nothing rewritten:

```
package.json                       [native fields kept] + framework scripts/devDependencies added
playwright.config.ts               [native, unmodified except baseURL]
tests/
  example.spec.ts                  [native, unmodified]
  ui/*.spec.ts                     [added — your own tests]
.gitignore                         [native block kept, framework entries appended below it]
.github/
  workflows/
    playwright.yml                 [native, unmodified]
    pr-validation.yml              [added — architecture/flow-registry enforcement]
  copilot-instructions.md          [added]
  instructions/*.instructions.md   [added]
  prompts/*.prompt.md              [added]
  agents/*.agent.md                [added]
  skills/*/SKILL.md                [added]
  PULL_REQUEST_TEMPLATE.md         [added]

# framework additions with no native equivalent:
flows.json
pages/*.ts
components/*.ts        (only once you actually have a reusable component)
workflows/*.ts         (only once repeated multi-page activity justifies one)
fixtures/*.ts
_recordings/           (temporary — raw recorder output, never merged)
tsconfig.json           (needed for `tsc --noEmit`; Playwright's own test runner doesn't require one)
eslint.config.js
scripts/validate-flows.ts
docs/
```

For a multi-application repo, this same per-application content — the
native `playwright.config.ts`/`tests/` plus the added `pages/`,
`fixtures/`, `flows.json`, etc. — lives under `apps/<app-name>/`, with the
`.github/` customization layer and `docs/` shared once at the repo root
(see blueprint section 7 for the full multi-app layout, and its note that
a new application starts with only what its first flow needs, not the
entire mature layout at once).

Commit the skeleton once it's in place:

```bash
git add .
git commit -m "chore: bootstrap framework skeleton on top of native Playwright init"
git remote add origin <your-repo-url>
git push -u origin main
```

If you're instead joining a repo where this is already set up, `git
clone` it and skip to the file map above — it tells you what should
already be there and where new work goes.

---

## 4. What's on disk and why

```
.github/
  copilot-instructions.md          <- repo-wide rules, always applied to every Copilot Chat request
  instructions/
    tests.instructions.md          <- applies automatically to tests/**
    pages.instructions.md          <- applies automatically to pages|components/**
    core.instructions.md           <- applies automatically to packages/core/** (once a packages/core exists)
  prompts/
    normalize-recording.prompt.md  <- type /normalize-recording in chat
    review-test.prompt.md          <- type /review-test in chat
    analyze-failure.prompt.md      <- type /analyze-failure in chat
  agents/
    recording-normalizer.agent.md  <- selectable in the Chat agent dropdown
    framework-reviewer.agent.md
    failure-analyst.agent.md
  skills/
    playwright-best-practices/SKILL.md   <- loaded automatically when relevant
  workflows/
    playwright.yml                  <- native default CI, unmodified
    pr-validation.yml               <- framework CI: typecheck, lint, flow registry, @smoke tests
  PULL_REQUEST_TEMPLATE.md

flows.json               <- the only place a business flow is "declared"
playwright.config.ts     <- native, plus one added baseURL line
tests/
  example.spec.ts        <- native, unmodified
  ui/*.spec.ts           <- what you write and what CI runs
pages/*.ts                <- Page Objects
fixtures/*.ts              <- test.extend() dependency injection
_recordings/              <- raw recorder output lands here, temporarily, never merged as final

docs/
  Enterprise_Playwright_Copilot_Final_Blueprint.md   <- the architecture
  VSCode-Copilot-Playwright-Playbook.md              <- this file
  adr/skill-provenance.json                          <- tracks where each Skill's guidance came from
```

**Which files are "always on" vs. "you have to ask for them":**

- `copilot-instructions.md`, every `*.instructions.md` whose `applyTo` glob
  matches the file you're editing, and any Skill whose `description`
  matches what you're doing — Copilot pulls these in **automatically**,
  every time, no action needed from you.
- `*.prompt.md` files and `*.agent.md` agents are **manual** — you either
  type `/<prompt-name>` in Chat, or pick the agent from the agent dropdown
  in the Chat view. Nothing in `.github/prompts` or `.github/agents` does
  anything until you invoke it.

---

## 5. The end-to-end workflow for one new flow

Walk through this once with the sample app before doing it on a real
application — it's the fastest way to internalize the pipeline.

### Step 1 — Check the flow registry

Open `flows.json` (at the repo root for a single app, or
`apps/<app>/flows.json` in a multi-app repo). Does this business flow
already have an entry? If yes, use its `id`/`tag`. If no, add one now
(this is a two-line JSON edit, not a Copilot task) — a flow needs to exist
here before a test claiming it can be considered done (blueprint section 64).

### Step 2 — Record, human-driven, no AI

In the VS Code Testing sidebar (the flask icon), find **Record new** (or
**Record at cursor** if you're adding to an existing spec). This opens a
real browser. Click through the scenario exactly as a user would. Playwright
writes code as you go.

Equivalent from a terminal, if you prefer: `npm run record` (wired to
`npx playwright codegen <baseURL>` in this scaffold's `package.json`).

Save the output under `_recordings/<flow-name>.raw.ts`. Compare it against
`_recordings/manage-todos.raw.example.ts` in this scaffold if you want to
see what typical raw output looks like before cleanup.

**Do not** open Copilot yet. Do not try to make the recording perfect by
hand either — that's the next step's job.

### Step 3 — Normalize with Copilot

Open Copilot Chat, make sure you're in **agent mode** (the mode dropdown
in the Chat view — this lets Copilot read/search/edit files, not just
answer questions), and either:

- Select the **Recording Normalizer** agent from the agent dropdown, then
  describe the task, **or**
- Type the prompt file directly:

```
/normalize-recording _recordings/manage-todos.raw.ts
```

What happens: Copilot reads `copilot-instructions.md` (always), the
`tests`/`pages` instructions files (because they match the paths involved),
the `playwright-best-practices` Skill (because it's relevant to what you're
doing), searches the repo for existing Pages/Components/Workflows/Fixtures,
and proposes a diff — new or updated Page Object, a fixture if one doesn't
exist, the test itself with tags and `test.step()`s, an explanation of what
it reused vs. created.

**Read the diff.** This is the human-review checkpoint the blueprint's
trust boundary depends on (section 3). Don't accept it blind. Ask follow-up
questions in the same chat if something looks wrong, e.g.:

```
Why did you create a new Page instead of extending TodoPage?
```

```
This uses getByTestId but the app doesn't expose test ids here — use
getByRole instead and check the accessible name in the actual markup.
```

### Step 4 — Delete the raw recording

Once the normalized version is in `tests/...` and you're happy with it,
delete the file under `_recordings/`. Raw recordings are never committed
as final artifacts (blueprint section 20).

### Step 5 — Run it locally

```bash
npx playwright test --headed        # watch it run
npx playwright test --ui            # or use the interactive UI mode
```

Or click the green run arrow next to the test in the Testing sidebar. Fix
anything that doesn't pass before asking Copilot for anything else — don't
hand Copilot a failing test and ask it to "make it pass" without first
understanding why it failed.

### Step 6 — Self-review with Copilot before opening a PR

```
/review-test tests/ui/manage-todos.spec.ts
```

This uses the **read-only** Framework Reviewer agent — it won't touch the
file, only report findings against the same instructions/skill that
normalization used. Treat this as a pre-flight check, not a substitute for
a human reviewer.

### Step 7 — Lint, typecheck, flow validation (local, deterministic — no AI)

```bash
npm run lint
npm run typecheck
npm run validate:flows
```

Fix anything these catch. This is exactly what CI will run, so failing
here means failing the PR check later — better to catch it now.

### Step 8 — Git workflow

```bash
git checkout -b feat/manage-todos
git add tests pages fixtures flows.json
git commit -m "test: add manage-todos smoke test"
git push -u origin feat/manage-todos
```

Suggested conventions (adjust to whatever standard is already in place —
don't invent a second one if one already exists):

- Branch: `feat/<app>-<flow>` for a new flow, `fix/<app>-<short-desc>` for
  a failure fix, `chore/...` for framework/tooling changes.
- Commit message: [Conventional Commits](https://www.conventionalcommits.org/)
  style (`test:`, `fix:`, `chore:`, `docs:`) reads well in PR history and
  is easy for Copilot to summarize later if asked.
- Never commit anything under `_recordings/` except the one illustrative
  example this scaffold ships with, and never commit `storageState.json`,
  `.env`, or anything else already excluded by `.gitignore`.

Open the PR (`gh pr create` or the web UI). The PR template
(`.github/PULL_REQUEST_TEMPLATE.md`) pre-fills the review checklist from
blueprint section 65 — actually check each box, don't just leave it.

### Step 9 — CI runs automatically

Two workflows run on every PR: the native `playwright.yml` (installs
browsers, runs the full suite) and `pr-validation.yml` (typecheck, lint,
flow registry validation, `@smoke`-tagged tests). Running both at once is
intentionally redundant while the framework is new — once
`pr-validation.yml`'s coverage is trusted, fold whatever's still useful
from `playwright.yml` into it, or keep both; that's a call to make once
you've seen a few real runs, not something to decide up front. Nothing
AI-driven happens in either — if a run goes red, use the failure workflow
below rather than pushing speculative fixes.

### Step 10 — When a test fails (in CI or locally)

```
/analyze-failure tests/ui/manage-todos.spec.ts
```

or point it at a trace file directly. This uses the **Failure Analyst**
agent — read-only, evidence-based, classifies the failure type, proposes a
fix as a diff without applying it. You apply the fix, re-run, and confirm
before pushing.

For visual/step-by-step diagnosis yourself: `npx playwright show-trace
<path-to-trace.zip>`, or click the trace link in the HTML report
(`npx playwright show-report`).

---

## 6. Quick-reference cheat sheet

| Stage | You do this | File(s) involved | Copilot mechanism | AI touches a live browser? |
|---|---|---|---|---|
| Declare the flow | Edit `flows.json` | `flows.json` (or `apps/<app>/flows.json`) | none | No |
| Record | Click "Record new" / `npm run record` | `_recordings/*.raw.ts` | none | No — human only |
| Normalize | `/normalize-recording <path>` in agent mode | reads instructions + Skill, writes to `tests/`, `pages/`, `fixtures/` | `recording-normalizer` agent + prompt file | No — static files only |
| Self-review | `/review-test <path>` | read-only | `framework-reviewer` agent + prompt file | No |
| Local validation | `npm run lint/typecheck/validate:flows`, `npx playwright test` | whole repo | none | No — deterministic tooling |
| PR | `git push`, open PR | `.github/PULL_REQUEST_TEMPLATE.md` | none | No |
| CI | Automatic on PR | `.github/workflows/*.yml` | none | No |
| Diagnose a failure | `/analyze-failure <path or trace>` | reads trace/report/console evidence | `failure-analyst` agent + prompt file | No — evidence only, no re-run |

---

## 7. Editing the customization files themselves

You'll extend these as the framework grows. Quick reference for the
frontmatter each file type actually supports (VS Code will validate this
for you, but know the shape going in):

**`*.instructions.md`** (in `.github/instructions/`):
```yaml
---
description: short description shown on hover
applyTo: "glob/pattern/**/*.ts"   # comma-separate multiple globs
---
```

**`*.prompt.md`** (in `.github/prompts/`):
```yaml
---
description: shown in the / picker
argument-hint: what to pass after the command
agent: ask | agent | plan | <custom-agent-name>
model: optional model override
tools: [optional tool list]
---
```

**`*.agent.md`** (in `.github/agents/`):
```yaml
---
description: placeholder text shown in the chat input when selected
tools: [list of tool ids — open the tool picker in VS Code to see valid ids]
model: optional model or ordered list
user-invocable: true|false
---
```

**`SKILL.md`** (in `.github/skills/<name>/`, name must match the folder):
```yaml
---
name: must-match-folder-name
description: what it does and when to use it (loaded automatically when Copilot judges it relevant)
---
```

When you add a new Skill, update `docs/adr/skill-provenance.json` with its
source and review date in the same PR — that's what makes the section 61
provenance check meaningful instead of decorative.

---

## 8. A first walkthrough of the framework

Useful sequence the first time you show this to someone else, whether
that's a teammate, a new hire, or a wider review:

1. Run `npx playwright test --headed` on the golden example
   (`tests/ui/manage-todos.spec.ts`) first, so they see
   working software before any explanation.
2. Show `_recordings/manage-todos.raw.example.ts` side by side with the
   golden test and narrate the differences out loud — this is the clearest
   way to demonstrate what "normalization" means without reciting the
   blueprint.
3. Open Copilot Chat and run `/review-test` against the golden test live,
   so they see the read-only reviewer agent in action and understand that
   AI participation stops at "diff for a human to approve."
4. Show the PR template checklist and a CI run — this makes the "AI never
   touches CI" boundary concrete instead of theoretical.
5. Keep section 0's table (recorder vs. Agent CLI vs. MCP vs. native
   agents) handy in case someone asks "why not just use Playwright's own
   Healer" — the answer is right there instead of needing to be
   reconstructed on the spot.

---

## 9. Adding this to a project that already has Playwright installed

Sections 2-3 assumed an empty folder. Most real adoptions aren't that —
there's already a `playwright.config.ts`, a `tests/` folder with real
tests, a `package.json`, a `.gitignore`. Do **not** unzip this starter
directly on top of that project — several of its files would silently
overwrite ones that already exist. Treat it as a set of parts, some safe
to drop in as-is and some that need a manual merge, never a bulk copy.

### File-by-file merge plan

| File / folder | If it already exists in the project | If it doesn't exist yet |
|---|---|---|
| `playwright.config.ts` | **Keep the existing one.** Don't replace it. Only add what's missing (a `baseURL` if there isn't one, `testDir` subfolders for organization) by hand-editing it | Copy the starter's version |
| `package.json` | **Merge by hand.** Add the missing `devDependencies` (`eslint-plugin-playwright`, `ts-node`, `typescript`, `@typescript-eslint/*` if not already using them) and the missing `scripts` (`typecheck`, `lint`, `validate:flows`, `record`) — leave everything else untouched | Copy the starter's version, then set `name` back to the project's own |
| `.gitignore` | **Append, don't overwrite** — add only the lines it's missing (`storageState.json`, `.env`, etc.) | Copy the starter's version |
| `tests/` | **Leave existing tests exactly where they are.** Add `tests/ui/`, `tests/api/`, `tests/e2e/` as new subfolders for work going forward. Don't do a big-bang move of old tests into the new shape — that's exactly the kind of unjustified churn blueprint section 69 warns against | Copy the starter's `tests/example.spec.ts` if there's no existing native example, or skip it |
| `tsconfig.json` | If one already exists (likely if the project uses TypeScript elsewhere), check it's compatible with `tsc --noEmit` rather than replacing it | Copy the starter's version |
| `eslint.config.js` (or `.eslintrc.*`) | **Merge, don't replace.** Add the `eslint-plugin-playwright` rules into the existing config | Copy the starter's version |
| `.github/copilot-instructions.md` | If one exists, merge in the non-negotiables (MCP/Agent CLI/native-agent prohibitions, search-before-create, locator/wait standards) rather than overwriting whatever's already there | Copy the starter's version |
| `.github/instructions/`, `.github/prompts/`, `.github/agents/`, `.github/skills/` | These are new folders in almost every existing repo — safe to copy in directly | Copy the starter's version |
| `.github/workflows/pr-validation.yml` | Safe to add as a new file, as long as nothing in the repo already uses that exact filename | Copy the starter's version |
| `.github/workflows/playwright.yml` | If a CI workflow already exists (under any name) that installs browsers and runs `playwright test`, there's no need for a second one — skip this file rather than running two redundant pipelines | Copy the starter's version |
| `.github/PULL_REQUEST_TEMPLATE.md` | If one exists, add the review checklist items into it rather than replacing the whole file | Copy the starter's version |
| `pages/`, `fixtures/`, `flows.json`, `scripts/validate-flows.ts`, `docs/` | No native equivalent — always safe to add directly | Same |

### Sequence

```bash
git checkout -b chore/add-framework-layer

# unzip the starter into a scratch folder next to the project — never
# directly into it, so nothing gets silently overwritten
unzip playwright-framework-starter.zip -d /tmp/framework-starter

# copy over what's purely additive
cp -r /tmp/framework-starter/pw-starter/.github/instructions ./.github/
cp -r /tmp/framework-starter/pw-starter/.github/prompts ./.github/
cp -r /tmp/framework-starter/pw-starter/.github/agents ./.github/
cp -r /tmp/framework-starter/pw-starter/.github/skills ./.github/
cp /tmp/framework-starter/pw-starter/.github/workflows/pr-validation.yml ./.github/workflows/
cp -r /tmp/framework-starter/pw-starter/scripts ./
cp -r /tmp/framework-starter/pw-starter/docs ./
cp /tmp/framework-starter/pw-starter/flows.json ./   # then edit "app" to match the project

# these need a manual look before touching anything —
# open both versions side by side and merge by hand:
#   playwright.config.ts, package.json, .gitignore, tsconfig.json,
#   eslint config, copilot-instructions.md, PULL_REQUEST_TEMPLATE.md
```

Then install what's newly referenced and confirm nothing broke:

```bash
npm install --save-dev eslint-plugin-playwright ts-node typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm run typecheck
npm run lint
npm run validate:flows
npx playwright test
```

### The one adoption trap to avoid

`validate:flows` and the `@app`/`@flow` tag requirement (blueprint sections
9-10) are written assuming every test carries them. An existing suite
won't. Don't turn `pr-validation.yml` into a hard blocker on day one against
a suite that has zero tags yet — that fails every PR immediately and
teaches people to route around the framework rather than adopt it.
Options, roughly in order of how most teams actually do this:

1. Ship `validate:flows` and the tag rules as **warnings, not failures**
   (drop `process.exit(1)` from `scripts/validate-flows.ts` temporarily),
   tightened to a hard failure once the backlog is tagged.
2. Scope enforcement to changed files only — only PRs touching a spec file
   need that file tagged, so untouched legacy tests aren't retroactively
   penalized.
3. Backfill `flows.json` and tags for existing tier-1 flows first (the
   ones that matter most), then flip enforcement on, then backfill the
   rest opportunistically.

Whichever you pick, decide it explicitly and write it down (an ADR per
blueprint section 66 is the right place) rather than leaving CI silently
red or silently permissive.
