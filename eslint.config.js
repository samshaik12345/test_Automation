// @ts-check
// DEMO NOTE: this is the deterministic enforcement layer behind two of the
// blueprint's non-negotiable rules — "no arbitrary waits" (section 18) and
// "no unawaited promises" — backed by a lint rule that fails the build,
// not just an instruction Copilot is told to follow.
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
// eslint-plugin-playwright adds rules specific to Playwright test patterns
// on top of generic TypeScript linting.
const playwright = require('eslint-plugin-playwright');

module.exports = [
  {
    // _recordings/ is deliberately excluded — raw recorder output is
    // expected to be messy (that's the whole point of it), and it's never
    // meant to pass lint checks. It gets cleaned up during Copilot
    // normalization before it ever reaches tests/.
    ignores: [
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      '**/_recordings/**',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        // `project: true` + `tsconfigRootDir` turn on TYPE-AWARE linting —
        // ESLint understands actual TypeScript types, not just syntax.
        // This is required for @typescript-eslint/no-floating-promises to
        // work at all.
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      playwright,
    },
    rules: {
      // Baseline: the plugin's own recommended rule set.
      ...playwright.configs['flat/recommended'].rules,
      // Catches a missing `await` on something like `page.click()` — in
      // Playwright this fails silently instead of throwing, so this rule
      // is a common source of "why did my test pass when it shouldn't
      // have" bugs if left off.
      '@typescript-eslint/no-floating-promises': 'error',
      // Hard-blocks page.waitForTimeout() at the tooling level — enforces
      // blueprint section 18 even if a human or Copilot forgets to.
      'playwright/no-wait-for-timeout': 'error',
      // Warns (doesn't block) on if/else branching inside a test body —
      // usually a sign the test is doing too much or hiding nondeterminism.
      'playwright/no-conditional-in-test': 'warn',
    },
  },
];
