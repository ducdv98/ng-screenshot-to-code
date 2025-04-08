import { test, expect } from '@playwright/test';

test.describe('Basic E2E Tests', () => {
  test('basic test', async ({ page }) => {
    // Test a simple page load
    await page.goto('https://example.com');
    
    // Verify the page loaded correctly
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Example Domain');
    
    // Take a screenshot as evidence
    await page.screenshot({ path: 'test-results/basic-test.png' });
  });
}); 