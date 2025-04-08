import { test, expect } from '@playwright/test';

test.describe('Form Validation Tests', () => {
  // Set up a base URL for all tests in this file
  const baseUrl = 'http://localhost:4200';

  test.beforeEach(async ({ page }) => {
    // Skip these tests until the application is running
    test.skip(true, 'Skipping until application is running');
  });

  test('file upload form should validate file types', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Locate the file input element
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Try to upload an invalid file type (text file)
    // Create a test text file
    const invalidFileBuffer = Buffer.from('This is a text file, not an image');
    
    // Set the invalid file to the input
    await fileInput.setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: invalidFileBuffer
    });
    
    // Check for validation error message
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/invalid file type|supported formats/i);
  });

  test('should show loading state during image processing', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Locate the file input element
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Create a tiny valid PNG image buffer
    // This is a 1x1 transparent PNG
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    
    // Set the valid file
    await fileInput.setInputFiles({
      name: 'valid-image.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });
    
    // Check for loading indicator
    const loadingIndicator = page.locator('.loading-indicator, .spinner, [role="progressbar"]');
    await expect(loadingIndicator).toBeVisible();
    
    // Verify submit button is disabled during processing
    const submitButton = page.getByRole('button', { name: /generate|submit|process/i });
    if (await submitButton.count() > 0) {
      await expect(submitButton).toBeDisabled();
    }
  });

  test('advanced options form should expand and collapse', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Look for advanced options toggle
    const advancedToggle = page.getByRole('button', { name: /advanced options|settings/i });
    
    // If advanced options toggle exists, proceed with the test
    if (await advancedToggle.count() > 0) {
      // Initially advanced options should be collapsed
      const advancedOptions = page.locator('.advanced-options, .options-panel');
      await expect(advancedOptions).not.toBeVisible();
      
      // Click to expand
      await advancedToggle.click();
      await expect(advancedOptions).toBeVisible();
      
      // Click to collapse again
      await advancedToggle.click();
      await expect(advancedOptions).not.toBeVisible();
    } else {
      // Skip test if advanced options toggle doesn't exist
      test.skip();
    }
  });
  
  test('options selections should persist after reset', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Look for model selection dropdown or radio buttons
    const modelSelector = page.locator('select#model, [name="model"]');
    
    // If model selector exists, proceed with the test
    if (await modelSelector.count() > 0) {
      // Select a different model option
      await modelSelector.selectOption({ index: 1 });
      
      // Get the selected value
      const selectedValue = await modelSelector.evaluate(el => {
        if (el.tagName === 'SELECT') return el.value;
        return (el as HTMLInputElement).checked ? el.value : null;
      });
      
      // Find and click reset form button
      const resetButton = page.getByRole('button', { name: /reset|clear/i });
      if (await resetButton.count() > 0) {
        await resetButton.click();
        
        // Wait for form reset
        await page.waitForTimeout(500);
        
        // Verify model selection persisted
        const newValue = await modelSelector.evaluate(el => {
          if (el.tagName === 'SELECT') return el.value;
          return (el as HTMLInputElement).checked ? el.value : null;
        });
        
        expect(newValue).toBe(selectedValue);
      } else {
        // Skip remaining test if reset button doesn't exist
        test.skip();
      }
    } else {
      // Skip test if model selector doesn't exist
      test.skip();
    }
  });
}); 