{
  "$schema": "https://playwright.dev/deno/playwright.json",
  "testDir": "./e2e",
  "outputDir": "./e2e/output",
  "reporter": [
    ["html", { outputFolder: "./e2e/playwright-report" }],
    ["json", { outputFile: "./e2e/test-results.json" }],
    ["list"]
  ],
  "use": {
    "baseURL": "http://localhost:3133",
    "trace": "on-first-retry",
    "screenshot": "only-on-failure",
    "video": "retain-on-failure",
    "headless": true
  },
  "projects": [
    {
      "name": "chromium",
      "use": { "browserName": "chromium" }
    },
    {
      "name": "firefox",
      "use": { "browserName": "firefox" }
    },
    {
      "name": "webkit",
      "use": { "browserName": "webkit" }
    },
    {
      "name": "Mobile Chrome",
      "use": { 
        "browserName": "chromium",
        ...devices["Pixel 5"]
      }
    },
    {
      "name": "Mobile Safari",
      "use": {
        "browserName": "webkit",
        ...devices["iPhone 12"]
      }
    }
  ],
  "webServer": {
    "command": "pnpm dev",
    "url": "http://localhost:3133",
    "reuseExistingServer": true,
    "timeout": 120000
  },
  "forbidOnly": false,
  "fullyParallel": true,
  "retries": 1,
  "workers": 2,
  "quiet": false,
  "timeout": 30000,
  "expect": {
    "timeout": 5000
  }
}
