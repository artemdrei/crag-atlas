import { expect, test } from '@playwright/test';

import { waitForServiceWorker } from '../../fixtures/serviceWorker';

const STALE_SHELL = '<!doctype html><title>stale-shell</title>';

const precachedUrls = (worker: string) => {
  const manifest = worker.match(/precacheAndRoute\((\[.*?\])/s)?.[1] ?? '';

  return [...manifest.matchAll(/url:\s*"([^"]+)"/g)].map(
    ([, url]) => url as string
  );
};

test('the worker precaches version.json and no code', async ({ request }) => {
  const urls = precachedUrls(await (await request.get('/sw.js')).text());

  await test.step('version.json is what changes the worker per release', async () => {
    expect(urls).toContain('version.json');
  });

  await test.step('no chunk or index.html outlives its release', async () => {
    expect(urls.filter((url) => /\.(js|css|html)$/.test(url))).toEqual([]);
  });
});

test('the shell comes from the network online and from the cache offline', async ({
  page,
  context
}) => {
  const plantStaleShell = () =>
    page.evaluate(async (html) => {
      const cache = await caches.open('app-shell');

      await cache.put(
        '/',
        new Response(html, { headers: { 'Content-Type': 'text/html' } })
      );
    }, STALE_SHELL);

  await page.goto('/');
  await waitForServiceWorker(page);
  await plantStaleShell();

  await test.step('online, a cached shell never answers', async () => {
    await page.reload();

    await expect(page).not.toHaveTitle('stale-shell');
    await expect(page.getByRole('link', { name: 'Regions' })).toBeVisible();
  });

  await test.step('offline, any path opens the one cached shell', async () => {
    await plantStaleShell();
    await context.setOffline(true);
    await page.goto('/regions/never-opened');

    await expect(page).toHaveTitle('stale-shell');
  });
});
