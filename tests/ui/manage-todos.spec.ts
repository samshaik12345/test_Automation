import { test, expect } from '../../fixtures/todo.fixtures';

/**
 * Golden example test — this is the shape every normalized recording
 * should converge on. Compare this to a raw recorder output to see what
 * Copilot's normalization pass is supposed to change.
 *
 * Identity tags are mandatory (blueprint section 10).
 */
test(
  'user adds and completes a todo item',
  { tag: ['@app:sample-app', '@flow:manage-todos', '@smoke'] },
  async ({ todoPage }) => {
    await test.step('Confirm the app loaded', async () => {
      await todoPage.expectLoaded();
    });

    await test.step('Add a new todo', async () => {
      await todoPage.addTodo('Buy groceries');
    });

    await test.step('Verify the todo appears in the list', async () => {
      await expect(todoPage.itemByTitle('Buy groceries')).toBeVisible();
    });

    await test.step('Complete the todo', async () => {
      await todoPage.toggleTodo('Buy groceries');
    });

    await test.step('Verify it is marked completed', async () => {
      await expect(todoPage.itemByTitle('Buy groceries')).toHaveClass(/completed/);
    });
  }
);
