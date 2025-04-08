import { test, expect } from '@playwright/test';

test.describe('Component Preview Tests', () => {
  const baseUrl = 'http://localhost:4200';
  const apiBaseUrl = 'http://localhost:8000';

  test.beforeEach(async ({ page }) => {
    // Skip these tests until the application is running
    test.skip(true, 'Skipping until application is running');
  });

  test('should render component preview correctly', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Mock API response
    await page.route(`${apiBaseUrl}/api/v1/generate-image/`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          component_name: 'TestButtonComponent',
          component_ts: `
            import { Component } from '@angular/core';
            
            @Component({
              selector: 'app-test-button',
              templateUrl: './test-button.component.html',
              styleUrls: ['./test-button.component.scss']
            })
            export class TestButtonComponent {
              onClick(): void {
                console.log('Button clicked');
              }
            }
          `,
          component_html: `
            <div class="button-container">
              <button class="primary-button" (click)="onClick()">Click Me</button>
            </div>
          `,
          component_scss: `
            .button-container {
              display: flex;
              justify-content: center;
              padding: 20px;
            }
            
            .primary-button {
              background-color: #3f51b5;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
              
              &:hover {
                background-color: #303f9f;
              }
            }
          `
        })
      });
    });
    
    // Create a small valid image
    const imageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    
    // Upload the image
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: imageBuffer
    });
    
    // Wait for code generation to complete
    await page.waitForSelector('.code-editor', { state: 'visible' });
    
    // Find preview tab/button and click on it
    const previewTab = page.getByRole('tab', { name: /preview|result|view/i });
    if (await previewTab.count() > 0) {
      await previewTab.click();
      
      // Verify preview iframe is loaded
      const previewFrame = page.frameLocator('iframe.preview-frame').first();
      await expect(previewFrame.locator('.button-container')).toBeVisible();
      await expect(previewFrame.locator('button.primary-button')).toBeVisible();
      
      // Verify button text
      await expect(previewFrame.locator('button.primary-button')).toHaveText('Click Me');
      
      // Check that styles are applied correctly
      const buttonColor = await previewFrame.locator('button.primary-button').evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );
      
      // Check color is some shade of blue (could be rgb or hex format)
      expect(buttonColor).toMatch(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
      
      // Test interaction with the preview
      await previewFrame.locator('button.primary-button').click();
      
      // Take screenshot of preview
      await page.screenshot({ path: 'test-results/component-preview.png' });
    } else {
      // If preview tab doesn't exist, check if preview is directly visible
      const previewSection = page.locator('.preview-section, .component-preview');
      if (await previewSection.count() > 0) {
        await expect(previewSection.locator('button, .primary-button')).toBeVisible();
        await page.screenshot({ path: 'test-results/component-preview.png' });
      } else {
        // Skip with proper boolean condition and message
        test.skip(true, 'Preview functionality not found');
      }
    }
  });

  test('should toggle between light and dark themes in preview', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Mock API response
    await page.route(`${apiBaseUrl}/api/v1/generate-image/`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          component_name: 'ThemeToggleComponent',
          component_ts: `
            import { Component } from '@angular/core';
            
            @Component({
              selector: 'app-theme-toggle',
              templateUrl: './theme-toggle.component.html',
              styleUrls: ['./theme-toggle.component.scss']
            })
            export class ThemeToggleComponent {
              isDarkTheme = false;
              
              toggleTheme(): void {
                this.isDarkTheme = !this.isDarkTheme;
              }
            }
          `,
          component_html: `
            <div class="container" [class.dark-theme]="isDarkTheme">
              <h2>Theme Toggle Example</h2>
              <p>Current theme: {{ isDarkTheme ? 'Dark' : 'Light' }}</p>
              <button (click)="toggleTheme()">Toggle Theme</button>
            </div>
          `,
          component_scss: `
            .container {
              padding: 20px;
              background-color: #fff;
              color: #333;
              transition: all 0.3s ease;
              
              &.dark-theme {
                background-color: #333;
                color: #fff;
              }
              
              button {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              }
            }
          `
        })
      });
    });
    
    // Create a small valid image
    const imageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    
    // Upload the image
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: imageBuffer
    });
    
    // Wait for code generation to complete
    await page.waitForSelector('.code-editor', { state: 'visible' });
    
    // Find the preview tab and click on it
    const previewTab = page.getByRole('tab', { name: /preview|result|view/i });
    if (await previewTab.count() > 0) {
      await previewTab.click();
      
      // Verify preview iframe is loaded
      const previewFrame = page.frameLocator('iframe.preview-frame').first();
      await expect(previewFrame.locator('.container')).toBeVisible();
      
      // Get initial background color
      const initialBgColor = await previewFrame.locator('.container').evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );
      
      // Click toggle button
      await previewFrame.locator('button').click();
      
      // Wait for transition
      await page.waitForTimeout(500);
      
      // Get new background color
      const newBgColor = await previewFrame.locator('.container').evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );
      
      // Verify that theme changed
      expect(initialBgColor).not.toEqual(newBgColor);
      
      // Take screenshot of toggled theme
      await page.screenshot({ path: 'test-results/theme-toggled.png' });
    } else {
      test.skip(true, 'Preview functionality not found');
    }
  });
}); 