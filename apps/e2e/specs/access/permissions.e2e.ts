import { expect, test } from '@playwright/test';

import { api, member } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { editorPath, openTab, regionPath, routePath } from '../../fixtures/ui';
import { env } from '../../setup/env';
import { STORAGE_STATE_MEMBER } from '../../setup/storageState';

/**
 * Who may do what. The catalog is public to read and admin-only to change,
 * and both halves are enforced twice: the UI does not offer what the API
 * would refuse.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('Access-Region');
  sector = await makeSector(region.id, 'Access-Sector');
  route = await makeRoute(sector.id, 'Access-Route');
});

test.afterAll(cleanup);

test.describe('a visitor who has not signed in', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('reads the catalog and is offered nothing else', async ({ page }) => {
    await page.goto(routePath(region.id, sector.id, route.id));

    await expect(page.getByRole('heading', { name: route.name })).toBeVisible();

    await test.step('nothing to write', async () => {
      await expect(
        page.getByRole('textbox', { name: 'Your beta' })
      ).toHaveCount(0);
    });

    // The button stays: it is the way in, not a promise. Clicking it asks the
    // visitor to sign in rather than opening the form.
    await test.step('logging an ascent asks them to sign in first', async () => {
      await page.getByRole('button', { name: 'Log ascent' }).click();
      await expect(page).toHaveURL(/\/login/);
      await page.goBack();
    });

    await test.step('the header offers a way in instead', async () => {
      await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    });

    await test.step('and the catalog cannot be edited', async () => {
      await page.goto('/');
      await expect(
        page.getByRole('button', { name: 'Edit', exact: true })
      ).toHaveCount(0);
    });
  });

  test('is refused by the API as well', async ({ request }) => {
    const response = await request.delete(`${env.apiUrl}/regions/${region.id}`);

    expect(response.status()).toBe(401);
  });
});

test.describe('a climber who is not an admin', () => {
  test.use({ storageState: STORAGE_STATE_MEMBER });

  test('may log and write, but not edit the catalog', async ({ page }) => {
    await page.goto(routePath(region.id, sector.id, route.id));

    await expect(
      page.getByRole('button', { name: 'Log ascent' })
    ).toBeVisible();

    await openTab(page, 'Comments');

    await expect(
      page.getByRole('textbox', { name: 'Your beta' })
    ).toBeVisible();

    await test.step('no edit mode anywhere in the catalog', async () => {
      await page.goto('/');
      await expect(
        page.getByRole('button', { name: 'Edit', exact: true })
      ).toHaveCount(0);

      await page.goto(regionPath(region.id));
      await expect(
        page.getByRole('button', { name: 'Add sector' })
      ).toHaveCount(0);
    });

    await test.step('and no way into the topo editor', async () => {
      await page.goto(editorPath(region.id, sector.id));
      await expect(
        page.getByRole('button', { name: 'Archive route' })
      ).toHaveCount(0);
    });
  });

  test('is refused by the API as well', async () => {
    await expect(
      member.post(`/regions/${region.id}/sectors`, { name: 'Not allowed' })
    ).rejects.toThrow(/403/);
  });
});

test('an admin is offered all of it', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('button', { name: 'Edit', exact: true })
  ).toBeVisible();

  // Something only an admin's browser context can reach: the archive view
  // behind edit mode. The API call below would pass whatever the browser is
  // signed in as, so it cannot stand in for this.
  await page.goto('/?edit=1');
  await expect(page.getByRole('button', { name: 'Archive' })).toBeVisible();

  const response = await api.raw('GET', `/regions/${region.id}`);

  expect(response.status).toBe(200);
});
