import { expect, test } from '@playwright/test';

import { api, member } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import {
  ascentsPanel,
  logTickButton,
  openTab,
  routePath
} from '../../fixtures/ui';
import { STORAGE_STATE_MEMBER } from '../../setup/storageState';

/**
 * The route's ascents, in two tabs. `Community feed` is every first send
 * anyone has logged, from `GET /routes/:idRoute/ticks`, which hands no viewer
 * to the mapper — so a private note is held back there even from the climber
 * who wrote it. `My ascents` is the climber's own, from
 * `GET /ticks/routes/:idRoute`, which does know the viewer, so there they read
 * their private note back.
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

test('a route nobody has climbed invites the first ascent', async ({
  page
}) => {
  await page.goto(routePath(region.id, sector.id, untouched.id));

  const panel = ascentsPanel(page);

  await test.step('my ascents ask me to track my progress', async () => {
    await openTab(page, 'My ascents');
    await expect(panel.getByText('Track your progress')).toBeVisible();
    await expect(
      panel.getByRole('button', { name: 'Log ascent' })
    ).toBeVisible();
  });

  await test.step('the community feed asks for the first ascent', async () => {
    await openTab(page, 'Community feed');
    await expect(panel.getByText('Log the first ascent')).toBeVisible();
  });

  await test.step('an empty list has no view to pick', async () => {
    await expect(panel.getByRole('combobox', { name: 'View' })).toHaveCount(0);
  });
});

test('the community feed carries everyone’s ascents, and only mine carries a menu', async ({
  page
}) => {
  await page.goto(routePath(region.id, sector.id, climbed.id));
  await openTab(page, 'Community feed');

  const panel = ascentsPanel(page);

  await expect(panel.getByText('Crimpy through the crux')).toBeVisible();
  await expect(panel.getByText('Heel hook nobody else found')).toHaveCount(0);

  // Two ascents are listed; the menu belongs to the one this account logged.
  await expect(
    panel.getByRole('button', { name: 'Ascent actions' })
  ).toHaveCount(1);
});

test('my ascents carry only mine', async ({ page }) => {
  await page.goto(routePath(region.id, sector.id, climbed.id));
  await openTab(page, 'My ascents');

  const panel = ascentsPanel(page);

  await expect(panel.getByText('Crimpy through the crux')).toBeVisible();
  await expect(
    panel.getByRole('button', { name: 'Ascent actions' })
  ).toHaveCount(1);
});

test.describe('as the climber who marked a note private', () => {
  test.use({ storageState: STORAGE_STATE_MEMBER });

  test('the feed holds their note back, their own ascents give it to them', async ({
    page
  }) => {
    await page.goto(routePath(region.id, sector.id, climbed.id));

    const panel = ascentsPanel(page);

    await test.step('the community feed holds it back', async () => {
      await openTab(page, 'Community feed');
      await expect(
        panel.getByRole('button', { name: 'Ascent actions' })
      ).toHaveCount(1);
      await expect(panel.getByText('Heel hook nobody else found')).toHaveCount(
        0
      );
    });

    await test.step('my ascents give it back', async () => {
      await openTab(page, 'My ascents');
      await expect(
        panel.getByText('Heel hook nobody else found')
      ).toBeVisible();
    });

    await page.goto('/logbook');

    await expect(page.getByText('Heel hook nobody else found')).toBeVisible();
  });
});

test('an ascent logged with a link marks the route without a reload', async ({
  page
}) => {
  const route = await makeRoute(sector.id, 'Ledger-Route-Filmed');

  await page.goto(routePath(region.id, sector.id, route.id));
  await logTickButton(page).click();

  const dialog = page.getByRole('dialog');

  await dialog
    .getByRole('textbox', { name: 'YouTube link' })
    .fill('https://youtu.be/dQw4w9WgXcQ');
  await dialog.getByRole('textbox', { name: 'YouTube link' }).press('Enter');
  await dialog.getByRole('button', { name: 'Log ascent' }).click();

  // No navigation between logging it and reading the mark: the media belongs
  // to a tick that was cached before the media existed.
  await expect(
    page.getByRole('tab', { name: 'Video and photo (1)' })
  ).toBeVisible();
});
