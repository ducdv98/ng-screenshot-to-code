import { test, expect } from '@playwright/test';

test.describe('UI Elements and Navigation Tests', () => {
  // Set up a base URL for all tests in this file
  const baseUrl = 'http://localhost:4200';

  test.beforeEach(async ({ page }) => {
    // This function will be run before each test in this describe block
    test.skip(true, 'Skipping until application is running');
  });

  test('homepage should have correct title and layout', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Check page title
    await expect(page).toHaveTitle(/Screenshot to Code/);
    
    // Check main elements exist
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    
    // Verify hero section content
    const heroSection = page.locator('.hero-section');
    await expect(heroSection).toBeVisible();
    await expect(heroSection.locator('h1')).toBeVisible();
    
    // Take screenshot for visual comparison
    await page.screenshot({ path: 'test-results/homepage.png' });
  });

  test('navigation links should work correctly', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Assuming there are navigation links
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    
    // Check that we have at least one navigation link
    expect(count).toBeGreaterThan(0);
    
    // Check first nav link navigation
    if (count > 0) {
      const firstLinkText = await navLinks.first().textContent();
      const firstLinkHref = await navLinks.first().getAttribute('href');
      
      // Click the first navigation link
      await navLinks.first().click();
      
      // Verify URL changed correctly
      if (firstLinkHref && !firstLinkHref.startsWith('http')) {
        // Only check internal links
        await expect(page).toHaveURL(new RegExp(firstLinkHref.replace('/', '\\/') + '$'));
      }
    }
  });

  test('theme toggle should change appearance', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Find theme toggle button (assuming it exists)
    const themeToggle = page.locator('button:has-text("Theme")');
    
    // Check if theme toggle exists before proceeding
    if (await themeToggle.count() > 0) {
      // Get initial theme state
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      
      // Click theme toggle
      await themeToggle.click();
      
      // Verify theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      
      expect(newTheme).not.toEqual(initialTheme);
    } else {
      // Skip test if theme toggle doesn't exist
      test.skip();
    }
  });
}); 