import { expect, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { card, routePath } from '../../fixtures/ui';

/**
 * The phone has no edit mode at all — the catalog is changed from a desktop —
 * so what matters here is that a visitor is shown the way in rather than a
 * half-working form.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('Phone-Access-Region');
  sector = await makeSector(region.id, 'Phone-Access-Sector');
  route = await makeRoute(sector.id, 'Phone-Access-Route');
});

test.afterAll(cleanup);

test.describe('a visitor who has not signed in', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('reads the catalog and is asked to sign in for the rest', async ({
    page: phone
  }) => {
    await phone.goto(routePath(region.id, sector.id, route.id));

    await expect(
      phone.getByRole('heading', { name: route.name })
    ).toBeVisible();

    await test.step('there is nowhere to write beta', async () => {
      await phone.getByRole('tab', { name: 'Comments' }).click();
      await expect(
        phone.getByRole('textbox', { name: 'Your beta' })
      ).toHaveCount(0);
    });

    await test.step('the logbook asks them in first', async () => {
      await phone.getByRole('link', { name: 'Logbook' }).click();
      await expect(phone).toHaveURL(/\/login/);
    });
  });
});

test('an admin is given no edit mode on a phone', async ({ page: phone }) => {
  await phone.goto('/');

  // The catalog has to be on screen before its missing button means anything.
  await expect(card(phone, region.name)).toBeVisible();
  await expect(phone.getByRole('button', { name: 'Edit' })).toHaveCount(0);
});
