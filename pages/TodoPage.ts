import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for the TodoMVC app surface.
 * Owns locators and small UI interactions only — no business assertions,
 * no test data, no API calls (see blueprint section 12/13).
 */
export class TodoPage {
  readonly page: Page;
  readonly newTodoInput: Locator;
  readonly todoItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.getByTestId('todo-item');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async addTodo(title: string): Promise<void> {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  async toggleTodo(title: string): Promise<void> {
    await this.todoItems
      .filter({ hasText: title })
      .getByRole('checkbox')
      .check();
  }

  itemByTitle(title: string): Locator {
    return this.todoItems.filter({ hasText: title });
  }

  /**
   * Small reusable page invariant, not a scenario-specific business
   * assertion (blueprint section 12).
   */
  async expectLoaded(): Promise<void> {
    await expect(this.newTodoInput).toBeVisible();
  }
}
