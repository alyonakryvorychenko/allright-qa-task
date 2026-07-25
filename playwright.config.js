// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  timeout: 2 * 60 * 1000,
  expect: { timeout: 10_000 },

  fullyParallel: false,
  retries: 0,
  workers: 1,

  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
