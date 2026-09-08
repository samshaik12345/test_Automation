// DEMO NOTE: this is a "Page Object" — one of the framework's core layers
// (blueprint section 12). It models ONE application surface (the TodoMVC
// page) so that tests never talk to raw Playwright locators directly.
// If the app's markup changes, you fix it here once instead of in every
// test that touches this page.
import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for the TodoMVC app surface.
 * Owns locators and small UI interactions only — no business assertions,
 * no test data, no API calls (see blueprint section 12/13).
 */
export class TodoPage {
  // `page` is the raw Playwright Page this object wraps — kept around in
  // case a method here needs it directly (e.g. goto()).
  readonly page: Page;

  // Locator: preferred hierarchy is getByRole > getByLabel > getByPlaceholder
  // > getByText > getByTestId (blueprint section 17). This app exposes a
  // placeholder as its stable, user-visible contract for the input box, so
  // getByPlaceholder is the right call here — not a CSS class or XPath.
  readonly newTodoInput: Locator;

  // getByTestId is used here because the TodoMVC app deliberately exposes
  // `data-testid="todo-item"` as an automation contract on each list row —
  // an explicit test id can be stronger than visible text when the app
  // intentionally supports it (blueprint section 17).
  readonly todoItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.getByTestId('todo-item');
  }

  // Navigates to this page. Tests call this through the `todoPage` fixture
  // (see fixtures/todo.fixtures.ts), not directly — that's what makes it a
  // "dependency" the fixture can inject instead of every test repeating it.
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  // Types a new todo and presses Enter. No `await page.waitForTimeout()`
  // anywhere — Playwright's auto-waiting on `fill`/`press` handles timing
  // (blueprint section 18, enforced by eslint.config.js's
  // playwright/no-wait-for-timeout rule).
  async addTodo(title: string): Promise<void> {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  // `.filter({ hasText: title })` scopes to the one row that matches,
  // instead of a positional `.nth(0)` — position isn't the actual
  // requirement here, the todo's text is (blueprint section 17's "avoid
  // nth() unless position is the requirement" rule).
  async toggleTodo(title: string): Promise<void> {
    await this.todoItems
      .filter({ hasText: title })
      .getByRole('checkbox')
      .check();
  }

  // A small helper the test uses for its own assertions — this method does
  // NOT assert anything itself. Business assertions stay in the test file
  // (blueprint section 11), this just returns the Locator to assert on.
  itemByTitle(title: string): Locator {
    return this.todoItems.filter({ hasText: title });
  }

  /**
   * Small reusable page invariant, not a scenario-specific business
   * assertion (blueprint section 12).
   */
  // DEMO NOTE: this is the one kind of assertion a Page Object is allowed
  // to own — "is this page in its normal loaded state", which is true for
  // every scenario, vs. a business outcome like "was the todo added",
  // which belongs in the test.
  async expectLoaded(): Promise<void> {
    await expect(this.newTodoInput).toBeVisible();
  }
}
