import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { breadcrumb, card, pickGrade } from '../../fixtures/ui';

/**
 * The phone gets its own tree: its own pages, a bottom navigation instead of a
 * header, and sheets instead of dialogs. None of it renders under a desktop
 * user agent, so none of it is covered by the specs above.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;
let harder: Row;

test.beforeAll(async () => {
  region = await makeRegion('Phone-Region');
  sector = await makeSector(region.id, 'Phone-Sector');
  route = await makeRoute(sector.id, 'Phone-Route-Easy');
  harder = await makeRoute(sector.id, 'Phone-Route-Hard');

  await api.patch(`/routes/${harder.id}`, {
    name: harder.name,
    grade: '7a',
    gradeScale: 'french',
    type: 'sport'
  });
});

test.afterAll(cleanup);

test('the catalog walks down to a route on a phone too', async ({ page }) => {
  await page.goto('/');

  await test.step('the bottom navigation is what steers', async () => {
    await expect(page.getByRole('link', { name: 'Crags' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
  });

  await card(page, region.name).click();
  await expect(card(page, sector.name)).toBeVisible();

  await card(page, sector.name).click();
  await expect(card(page, route.name)).toBeVisible();
  await expect(page.getByText('2 routes')).toHaveCount(1);

  await card(page, route.name).click();
  await expect(page.getByRole('heading', { name: route.name })).toBeVisible();

  await test.step('and the trail still leads back', async () => {
    await breadcrumb(page, sector.name).click();
    await expect(card(page, route.name)).toBeVisible();
  });
});

test('the bottom navigation reaches the logbook and the profile', async ({
  page
}) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Logbook' }).click();
  await expect(page).toHaveURL(/\/logbook/);

  await page.getByRole('link', { name: 'Profile' }).click();
  await expect(page).toHaveURL(/\/profile/);

  await page.getByRole('link', { name: 'Crags' }).click();
  await expect(card(page, region.name)).toBeVisible();
});

test('the phone keeps its filter in the URL too', async ({ page }) => {
  await page.goto(`/regions/${region.id}/sectors/${sector.id}`);
  await pickGrade(page, '7a');

  await test.step('the address carries the grade', async () => {
    await expect(page).toHaveURL(/[?&]grades=french%7C7a/);
    await expect(page.getByText('1 route', { exact: true })).toBeVisible();
  });

  await test.step('a reload reads it back', async () => {
    await page.reload();

    await expect(card(page, harder.name)).toBeVisible();
    await expect(card(page, route.name)).toHaveCount(0);
  });

  await test.step('an address written by hand is obeyed', async () => {
    await page.goto(
      `/regions/${region.id}/sectors/${sector.id}?grades=french%7C6a`
    );

    await expect(card(page, route.name)).toBeVisible();
    await expect(card(page, harder.name)).toHaveCount(0);
  });

  await test.step('and clearing it takes the parameter away', async () => {
    await page.getByRole('button', { name: 'Clear all filters' }).click();

    await expect(page).not.toHaveURL(/grades=/);
    await expect(page.getByText('2 routes')).toBeVisible();
  });

  await test.step('clearing it is not a step back can undo', async () => {
    await page.goBack();

    await expect(page).not.toHaveURL(/grades=french%7C6a/);
  });
});
