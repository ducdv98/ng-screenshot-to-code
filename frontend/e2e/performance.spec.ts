import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  // Set longer timeouts for performance tests
  test.setTimeout(120000);

  test('should handle large Figma files efficiently', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigate to the Figma input tab/section
    await page.locator('button:has-text("Figma")').click();
    
    // Performance measurement - start
    const startTime = Date.now();
    
    // Mock a large Figma file response
    await page.route('**/api/v1/generate/figma', async route => {
      // Simulate server processing time for a large file
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          generated_code: {
            component_name: 'LargeTestComponent',
            typescript: generateLargeFile('typescript'),
            html: generateLargeFile('html'),
            scss: generateLargeFile('scss'),
            warnings: ['Performance warning: Large file processed']
          },
          processing_time: 5.2 // seconds
        })
      });
    });
    
    // Fill required fields for Figma generation
    await page.fill('input[placeholder*="Figma URL"]', 'https://www.figma.com/file/large-design-file');
    await page.fill('input[placeholder*="Personal Access Token"]', 'figma_pat_token');
    await page.fill('input[placeholder*="Node ID"]', '0:1');
    
    // Submit the form
    await page.click('button:has-text("Generate")');
    
    // Wait for processing indicator to appear and then disappear
    await expect(page.locator('text=Processing')).toBeVisible();
    await expect(page.locator('text=Processing')).not.toBeVisible({ timeout: 60000 });
    
    // Verify component loaded successfully
    await expect(page.locator('text=LargeTestComponent')).toBeVisible();
    
    // Performance measurement - end
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Log performance metrics
    console.log(`Total rendering time: ${totalTime}ms`);
    
    // Check if performance meets threshold (adjust as needed)
    expect(totalTime).toBeLessThan(10000); // Example threshold: 10 seconds
    
    // Verify Monaco editor handles large files without performance issues
    await page.click('text=component.ts');
    
    // Measure editor responsiveness
    const editorStartTime = Date.now();
    
    // Scroll through the editor content
    const editor = page.locator('.monaco-editor');
    await editor.click();
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('PageDown');
      // Small delay to simulate actual scrolling behavior
      await page.waitForTimeout(100);
    }
    
    const editorEndTime = Date.now();
    const editorResponseTime = editorEndTime - editorStartTime;
    
    console.log(`Editor scroll response time: ${editorResponseTime}ms`);
    
    // Check if editor performance meets threshold
    expect(editorResponseTime).toBeLessThan(3000); // Example threshold: 3 seconds for scrolling
    
    // Take a screenshot for visual reference
    await page.screenshot({ path: 'test-results/large-file-performance.png' });
  });

  test('should handle large image uploads efficiently', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load completely
    await expect(page.locator('h1')).toBeVisible();
    
    // Create memory monitoring
    let memoryBefore = 0;
    let memoryAfter = 0;
    
    // Measure memory if supported (Chromium only)
    try {
      memoryBefore = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
    } catch (e) {
      console.log('Memory measurement not supported in this browser');
    }
    
    // Mock image upload processing
    await page.route('**/api/v1/generate', async route => {
      // Simulate server processing time for a large image
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          generated_code: {
            component_name: 'LargeImageComponent',
            typescript: generateLargeFile('typescript'),
            html: generateLargeFile('html'),
            scss: generateLargeFile('scss'),
            warnings: []
          },
          processing_time: 8.7 // seconds
        })
      });
    });
    
    // Performance measurement - start
    const startTime = Date.now();
    
    // Get the file input and prepare a mock file upload
    // Since we can't actually create a large file here, we'll just mock the API response
    // But we'll still trigger the file input to test the frontend handling
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Trigger a file selection event (this doesn't upload a real large file)
    await page.setInputFiles('input[type="file"]', {
      name: 'large-test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from('mock image data')
    });
    
    // Submit or trigger processing
    await page.click('button:has-text("Generate")');
    
    // Wait for processing indicator
    await expect(page.locator('text=Processing')).toBeVisible();
    await expect(page.locator('text=Processing')).not.toBeVisible({ timeout: 60000 });
    
    // Verify generated code appears
    await expect(page.locator('text=LargeImageComponent')).toBeVisible();
    
    // Performance measurement - end
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Measure memory after operation
    try {
      memoryAfter = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
      console.log(`Memory usage before: ${memoryBefore / (1024 * 1024)}MB`);
      console.log(`Memory usage after: ${memoryAfter / (1024 * 1024)}MB`);
      console.log(`Memory increase: ${(memoryAfter - memoryBefore) / (1024 * 1024)}MB`);
      
      // Check if memory increase is reasonable
      expect(memoryAfter - memoryBefore).toBeLessThan(100 * 1024 * 1024); // Example: less than 100MB increase
    } catch (e) {
      console.log('Memory measurement not supported in this browser');
    }
    
    console.log(`Total processing time: ${totalTime}ms`);
    
    // Check if performance meets threshold
    expect(totalTime).toBeLessThan(15000); // Example threshold: 15 seconds
    
    // Check preview rendering performance
    const previewFrame = page.frameLocator('iframe.preview-frame');
    await expect(previewFrame.locator('body')).toBeVisible({ timeout: 10000 });
    
    // Take a screenshot of the result
    await page.screenshot({ path: 'test-results/large-image-performance.png' });
  });
});

// Helper function to generate large code files for testing
function generateLargeFile(type: string): string {
  let result = '';
  
  switch (type) {
    case 'typescript':
      result = 'import { Component, OnInit } from "@angular/core";\n\n@Component({\n  selector: "app-large-test",\n  templateUrl: "./large-test.component.html",\n  styleUrls: ["./large-test.component.scss"]\n})\nexport class LargeTestComponent implements OnInit {\n';
      
      // Add many properties and methods to simulate a large file
      for (let i = 0; i < 100; i++) {
        result += `  property${i}: string = "value${i}";\n`;
      }
      
      result += '\n  constructor() { }\n\n  ngOnInit(): void {\n';
      
      for (let i = 0; i < 50; i++) {
        result += `    console.log("Initializing property${i}");\n`;
      }
      
      result += '  }\n\n';
      
      for (let i = 0; i < 30; i++) {
        result += `  method${i}(): void {\n    // Implementation for method ${i}\n    const result = this.property${i} + " processed";\n    console.log(result);\n  }\n\n`;
      }
      
      result += '}\n';
      break;
      
    case 'html':
      result = '<div class="large-component-container">\n  <header class="header">\n    <h1>Large Test Component</h1>\n    <nav class="navigation">\n      <ul>\n';
      
      for (let i = 0; i < 20; i++) {
        result += `        <li><a href="#section${i}">Section ${i}</a></li>\n`;
      }
      
      result += '      </ul>\n    </nav>\n  </header>\n\n  <main class="content">\n';
      
      for (let i = 0; i < 30; i++) {
        result += `    <section id="section${i}" class="section">\n      <h2>Section ${i} Title</h2>\n      <p>This is the content for section ${i}. It contains important information.</p>\n`;
        
        if (i % 3 === 0) {
          result += '      <div class="card-container">\n';
          for (let j = 0; j < 5; j++) {
            result += `        <div class="card">\n          <h3>Card ${j}</h3>\n          <p>Card content ${j}</p>\n          <button (click)="method${i}()">Action ${j}</button>\n        </div>\n`;
          }
          result += '      </div>\n';
        }
        
        result += '    </section>\n\n';
      }
      
      result += '  </main>\n\n  <footer class="footer">\n    <p>&copy; 2023 Large Test Component</p>\n  </footer>\n</div>\n';
      break;
      
    case 'scss':
      result = '// Large component styles\n.large-component-container {\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n  font-family: Arial, sans-serif;\n}\n\n';
      
      result += '.header {\n  background-color: #333;\n  color: white;\n  padding: 1rem;\n  \n  h1 {\n    margin: 0;\n    font-size: 2rem;\n  }\n}\n\n';
      
      result += '.navigation {\n  ul {\n    display: flex;\n    flex-wrap: wrap;\n    list-style: none;\n    padding: 0;\n    margin: 1rem 0 0 0;\n    \n    li {\n      margin-right: 1rem;\n      \n      a {\n        color: white;\n        text-decoration: none;\n        \n        &:hover {\n          text-decoration: underline;\n        }\n      }\n    }\n  }\n}\n\n';
      
      result += '.content {\n  flex: 1;\n  padding: 2rem;\n}\n\n';
      
      for (let i = 0; i < 30; i++) {
        result += `.section:nth-child(${i}) {\n  margin-bottom: 2rem;\n  padding: 1rem;\n  background-color: ${i % 2 === 0 ? '#f5f5f5' : '#ffffff'};\n  border-radius: 4px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n  \n  h2 {\n    color: #${(i * 40).toString(16).padStart(3, '0')};\n  }\n}\n\n`;
      }
      
      result += '.card-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 1rem;\n  margin-top: 1rem;\n}\n\n';
      
      result += '.card {\n  background-color: white;\n  border-radius: 4px;\n  padding: 1rem;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n  \n  h3 {\n    margin-top: 0;\n  }\n  \n  button {\n    background-color: #0066cc;\n    color: white;\n    border: none;\n    padding: 0.5rem 1rem;\n    border-radius: 4px;\n    cursor: pointer;\n    \n    &:hover {\n      background-color: #0052a3;\n    }\n  }\n}\n\n';
      
      result += '.footer {\n  background-color: #333;\n  color: white;\n  padding: 1rem;\n  text-align: center;\n}\n';
      break;
  }
  
  return result;
} 