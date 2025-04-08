import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Edge Cases and Error Handling Tests', () => {
  const baseUrl = 'http://localhost:4200';
  const apiBaseUrl = 'http://localhost:8000';

  test.beforeEach(async ({ page }) => {
    // Skip these tests until the application is running
    test.skip(true, 'Skipping until application is running');
  });

  test('should handle very large image uploads properly', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Generate a large in-memory image buffer
    // This creates a base64 pattern that will decode to a large file
    let largeImageData = 'iVBORw0KGgoAAAANSUhEUgAABAAAAA';
    // Repeat the pattern to make it larger
    for (let i = 0; i < 20; i++) {
      largeImageData += largeImageData;
    }
    
    // Convert to buffer
    const largeImageBuffer = Buffer.from(largeImageData, 'base64');
    
    // Set up network interception to check for file size error
    let errorResponseReceived = false;
    await page.route(`${apiBaseUrl}/api/v1/generate-image/`, async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        errorResponseReceived = true;
        await route.fulfill({
          status: 413,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'File too large' })
        });
      }
    });
    
    // Locate the file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Upload the large file
    await fileInput.setInputFiles({
      name: 'large-image.png',
      mimeType: 'image/png',
      buffer: largeImageBuffer
    });
    
    // Check for error message about file size
    const errorMessage = page.locator('text=too large, file size, exceeded maximum');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    // Verify that an error response was intercepted
    expect(errorResponseReceived).toBeTruthy();
  });

  test('should handle network failure gracefully', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Create a small valid image
    const imageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    
    // Intercept API calls and simulate network failure
    await page.route(`${apiBaseUrl}/api/v1/generate-image/`, route => route.abort('failed'));
    
    // Locate the file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Upload the image
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: imageBuffer
    });
    
    // Check for error message about network failure
    const errorMessage = page.locator('text=network error, connection failed, try again');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    // Check for retry button
    const retryButton = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryButton).toBeVisible();
    
    // Verify UI is still responsive after error
    expect(await fileInput.isDisabled()).toBeFalsy();
  });

  test('should handle timeout gracefully', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Create a small valid image
    const imageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    
    // Intercept API calls and simulate a timeout
    await page.route(`${apiBaseUrl}/api/v1/generate-image/`, async route => {
      // Wait for a long time to simulate timeout
      await new Promise(resolve => setTimeout(resolve, 30000));
      // This shouldn't execute within the test timeout, but just in case
      await route.fulfill({
        status: 408,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Request timeout' })
      });
    });
    
    // Set a shorter timeout for the test
    test.setTimeout(20000);
    
    // Locate the file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Upload the image
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: imageBuffer
    });
    
    // Check for timeout indicator
    const timeoutMessage = page.locator('text=taking longer than expected, timeout');
    await expect(timeoutMessage).toBeVisible({ timeout: 15000 });
  });

  test('should recover from failed requests by retrying', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Create a small valid image
    const imageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    
    // Set up counter for number of requests
    let requestCount = 0;
    
    // Intercept API calls - first attempt fails, second succeeds
    await page.route(`${apiBaseUrl}/api/v1/generate-image/`, async route => {
      requestCount++;
      
      if (requestCount === 1) {
        // First request fails
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Internal server error' })
        });
      } else {
        // Subsequent requests succeed
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            component_name: 'TestComponent',
            component_ts: 'import { Component } from "@angular/core";\n\n@Component({})\nexport class TestComponent {}',
            component_html: '<div>Test Component</div>',
            component_scss: '.test { color: blue; }'
          })
        });
      }
    });
    
    // Locate the file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Upload the image
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: imageBuffer
    });
    
    // Wait for error message
    const errorMessage = page.locator('text=error, failed, try again');
    await expect(errorMessage).toBeVisible();
    
    // Find and click retry button
    const retryButton = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryButton).toBeVisible();
    await retryButton.click();
    
    // Verify second request succeeds
    const codeElements = page.locator('.code-editor, pre, code');
    await expect(codeElements.first()).toBeVisible();
    
    // Verify request count is 2 (first failed, second succeeded)
    expect(requestCount).toBe(2);
  });
}); 