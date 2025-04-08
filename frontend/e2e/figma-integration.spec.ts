import { test, expect } from '@playwright/test';

test.describe('Figma Integration E2E Tests', () => {
  const mockFigmaUrl = 'https://www.figma.com/file/abcdef123456/Test-Design?node-id=0%3A1';
  const mockPersonalAccessToken = 'figma_pat_mock_token';
  const mockNodeId = '0:1';

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigate to the Figma input tab/section
    await page.locator('button:has-text("Figma")').click();
    
    // Wait for Figma input form to be visible
    await expect(page.locator('form')).toBeVisible();
  });

  test('should validate Figma URL input', async ({ page }) => {
    // Test with invalid URL
    await page.fill('input[placeholder*="Figma URL"]', 'invalid-url');
    await page.click('button:has-text("Submit")');
    
    // Expect error message
    await expect(page.locator('text=Invalid Figma URL')).toBeVisible();
    
    // Test with valid URL
    await page.fill('input[placeholder*="Figma URL"]', mockFigmaUrl);
    
    // Check if the URL is accepted without error
    await expect(page.locator('text=Invalid Figma URL')).not.toBeVisible();
  });

  test('should validate personal access token input', async ({ page }) => {
    // Fill the URL field first
    await page.fill('input[placeholder*="Figma URL"]', mockFigmaUrl);
    
    // Test with empty token
    await page.fill('input[placeholder*="Personal Access Token"]', '');
    await page.click('button:has-text("Submit")');
    
    // Expect error message
    await expect(page.locator('text=Token is required')).toBeVisible();
    
    // Test with valid token
    await page.fill('input[placeholder*="Personal Access Token"]', mockPersonalAccessToken);
    
    // Check if the token is accepted without error
    await expect(page.locator('text=Token is required')).not.toBeVisible();
  });

  test('should be able to select a node from Figma file', async ({ page }) => {
    // Mock API responses for Figma node selection
    await page.route('**/api/v1/figma/nodes**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          nodes: [
            { id: '0:1', name: 'Frame 1' },
            { id: '0:2', name: 'Component 1' }
          ]
        })
      });
    });
    
    // Fill required fields
    await page.fill('input[placeholder*="Figma URL"]', mockFigmaUrl);
    await page.fill('input[placeholder*="Personal Access Token"]', mockPersonalAccessToken);
    
    // Trigger node fetch (this might be a button or part of form submission)
    await page.click('button:has-text("Get Nodes")');
    
    // Check if node selection UI is visible
    await expect(page.locator('text=Select a node')).toBeVisible();
    
    // Select a node
    await page.click('text=Frame 1');
    
    // Verify selection
    await expect(page.locator('text=Selected: Frame 1')).toBeVisible();
  });

  test('should generate code from Figma design', async ({ page }) => {
    // Mock API responses
    await page.route('**/api/v1/generate/figma', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          generated_code: {
            component_name: 'TestComponent',
            typescript: 'import { Component } from "@angular/core";\n\n@Component({\n  selector: "app-test",\n  templateUrl: "./test.component.html",\n  styleUrls: ["./test.component.scss"]\n})\nexport class TestComponent {}',
            html: '<div class="container">\n  <h1>Test Component</h1>\n  <button>Click me</button>\n</div>',
            scss: '.container {\n  display: flex;\n  flex-direction: column;\n}\n\nh1 {\n  color: #333;\n}\n\nbutton {\n  background-color: blue;\n  color: white;\n}',
            warnings: ['Some component instances could not be mapped']
          }
        })
      });
    });
    
    // Fill required fields
    await page.fill('input[placeholder*="Figma URL"]', mockFigmaUrl);
    await page.fill('input[placeholder*="Personal Access Token"]', mockPersonalAccessToken);
    await page.fill('input[placeholder*="Node ID"]', mockNodeId);
    
    // Submit the form
    await page.click('button:has-text("Generate")');
    
    // Wait for processing
    await expect(page.locator('text=Processing')).toBeVisible();
    await expect(page.locator('text=Processing')).not.toBeVisible({ timeout: 30000 });
    
    // Verify generated code is displayed
    await expect(page.locator('text=TestComponent')).toBeVisible();
    
    // Check if code tabs are visible
    await expect(page.locator('text=component.ts')).toBeVisible();
    await expect(page.locator('text=component.html')).toBeVisible();
    await expect(page.locator('text=component.scss')).toBeVisible();
    
    // Check if warnings are displayed
    await expect(page.locator('text=Some component instances could not be mapped')).toBeVisible();
    
    // Check if preview is rendered
    await expect(page.locator('iframe.preview-frame')).toBeVisible();
    
    // Take screenshot of the result
    await page.screenshot({ path: 'test-results/figma-integration-result.png' });
  });
  
  test('should handle Figma API errors gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/v1/generate/figma', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: "Invalid Figma access token"
        })
      });
    });
    
    // Fill required fields
    await page.fill('input[placeholder*="Figma URL"]', mockFigmaUrl);
    await page.fill('input[placeholder*="Personal Access Token"]', 'invalid_token');
    await page.fill('input[placeholder*="Node ID"]', mockNodeId);
    
    // Submit the form
    await page.click('button:has-text("Generate")');
    
    // Verify error message is displayed
    await expect(page.locator('text=Invalid Figma access token')).toBeVisible();
  });
}); 