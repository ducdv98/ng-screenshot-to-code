import { test, expect } from '@playwright/test';

test.describe('Component Editing Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toBeVisible();
    
    // Mock the generation API to return test data
    await page.route('**/api/v1/generate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          generated_code: {
            component_name: 'TestComponent',
            typescript: 'import { Component } from "@angular/core";\n\n@Component({\n  selector: "app-test",\n  templateUrl: "./test.component.html",\n  styleUrls: ["./test.component.scss"]\n})\nexport class TestComponent {}',
            html: '<div class="container">\n  <h1>Test Component</h1>\n  <button>Click me</button>\n</div>',
            scss: '.container {\n  display: flex;\n  flex-direction: column;\n}\n\nh1 {\n  color: #333;\n}\n\nbutton {\n  background-color: blue;\n  color: white;\n}',
            warnings: []
          }
        })
      });
    });
    
    // Upload a test image to trigger code generation
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    await page.setInputFiles('input[type="file"]', {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from('mock image data')
    });
    
    // Submit to generate code
    await page.click('button:has-text("Generate")');
    
    // Wait for processing to complete
    await expect(page.locator('text=Processing')).toBeVisible();
    await expect(page.locator('text=Processing')).not.toBeVisible({ timeout: 30000 });
    
    // Verify the code was generated
    await expect(page.locator('text=TestComponent')).toBeVisible();
  });

  test('should edit TypeScript code and update preview', async ({ page }) => {
    // Select the TypeScript tab
    await page.click('text=component.ts');
    
    // Wait for editor to be visible
    const tsEditor = page.locator('.monaco-editor');
    await expect(tsEditor).toBeVisible();
    
    // Simulate editing the TypeScript code
    // First, click in the editor and select all
    await tsEditor.click();
    await page.keyboard.press('Control+a');
    
    // Replace with edited code
    const editedTypescript = 'import { Component, OnInit } from "@angular/core";\n\n@Component({\n  selector: "app-test",\n  templateUrl: "./test.component.html",\n  styleUrls: ["./test.component.scss"]\n})\nexport class TestComponent implements OnInit {\n  title = "Edited Component";\n  \n  ngOnInit(): void {\n    console.log("Component initialized");\n  }\n}';
    
    await page.keyboard.insertText(editedTypescript);
    
    // Apply the changes (button or shortcut)
    await page.click('button:has-text("Apply Changes")');
    
    // Verify the changes are applied (there should be a notification or visual indicator)
    await expect(page.locator('text=Changes applied')).toBeVisible({ timeout: 5000 });
    
    // Mock the preview update API call if needed
    await page.route('**/api/v1/preview', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          html: '<div class="container"><h1>Edited Component</h1><button>Click me</button></div>',
          error: null
        })
      });
    });
    
    // Check if preview is updated (may need to trigger preview refresh)
    await page.click('button:has-text("Refresh Preview")');
    
    // Verify the preview shows the updated content
    const previewFrame = page.frameLocator('iframe.preview-frame');
    await expect(previewFrame.locator('h1:has-text("Edited Component")')).toBeVisible({ timeout: 5000 });
  });

  test('should edit HTML and update preview', async ({ page }) => {
    // Select the HTML tab
    await page.click('text=component.html');
    
    // Wait for editor to be visible
    const htmlEditor = page.locator('.monaco-editor');
    await expect(htmlEditor).toBeVisible();
    
    // Simulate editing the HTML code
    await htmlEditor.click();
    await page.keyboard.press('Control+a');
    
    // Replace with edited code
    const editedHtml = '<div class="container">\n  <h1>Test Component</h1>\n  <p>This is a new paragraph.</p>\n  <button class="primary-button">Submit</button>\n</div>';
    
    await page.keyboard.insertText(editedHtml);
    
    // Apply the changes
    await page.click('button:has-text("Apply Changes")');
    
    // Verify the changes are applied
    await expect(page.locator('text=Changes applied')).toBeVisible({ timeout: 5000 });
    
    // Mock the preview update API call if needed
    await page.route('**/api/v1/preview', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          html: editedHtml,
          error: null
        })
      });
    });
    
    // Refresh preview
    await page.click('button:has-text("Refresh Preview")');
    
    // Verify the preview shows the updated content
    const previewFrame = page.frameLocator('iframe.preview-frame');
    await expect(previewFrame.locator('p:has-text("This is a new paragraph")')).toBeVisible({ timeout: 5000 });
    await expect(previewFrame.locator('button:has-text("Submit")')).toBeVisible({ timeout: 5000 });
  });

  test('should edit SCSS and update preview', async ({ page }) => {
    // Select the SCSS tab
    await page.click('text=component.scss');
    
    // Wait for editor to be visible
    const scssEditor = page.locator('.monaco-editor');
    await expect(scssEditor).toBeVisible();
    
    // Simulate editing the SCSS code
    await scssEditor.click();
    await page.keyboard.press('Control+a');
    
    // Replace with edited code
    const editedScss = '.container {\n  display: flex;\n  flex-direction: column;\n  padding: 20px;\n  background-color: #f5f5f5;\n  border-radius: 8px;\n}\n\nh1 {\n  color: #1976d2;\n  font-size: 24px;\n}\n\nbutton {\n  background-color: #ff4081;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  \n  &:hover {\n    background-color: darken(#ff4081, 10%);\n  }\n}';
    
    await page.keyboard.insertText(editedScss);
    
    // Apply the changes
    await page.click('button:has-text("Apply Changes")');
    
    // Verify the changes are applied
    await expect(page.locator('text=Changes applied')).toBeVisible({ timeout: 5000 });
    
    // Mock the preview update API call if needed
    await page.route('**/api/v1/preview', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          html: '<style>' + editedScss.replace(/\n/g, '') + '</style><div class="container"><h1>Test Component</h1><button>Click me</button></div>',
          error: null
        })
      });
    });
    
    // Refresh preview
    await page.click('button:has-text("Refresh Preview")');
    
    // Since we can't easily test CSS changes visually, we'll verify that the preview loaded without errors
    const previewFrame = page.frameLocator('iframe.preview-frame');
    await expect(previewFrame.locator('.container')).toBeVisible({ timeout: 5000 });
    
    // Take a screenshot to verify visually if needed
    await page.screenshot({ path: 'test-results/scss-editing-result.png' });
  });

  test('should validate component code for errors', async ({ page }) => {
    // Select the TypeScript tab
    await page.click('text=component.ts');
    
    // Wait for editor to be visible
    const tsEditor = page.locator('.monaco-editor');
    await expect(tsEditor).toBeVisible();
    
    // Simulate editing with invalid code
    await tsEditor.click();
    await page.keyboard.press('Control+a');
    
    // Insert code with a deliberate error
    const invalidCode = 'import { Component } from "@angular/core";\n\n@Component({\n  selector: "app-test",\n  templateUrl: "./test.component.html",\n  styleUrls: ["./test.component.scss"\n})\nexport class TestComponent {}';
    
    await page.keyboard.insertText(invalidCode);
    
    // Apply the changes
    await page.click('button:has-text("Apply Changes")');
    
    // Verify error validation message appears
    await expect(page.locator('text=Syntax error')).toBeVisible({ timeout: 5000 });
    
    // Fix the error
    await tsEditor.click();
    await page.keyboard.press('Control+a');
    
    const validCode = 'import { Component } from "@angular/core";\n\n@Component({\n  selector: "app-test",\n  templateUrl: "./test.component.html",\n  styleUrls: ["./test.component.scss"]\n})\nexport class TestComponent {}';
    
    await page.keyboard.insertText(validCode);
    
    // Apply the fixed changes
    await page.click('button:has-text("Apply Changes")');
    
    // Verify no errors are shown
    await expect(page.locator('text=Syntax error')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Changes applied')).toBeVisible({ timeout: 5000 });
  });

  test('should download edited component code', async ({ page }) => {
    // Mock the download functionality
    const downloadPromise = page.waitForEvent('download');
    
    // Click download button
    await page.click('button:has-text("Download")');
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download started with correct file name
    expect(download.suggestedFilename()).toContain('TestComponent');
  });
}); 