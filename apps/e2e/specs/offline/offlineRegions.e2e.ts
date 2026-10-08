import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { waitForServiceWorker } from '../../fixtures/serviceWorker';
import { card } from '../../fixtures/ui';
import { authStorageKey, env } from '../../setup/env';
import { STORAGE_STATE_MEMBER } from '../../setup/storageState';

test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('Offline-Region');
  sector = await makeSector(region.id, 'Offline-Sector');
  route = await makeRoute(sector.id, 'Offline-Route');
});

test.afterAll(cleanup);

const saveForOffline = async (page: Page) => {
  await page.goto('/profile');
  await waitForServiceWorker(page);

  await page.getByRole('button', { name: 'Save a region' }).click();

  const dialog = page.getByRole('dialog');

  await dialog
    .getByRole('combobox', { name: 'Region', exact: true })
    .fill(region.name);
  await page.getByRole('option', { name: region.name }).click();
  await dialog.getByRole('button', { name: 'Download' }).click();

  await expect(dialog.getByText(`${region.name} is saved`)).toBeVisible({
    timeout: 30_000
  });
  await dialog.getByRole('button', { name: 'Done' }).click();
};

const offlineStorage = (page: Page) =>
  page.evaluate(async () => {
    const index = await new Promise<unknown>((resolve, reject) => {
      const open = indexedDB.open('keyval-store');

      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const db = open.result;

        if (!db.objectStoreNames.contains('keyval')) return resolve(undefined);

        const get = db
          .transaction('keyval')
          .objectStore('keyval')
          .get('offline-regions');

        get.onsuccess = () => resolve(get.result);
        get.onerror = () => reject(get.error);
      };
    });

    return {
      hasCache: await caches.has('offline-regions'),
      hasIndex: index !== undefined
    };
  });

test('a saved region opens offline down to its routes', async ({
  page,
  context
}) => {
  await saveForOffline(page);
  await context.setOffline(true);

  // None of these pages was opened online: their chunks are there only
  // because saving pulled the whole build into the cache.
  await test.step('the region lists its sectors', async () => {
    await page.goto(`/regions/${region.id}`);

    await expect(card(page, sector.name)).toBeVisible();
  });

  await test.step('the sector lists its routes', async () => {
    await card(page, sector.name).click();

    await expect(card(page, route.name)).toBeVisible();
  });

  await test.step('the route opens', async () => {
    await card(page, route.name).click();

    await expect(page.getByRole('heading', { name: route.name })).toBeVisible();
  });
});

test.describe('signing out', () => {
  // supabase-js signs out every session of the account, so the climber who
  // signs out is one of its own: the admin's would end for every other spec.
  test.use({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: env.webUrl,
          localStorage: [
            { name: 'crag-atlas:locale', value: 'en' },
            {
              name: 'crag-atlas:install-hint',
              value: '{"isInstalled":true}'
            }
          ]
        }
      ]
    }
  });

  const email = `offline-${Date.now().toString(36)}@crag-atlas.test`;
  const password = 'offline-password';
  const service = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  let idUser: string;

  test.beforeAll(async () => {
    const { data, error } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) throw error;

    idUser = data.user.id;
  });

  test.afterAll(async () => {
    await service.auth.admin.deleteUser(idUser);
  });

  const signIn = async (page: Page, session: string) => {
    await page.goto('/');
    await page.evaluate(([key, value]) => localStorage.setItem(key, value), [
      authStorageKey(),
      session
    ] as const);
  };

  test('wipes the saved regions', async ({ page }) => {
    const { data } = await createClient(env.supabaseUrl, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    }).auth.signInWithPassword({ email, password });

    await signIn(page, JSON.stringify(data.session));
    await saveForOffline(page);

    expect(await offlineStorage(page)).toEqual({
      hasCache: true,
      hasIndex: true
    });

    await test.step('the cache and its index are gone', async () => {
      await page.getByRole('button', { name: 'Sign out' }).click();

      await expect
        .poll(() => offlineStorage(page))
        .toEqual({ hasCache: false, hasIndex: false });
    });

    await test.step('and the next climber on this browser sees none of them', async () => {
      const memberSession = JSON.parse(
        readFileSync(STORAGE_STATE_MEMBER, 'utf8')
      ).origins[0].localStorage.find(
        ({ name }: { name: string }) => name === authStorageKey()
      ).value;

      await signIn(page, memberSession);
      await page.goto('/profile');

      await expect(
        page.getByRole('button', { name: 'Save a region' })
      ).toBeVisible();
      await expect(page.getByRole('link', { name: region.name })).toHaveCount(
        0
      );
    });
  });
});
