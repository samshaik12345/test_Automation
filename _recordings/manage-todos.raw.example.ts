// NOT A REAL FILE TO RUN — illustrative only.
// This is what typical raw codegen/recorder output looks like before a
// human + Copilot normalization pass. See README.md in this folder.
// Compare against ../tests/ui/manage-todos.spec.ts.

import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
  await page.waitForTimeout(2000); // arbitrary wait — prohibited (section 18)
  await page.locator('.new-todo').click(); // CSS class locator, no fixture
  await page.locator('.new-todo').fill('Buy groceries');
  await page.locator('.new-todo').press('Enter');
  await page.locator('li').nth(0).locator('input.toggle').check(); // nth() by position
  await expect(page.locator('li').nth(0)).toHaveClass('completed'); // no @app/@flow tags, no test.step
});
