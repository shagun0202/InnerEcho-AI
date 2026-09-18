import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  timeout: 180000,
  expect: { timeout: 12000 },
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:5173',
    channel: 'msedge',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
})
