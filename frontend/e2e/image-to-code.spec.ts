import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Screenshot to Code E2E Tests', () => {
  // Skip this test for now as it requires the frontend and backend to be running
  test.skip('should convert image to Angular components', async ({ page }) => {
    // Navigate to the application (use absolute URL)
    await page.goto('http://localhost:4200/');
    
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