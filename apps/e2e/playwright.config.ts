import { defineConfig, devices } from '@playwright/test';

import { env } from './setup/env';
import { STORAGE_STATE } from './setup/storageState';

export default defineConfig({
  testDir: './specs',
  testMatch: '**/*.e2e.ts',
  globalSetup: './setup/globalSetup.ts',
  globalTeardown: './setup/globalTeardown.ts',
  // Erase is irreversible and the scenarios share one catalog, so they run one
  // at a time. The suite is small enough that parallelism would buy minutes at
  // the cost of every flake being a fixture collision.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: env.webUrl,
    storageState: STORAGE_STATE,
    trace: 'retain-on-failure'
  },
  // The app picks its whole shell from the user agent (`react-device-detect`),
  // so the phone is not a narrower desktop: it is a different tree, with its
  // own pages and bottom sheets. Each project therefore runs its own specs.
  projects: [
    {
      name: 'desktop',
      use: devices['Desktop Chrome'],
      testIgnore: '**/mobile/**'
    },
    {
      name: 'mobile',
      use: devices['iPhone 17'],
      testMatch: '**/mobile/**/*.e2e.ts'
    }
  ],
  // Both apps are started pointed at the local stack through the environment,
  // never through their .env files: those hold the developer's own hosted
  // project, and this suite erases rows.
  webServer: [
    {
      // Not the `dev` script: it hardcodes PORT=4001, the developer's own.
      command: 'pnpm --filter api exec nest start',
      url: `${env.apiUrl}/health`,
      cwd: '../..',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        SUPABASE_URL: env.supabaseUrl,
        SUPABASE_ANON_KEY: env.anonKey,
        PORT: new URL(env.apiUrl).port
      }
    },
    {
      command: `pnpm --filter web dev --port ${new URL(env.webUrl).port} --strictPort`,
      url: env.webUrl,
      cwd: '../..',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        VITE_API_URL: env.apiUrl,
        VITE_SUPABASE_URL: env.supabaseUrl,
        VITE_SUPABASE_ANON_KEY: env.anonKey
      }
    }
  ]
});
