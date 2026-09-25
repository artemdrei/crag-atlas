import { expect, test } from '@playwright/test';

import { api, member } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { openTab, routePath } from '../../fixtures/ui';
import { STORAGE_STATE_MEMBER } from '../../setup/storageState';

/**
 * The route's own logbook: every ascent anyone has logged on it, read by
 * anyone who opens the page. It answers from `GET /routes/:idRoute/ticks`,
 * which hands no viewer to the mapper — so a private note is held back here
 * even from the climber who wrote it, and their own logbook is where they
 * read it back.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let climbed: Row;
let untouched: Row;

test.beforeAll(async () => {
  region = await makeRegion('Ledger-Region');
  sector = await makeSector(region.id, 'Ledger-Sector');
  climbed = await makeRoute(sector.id, 'Ledger-Route-Climbed');
  untouched = await makeRoute(sector.id, 'Ledger-Route-Untouched');

  await api.post('/ticks', {
    idRoute: climbed.id,
    ascentType: 'redpoint',
    note: 'Crimpy through the crux'
  });
  await member.post('/ticks', {
    idRoute: climbed.id,
    ascentType: 'onsight',
    note: 'Heel hook nobody else found',
    notePrivate: true
  });
});

test.afterAll(cleanup);

test('a route nobody has climbed says so', async ({ page }) => {
  await page.goto(routePath(region.id, sector.id, untouched.id));
  await openTab(page, 'Logbook');

  await expect(
    page.getByText('Nobody has logged this route yet.')
  ).toBeVisible();
});

test('the tab carries everyone’s ascents, and only mine carries a menu', async ({
  page
}) => {
  await page.goto(routePath(region.id, sector.id, climbed.id));
  await openTab(page, 'Logbook');

  await expect(page.getByText('Crimpy through the crux')).toBeVisible();
  await expect(page.getByText('Heel hook nobody else found')).toHaveCount(0);

  // Two ascents are listed; the menu belongs to the one this account logged.
  await expect(
    page.getByRole('button', { name: 'Ascent actions' })
  ).toHaveCount(1);
});

test.describe('as the climber who marked a note private', () => {
  test.use({ storageState: STORAGE_STATE_MEMBER });

  test('the route holds their note back, their logbook gives it to them', async ({
    page
  }) => {
    await page.goto(routePath(region.id, sector.id, climbed.id));
    await openTab(page, 'Logbook');

    await expect(
      page.getByRole('button', { name: 'Ascent actions' })
    ).toHaveCount(1);
    await expect(page.getByText('Heel hook nobody else found')).toHaveCount(0);

    await page.goto('/logbook');

    await expect(page.getByText('Heel hook nobody else found')).toBeVisible();
  });
});

test('an ascent logged with a link marks the route without a reload', async ({
  page
}) => {
  const route = await makeRoute(sector.id, 'Ledger-Route-Filmed');

  await page.goto(routePath(region.id, sector.id, route.id));
  await page.getByRole('button', { name: 'Log ascent' }).click();

  const dialog = page.getByRole('dialog');

  await dialog
    .getByRole('textbox', { name: 'YouTube or Instagram link' })
    .fill('https://youtu.be/dQw4w9WgXcQ');
  await dialog.getByRole('button', { name: 'Add', exact: true }).click();
  await dialog.getByRole('button', { name: 'Log ascent' }).click();

  // No navigation between logging it and reading the mark: the media belongs
  // to a tick that was cached before the media existed.
  await expect(
    page.getByRole('tab', { name: 'Video and photo (1)' })
  ).toBeVisible();
});
