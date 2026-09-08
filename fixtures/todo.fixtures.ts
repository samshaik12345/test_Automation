// DEMO NOTE: this is the Fixture layer (blueprint section 22) — the
// framework's dependency-injection mechanism. Instead of every test doing
// `const todoPage = new TodoPage(page); await todoPage.goto();` by hand,
// tests just ask for `todoPage` as a parameter and Playwright constructs
// it for them automatically, once per test.
import { test as base } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

/**
 * Fixture layer: controlled dependency injection for this app.
 * Test-scoped by default (blueprint section 22) — cheap to create, no
 * cross-test state leakage.
 */
// This type is what makes `todoPage` show up with autocomplete in a test's
// parameter list — e.g. `async ({ todoPage }) => { ... }`.
type SampleAppFixtures = {
  todoPage: TodoPage;
};

// `base.extend()` is the framework-preferred pattern (blueprint section 22)
// over global singletons or a deep `BaseTest` class hierarchy — each
// fixture is small, composable, and test-scoped by default so nothing
// leaks state between tests running in parallel.
export const test = base.extend<SampleAppFixtures>({
  // The function below runs fresh for every test that uses `todoPage`.
  // `use(todoPage)` is what actually hands the constructed object to the
  // test; anything after `await use(...)` here would run as teardown,
  // though this fixture doesn't need any.
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },
});

// Re-exporting `expect` from this file (instead of importing it separately
// from '@playwright/test') means a test only needs one import line:
// `import { test, expect } from '../../fixtures/todo.fixtures'`.
export { expect } from '@playwright/test';
