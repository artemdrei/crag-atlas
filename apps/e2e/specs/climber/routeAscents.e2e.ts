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
  isFilterActive,
  logTickButton,
  openTab,
  pickOption,
  routePath
} from '../../fixtures/ui';
import { STORAGE_STATE_MEMBER } from '../../setup/storageState';

/**
 * The ascents panel beside a route: who has climbed it, and the way to log
 * your own. An empty list is an invitation rather than a blank, and a list
 * can be read in full or at a glance.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let climbed: Row;
let empty: Row;

test.beforeAll(async () => {
  region = await makeRegion('Ascents-Region');
  sector = await makeSector(region.id, 'Ascents-Sector');
  climbed = await makeRoute(sector.id, 'Ascents-Route-Climbed');
  empty = await makeRoute(sector.id, 'Ascents-Route-Empty');

  await member.post('/ticks', {
    idRoute: climbed.id,
    ascentType: 'redpoint',
    note: 'Member went bottom to top'
  });
  await api.post('/ticks', {
    idRoute: climbed.id,
    ascentType: 'flash',
    note: 'Admin flashed the slab',
    partnerName: 'Belay Buddy'
  });
});

test.afterAll(cleanup);

test.describe('a visitor who has not signed in', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('reads the community feed and nothing of their own', async ({
    page
  }) => {
    await page.goto(routePath(region.id, sector.id, climbed.id));

    const panel = ascentsPanel(page);

    await expect(panel.getByText('Member went bottom to top')).toBeVisible();
    await expect(panel.getByText('Admin flashed the slab')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'My ascents' })).toHaveCount(0);
    await expect(
      panel.getByRole('button', { name: 'Ascent actions' })
    ).toHaveCount(0);
  });

  test('the invitation on an empty route asks them to sign in', async ({
    page
  }) => {
    await page.goto(routePath(region.id, sector.id, empty.id));

    const panel = ascentsPanel(page);

    await expect(panel.getByText('Log the first ascent')).toBeVisible();
    await panel.getByRole('button', { name: 'Log ascent' }).click();

    await expect(
      page.getByRole('dialog', { name: 'Sign in to log this ascent' })
    ).toBeVisible();
  });
});

test.describe('a climber with nothing on the route yet', () => {
  test.use({ storageState: STORAGE_STATE_MEMBER });

  test('is invited to log it, and the invitation opens the form', async ({
    page
  }) => {
    await page.goto(routePath(region.id, sector.id, empty.id));

    const panel = ascentsPanel(page);

    await openTab(page, 'My ascents');
    await expect(panel.getByText('Track your progress')).toBeVisible();
    await panel.getByRole('button', { name: 'Log ascent' }).click();

    const dialog = page.getByRole('dialog');

    await expect(
      dialog.getByRole('textbox', { name: 'Comment', exact: true })
    ).toBeVisible();
  });
});

test('an archived route invites nobody to log it', async ({ page }) => {
  const archived = await makeRoute(sector.id, 'Ascents-Route-Archived');

  await api.delete(`/routes/${archived.id}`);
  await page.goto(routePath(region.id, sector.id, archived.id));

  const panel = ascentsPanel(page);

  await expect(panel.getByText('Track your progress')).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Log ascent' })).toHaveCount(
    0
  );
  await expect(logTickButton(page)).toHaveCount(0);
});

test('the list reads in full or at a glance', async ({ page }) => {
  await page.goto(routePath(region.id, sector.id, climbed.id));
  await openTab(page, 'My ascents');

  const panel = ascentsPanel(page);

  await test.step('in full, the note and the belayer are there', async () => {
    await expect(panel.getByText('Admin flashed the slab')).toBeVisible();
    await expect(panel.getByText('Belay Buddy')).toBeVisible();
    await expect(isFilterActive(page, 'View')).toHaveCount(0);
  });

  await test.step('at a glance, they are not', async () => {
    await pickOption(page, 'View', 'Compact');

    await expect(panel.getByText('Flash')).toBeVisible();
    await expect(panel.getByText('Admin flashed the slab')).toHaveCount(0);
    await expect(panel.getByText('Belay Buddy')).toHaveCount(0);
    await expect(isFilterActive(page, 'View')).toHaveCount(1);
  });

  await test.step('and back in full', async () => {
    await pickOption(page, 'View', 'Detailed');

    await expect(panel.getByText('Admin flashed the slab')).toBeVisible();
    await expect(isFilterActive(page, 'View')).toHaveCount(0);
  });
});
