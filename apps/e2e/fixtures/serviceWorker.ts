import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * The worker claims the page a moment after it loads, and until it does,
 * nothing the page fetches goes through it — the offline warm-up skips itself.
 */
export const waitForServiceWorker = (page: Page) =>
  expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), {
      timeout: 15_000
    })
    .toBe(true);
