import { defineConfig, devices } from '@playwright/test';

const previewPort = 4173;
const baseURL = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run preview -- --port ${previewPort}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
