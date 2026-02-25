import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test Directory
  testDir: './test/e2e',

  // Timeout
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  // Fully Parallel
  fullyParallel: true,

  // Fail on First Error (CI)
  forbidOnly: !!process.env.CI,

  // Retry on CI
  retries: process.env.CI ? 2 : 0,

  // Workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'test-results/e2e-report' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
    ['list'],
  ],

  // Shared Settings
  use: {
    // Base URL
    baseURL: 'http://localhost:3000',

    // Trace
    trace: 'on-first-retry',

    // Screenshot
    screenshot: 'only-on-failure',

    // Video
    video: 'retain-on-failure',

    // Action Timeout
    actionTimeout: 10000,

    // Navigation Timeout
    navigationTimeout: 30000,
  },

  // Projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web Server (for E2E tests)
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
