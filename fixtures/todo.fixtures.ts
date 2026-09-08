import { test as base } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

/**
 * Fixture layer: controlled dependency injection for this app.
 * Test-scoped by default (blueprint section 22) — cheap to create, no
 * cross-test state leakage.
 */
type SampleAppFixtures = {
  todoPage: TodoPage;
};

export const test = base.extend<SampleAppFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },
});

export { expect } from '@playwright/test';
