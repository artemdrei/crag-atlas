import { defineConfig, devices } from '@playwright/test';

import { env } from './setup/env';
import { STORAGE_STATE } from './setup/storageState';

export default defineConfig({
  testDir: './specs',
  testMatch: '**/*.e2e.ts',
  globalSetup: './setup/globalSetup.ts',
  globalTeardown: './setup/globalTeardown.ts',
  // File-level parallelism, not test-level: every spec builds its fixtures in a
  // `beforeAll` and tears them down in an `afterAll`, which `fullyParallel`
  // would run once per worker touching the file. A whole file in one worker,
  // serial inside it, is what that shape supports.
  //
  // Workers do not collide over the shared catalog because each one names its
  // rows after its own index (see `fixtures/catalog.ts`).
  fullyParallel: false,
  workers: process.env.CI ? 4 : '50%',
  forbidOnly: !!process.env.CI,
  // Not a licence to leave a spec flaky: the suite is green run after run, and
  // this is here for the runner's own hiccups. A retry that keeps a spec green
  // shows up in the report and is a bug to fix, not a pass.
  retries: process.env.CI ? 1 : 0,
  // `github` alone annotates the failing lines but writes no report, so the
  // job's upload step had nothing to collect. The HTML report is what carries
  // the retry's trace out of the runner.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: env.webUrl,
    storageState: STORAGE_STATE,
    trace: 'on-first-retry'
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
      // The descriptor's viewport, touch and Safari user agent on Chromium:
      // the app picks its tree from the user agent, so the mobile shell is
      // what renders, and WebKit's system libraries stay off the runner.
      use: { ...devices['iPhone 17'], browserName: 'chromium' },
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
      // Generous because both servers boot at once on a shared runner, and the
      // web one compiles before it serves: a build that overruns fails the job
      // at startup rather than as a test.
      timeout: 180_000,
      env: {
        SUPABASE_URL: env.supabaseUrl,
        SUPABASE_ANON_KEY: env.anonKey,
        PORT: new URL(env.apiUrl).port
      }
    },
    {
      // Built and served, never `vite dev`: on-demand transforms are what the
      // suite spent most of its time waiting for, and a first compile that
      // arrives late reads as a timeout rather than as the slow page it is.
      // The build costs a second or two and is paid once for the whole run.
      command: `pnpm --filter web exec vite build && pnpm --filter web exec vite preview --port ${new URL(env.webUrl).port} --strictPort`,
      url: env.webUrl,
      cwd: '../..',
      reuseExistingServer: false,
      // Generous because both servers boot at once on a shared runner, and the
      // web one compiles before it serves: a build that overruns fails the job
      // at startup rather than as a test.
      timeout: 180_000,
      env: {
        VITE_API_URL: env.apiUrl,
        VITE_SUPABASE_URL: env.supabaseUrl,
        VITE_SUPABASE_ANON_KEY: env.anonKey,
        // Set here or Vite falls back to apps/web/.env and the suite's events
        // land in the developer's own Amplitude project.
        VITE_AMPLITUDE_API_KEY: 'e2e',
        VITE_AMPLITUDE_SERVER_URL: env.amplitudeUrl
      }
    }
  ]
});
