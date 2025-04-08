# E2E Testing Setup with Playwright

This document outlines how to set up and run end-to-end tests with Playwright for testing the full integration between the Angular frontend and FastAPI backend.

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Python 3.10+ installed

## Setup Steps

### 1. Install Playwright

```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

### 2. Create Playwright Configuration

Create a `playwright.config.ts` file in the frontend directory:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: [
    {
      command: 'npm run start',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'cd ../backend && uvicorn app.main:app --reload',
      url: 'http://localhost:8000/docs',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    }
  ]
});
```

### 3. Create E2E Test Directory and Sample Test

Create a directory for e2e tests:

```bash
mkdir -p frontend/e2e
```

### 4. Create a Sample E2E Test

Create a file `frontend/e2e/image-to-code.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Screenshot to Code E2E Tests', () => {
  test('should convert image to Angular components', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toBeVisible();
    
    // Prepare to handle file upload
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Upload a test image
    const testImagePath = path.join(__dirname, '../../test_images/simple_ui.png');
    await fileInput.setInputFiles(testImagePath);
    
    // Wait for processing and generation to complete
    await expect(page.locator('text=Processing')).toBeVisible();
    await expect(page.locator('text=Processing')).not.toBeVisible({ timeout: 60000 });
    
    // Verify component code is generated
    await expect(page.locator('.code-editor')).toBeVisible();
    
    // Check if Angular component parts are visible
    await expect(page.locator('text=component.ts')).toBeVisible();
    await expect(page.locator('text=component.html')).toBeVisible();
    await expect(page.locator('text=component.scss')).toBeVisible();
    
    // Take screenshot of the result
    await page.screenshot({ path: 'test-results/e2e-result.png' });
  });
});
```

### 5. Update Package.json with E2E Test Scripts

Add the following scripts to your `package.json`:

```json
"scripts": {
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui",
  "e2e:debug": "playwright test --debug"
}
```

### 6. Create a Full E2E Test Script

Create a script at the project root called `run_e2e_tests.sh`:

```bash
#!/bin/bash

# Create test results directory
mkdir -p test-results

# Run the E2E tests
cd frontend
npm run e2e

# Check if the tests passed
if [ $? -eq 0 ]; then
  echo "✅ E2E tests passed successfully!"
  exit 0
else
  echo "❌ E2E tests failed!"
  exit 1
fi
```

Make the script executable:

```bash
chmod +x run_e2e_tests.sh
```

## Running E2E Tests

To run the tests:

```bash
# Run tests headlessly (CI mode)
./run_e2e_tests.sh

# Or run with UI for debugging
cd frontend
npm run e2e:ui
```

## Test Strategy

1. **Test Basic Flow**: Upload image → Process → View generated code
2. **Test Edge Cases**: Invalid images, large images, network errors
3. **Test Component Preview**: Verify the preview renders correctly
4. **Test Code Download**: Verify code can be downloaded

## Headless Execution

Playwright runs headlessly by default, making it suitable for CI/CD environments. The configuration allows for both headless execution and UI mode for debugging.

## Advanced Configuration

For more advanced configurations, refer to the [Playwright documentation](https://playwright.dev/docs/intro). 