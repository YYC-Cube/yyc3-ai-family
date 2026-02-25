/**
 * YYC3-Claude E2E Test Example
 * Template for writing E2E tests with Playwright
 */

import { test, expect, Page } from '@playwright/test';

// Test data
const testUrls = {
  home: '/',
  github: 'https://github.com',
  brave: 'https://search.brave.com',
};

// Helper functions
async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

test.describe('YYC3-Claude E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test context before each test
    await page.goto('https://httpbin.org');
  });

  test('should load homepage', async ({ page }) => {
    await page.goto('https://httpbin.org');
    await expect(page).toHaveTitle(/httpbin/i);
  });

  test('should handle HTTP requests', async ({ page }) => {
    const response = await page.request.get('https://httpbin.org/get');
    const data = await response.json();

    expect(data).toHaveProperty('url');
  });

  test('should handle form submissions', async ({ page }) => {
    await page.goto('https://httpbin.org/forms/post');
    const form = page.locator('form');

    await form.locator('input[name="custname"]').fill('YYC3 Test');
    await form.locator('input[type="submit"]').click();

    // Verify form was submitted
    await expect(page).toHaveURL(/post/);
  });
});

test.describe('API Integration Tests', () => {
  test('GitHub API request', async ({ request }) => {
    const response = await request.get('https://api.github.com/repos/YYC-Cube/YYC3-Claude');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data).toHaveProperty('name', 'YYC3-Claude');
  });

  test('HTTP status codes', async ({ request }) => {
    const response = await request.get('https://httpbin.org/status/200');

    expect(response.status()).toBe(200);
  });
});

test.describe('UI Interaction Tests', () => {
  test('should click elements', async ({ page }) => {
    await page.goto('https://httpbin.org');
    const link = page.locator('a[href="/forms/post"]').first();

    await link.click();
    await expect(page).toHaveURL(/\/forms\/post/);
  });

  test('should handle dropdowns', async ({ page }) => {
    await page.goto('https://httpbin.org/forms/post');
    const select = page.locator('select[name="size"]');

    await select.selectOption('medium');
    await expect(select).toHaveValue('medium');
  });
});

test.describe('Responsive Design Tests', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://httpbin.org');
    // Add mobile-specific checks
    const body = page.locator('body');

    await expect(body).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://httpbin.org');
    const body = page.locator('body');

    await expect(body).toBeVisible();
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('https://httpbin.org');
    const h1 = page.locator('h1');

    await expect(h1).toBeVisible();
  });

  test('should have visible interactive elements', async ({ page }) => {
    await page.goto('https://httpbin.org');
    const links = page.locator('a').filter({ hasText: /./ });
    const count = await links.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Performance Tests', () => {
  test('should load within time limit', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('https://httpbin.org');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000); // 5 seconds max
  });

  test('should have minimal requests', async ({ page }) => {
    let requestCount = 0;

    page.on('request', () => requestCount++);

    await page.goto('https://httpbin.org');
    await page.waitForLoadState('networkidle');

    expect(requestCount).toBeLessThan(20); // Reasonable number of requests
  });
});
