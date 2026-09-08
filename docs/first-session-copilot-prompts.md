# First Session — Copilot Chat Starter Prompts

A short, low-risk sequence to run the first time you open this repo in
VS Code with Copilot Chat, before touching any real work. Each step
proves one piece of the setup is actually wired up, in increasing order
of risk. Run them in order; don't skip to step 4.

Make sure Copilot Chat is in **agent mode** (the mode dropdown in the
Chat view) before starting — plain "ask" mode won't read repository
files the same way.

---

## 1. Confirm Copilot is actually reading the framework files

```
Summarize the non-negotiables in .github/copilot-instructions.md and tell me which of them apply to files under tests/
```

If the answer correctly recites the MCP prohibition, the
search-before-create rule, and the locator/wait standards — and connects
`tests/` to `tests.instructions.md` — the auto-context loading is working,
not just answering from general Playwright knowledge.

---

## 2. Run the read-only reviewer on the golden example (zero risk)

```
/review-test tests/ui/manage-todos.spec.ts
```

This uses the `framework-reviewer` agent, which cannot edit anything, so
there's nothing to undo if something looks off. It should report that the
test passes every check — locators, waits, tags, isolation — since that
file is the "this is what good looks like" reference. If it doesn't come
back clean, understand why before trusting it on real work.

---

## 3. See the before/after side by side

```
Compare _recordings/manage-todos.raw.example.ts with tests/ui/manage-todos.spec.ts and explain every change a normalization pass would make between them
```

The fastest way to understand what "normalization" actually means —
arbitrary wait removed, CSS locator swapped for a role-based one, a
fixture introduced, identity tags added — rather than just reading about
it in the blueprint.

---

## 4. Do a real one, end to end

Once the first three feel right:

1. Add an entry to `flows.json` for the real flow you're about to record.
2. Use the VS Code recorder ("Record new" in the Testing sidebar) against
   a real page. Save the output under `_recordings/<flow-name>.raw.ts`.
3. Run:

```
/normalize-recording _recordings/<your-file>.raw.ts
```

**Read the diff carefully before accepting it.** This is the human-review
checkpoint the framework's trust boundary depends on (blueprint section 3)
— it is not meant to be accepted blindly.

---

See `VSCode-Copilot-Playwright-Playbook.md` section 5 for the full
pipeline from here through PR and CI, and section 8 for this same
sequence framed as a walkthrough for showing the framework to someone
else.
