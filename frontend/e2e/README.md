# End-to-End Testing Framework for ng-screenshot-to-code

This directory contains end-to-end tests for the ng-screenshot-to-code application using Playwright. These tests validate the functionality of the application from a user's perspective, ensuring that all features work correctly together.

## Test Structure

The tests are organized by feature:

- `basic.spec.ts`: Simple tests to verify the environment is working
- `image-to-code.spec.ts`: Tests for the core image-to-code conversion
- `figma-integration.spec.ts`: Tests for Figma integration features
- `performance.spec.ts`: Tests for performance with large files
- `component-editing.spec.ts`: Tests for component editing capabilities
- `ui-elements.spec.ts`: Tests for UI elements and interactions
- `form-validation.spec.ts`: Tests for form validation
- `api-integration.spec.ts`: Tests for API integration
- `component-preview.spec.ts`: Tests for component preview functionality
- `edge-cases.spec.ts`: Tests for edge cases and error handling

## Running the Tests

### Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Both frontend and backend services configured

### Installation

If you haven't already installed Playwright:

```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

### Run All Tests

To run all tests headlessly (best for CI/CD):

```bash
cd frontend
npm run e2e
```

### Run Tests with UI

To run tests with UI for easier debugging:

```bash
cd frontend
npm run e2e:ui
```

### Run Specific Test Files

To run specific test files:

```bash
cd frontend
npx playwright test figma-integration.spec.ts
```

### Debugging Tests

To debug tests with the Playwright inspector:

```bash
cd frontend
npm run e2e:debug
```

## Test Results

Test results will be stored in:

- HTML report: `frontend/playwright-report/`
- Screenshots: `frontend/test-results/`

## Configuration

The Playwright configuration is in `frontend/playwright.config.ts`. Key settings:

- Timeout: 30 seconds (increased for longer-running operations)
- Browsers: Chrome (Chromium) by default
- Screenshots: Captured on failure

## Adding New Tests

To add new tests:

1. Create a new test file in the `e2e` directory following the naming convention `feature-name.spec.ts`
2. Import the Playwright test utilities
3. Structure your test using `test.describe()` and `test()` functions
4. Use `page.goto()` to navigate and page locators to interact with elements
5. Add assertions using `expect()`

Example:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature Test', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    // Add your test logic here
  });
});
```

## Best Practices

- Keep tests independent of each other
- Use mocks for API calls to ensure predictable behavior
- Take screenshots for visual verification
- Add meaningful descriptions to test blocks
- Test both happy paths and error cases
- Keep tests focused on user-visible behavior
- Use the page object pattern for complex UIs

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [End-to-End Testing Guide](../e2e-test-setup.md) 