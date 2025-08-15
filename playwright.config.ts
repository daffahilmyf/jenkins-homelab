import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';

const testDbPath = fs.existsSync('.test-db-path')
  ? fs.readFileSync('.test-db-path', 'utf-8')
  : './dev.db'; // fallback if not found

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  snapshotDir: './e2e/__snapshots__',

  globalSetup: require.resolve('./globalSetup'),
  globalTeardown: require.resolve('./globalTeardown'),

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: process.env.CI ? 'npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: `file:${testDbPath}`,
      ENV: 'test',
    },
  },
});
