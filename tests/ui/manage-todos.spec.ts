// Note the import path: this comes from fixtures/todo.fixtures.ts, NOT
// directly from '@playwright/test'. That's what gives this test access to
// the `todoPage` fixture below — importing from '@playwright/test' instead
// would silently lose it.
import { test, expect } from '../../fixtures/todo.fixtures';

/**
 * Golden example test — this is the shape every normalized recording
 * should converge on. Compare this to a raw recorder output to see what
 * Copilot's normalization pass is supposed to change.
 *
 * Identity tags are mandatory (blueprint section 10).
 */
// DEMO NOTE: this whole file is the "after" — open
// _recordings/manage-todos.raw.example.ts side by side as the "before" and
// this is exactly what a Copilot normalization pass is supposed to produce.
test(
  'user adds and completes a todo item',
  // Two tags are mandatory on every test (blueprint section 10):
  //   @app:<application>  — which app this belongs to
  //   @flow:<business-flow> — must already exist in flows.json, or
  //     validate-flows.ts / a Copilot review will flag it
  // @smoke is optional and just marks this for the fast CI lane that
  // .github/workflows/pr-validation.yml runs on every PR.
  { tag: ['@app:sample-app', '@flow:manage-todos', '@smoke'] },
  // `todoPage` here is NOT a plain Playwright `page` — it's the fixture
  // from fixtures/todo.fixtures.ts, already navigated and ready to use.
  async ({ todoPage }) => {
    // test.step() groups related actions in the HTML report — it's used
    // for meaningful activities (blueprint section 53), not every click.
    await test.step('Confirm the app loaded', async () => {
      await todoPage.expectLoaded();
    });

    await test.step('Add a new todo', async () => {
      await todoPage.addTodo('Buy groceries');
    });

    // Business/outcome assertions live in the TEST, never in the Page
    // Object (blueprint section 11) — this is why `expect(...)` is called
    // here and not inside TodoPage.ts.
    await test.step('Verify the todo appears in the list', async () => {
      await expect(todoPage.itemByTitle('Buy groceries')).toBeVisible();
    });

    await test.step('Complete the todo', async () => {
      await todoPage.toggleTodo('Buy groceries');
    });

    // Web-first assertion (blueprint section 19) — `toHaveClass` retries
    // automatically until it passes or times out, no manual wait needed.
    await test.step('Verify it is marked completed', async () => {
      await expect(todoPage.itemByTitle('Buy groceries')).toHaveClass(/completed/);
    });
  }
);
