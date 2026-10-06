import { expect, test } from '@playwright/test';

import { api, member } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  addLine,
  addTopo,
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import {
  ascentsPanel,
  card,
  isFilterActive,
  logTickButton,
  openTab,
  pickOption,
  routePath,
  sectorPath
} from '../../fixtures/ui';

/**
 * The phone keeps a route's ascents in its Logbook tab, split the same way as
 * on a desktop — the climber's own, and everyone's — with round tabs inside.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;
let empty: Row;

test.beforeAll(async () => {
  region = await makeRegion('Phone-Ascents-Region');
  sector = await makeSector(region.id, 'Phone-Ascents-Sector');
  route = await makeRoute(sector.id, 'Phone-Ascents-Route');
  empty = await makeRoute(sector.id, 'Phone-Ascents-Empty');

  const topo = await addTopo(sector.id);

  await addLine(route.id, topo.id, [
    [0.3, 0.8],
    [0.35, 0.3]
  ]);
  await addLine(empty.id, topo.id, [
    [0.7, 0.8],
    [0.65, 0.3]
  ]);

  await api.post('/ticks', {
    idRoute: route.id,
    ascentType: 'redpoint',
    climbedAt: '2026-05-01',
    note: 'Phone first send'
  });
  await api.post('/ticks', {
    idRoute: route.id,
    ascentType: 'redpoint',
    note: 'Phone second lap'
  });
  await member.post('/ticks', {
    idRoute: route.id,
    ascentType: 'redpoint',
    note: 'Phone member send'
  });
});

test.afterAll(cleanup);

test('the logbook tab splits mine from everyone’s', async ({ page: phone }) => {
  await phone.goto(routePath(region.id, sector.id, route.id));

  await test.step('the log button counts the sends', async () => {
    await expect(logTickButton(phone)).toHaveAccessibleName(
      'Log repeat (Sent · 2 times)'
    );
  });

  await openTab(phone, 'Logbook');

  const panel = ascentsPanel(phone);

  await test.step('my ascents keep every lap, and only mine', async () => {
    await openTab(phone, 'My ascents');

    await expect(panel.getByText('Phone first send')).toBeVisible();
    await expect(panel.getByText('Phone second lap')).toBeVisible();
    await expect(panel.getByText('Phone member send')).toHaveCount(0);
  });

  await test.step('the community feed has first sends only', async () => {
    await openTab(phone, 'Community feed');

    await expect(panel.getByText('Phone first send')).toBeVisible();
    await expect(panel.getByText('Phone member send')).toBeVisible();
    await expect(panel.getByText('Phone second lap')).toHaveCount(0);
  });

  await test.step('and reads at a glance too', async () => {
    await pickOption(phone, 'View', 'Compact');

    await expect(panel.getByText('Phone member send')).toHaveCount(0);
    await expect(isFilterActive(phone, 'View')).toHaveCount(1);
  });
});

test('an empty route invites the first ascent', async ({ page: phone }) => {
  await phone.goto(routePath(region.id, sector.id, empty.id));
  await openTab(phone, 'Logbook');

  const panel = ascentsPanel(phone);

  await expect(panel.getByText('Track your progress')).toBeVisible();
  await expect(panel.getByRole('combobox', { name: 'View' })).toHaveCount(0);

  await openTab(phone, 'Community feed');
  await expect(panel.getByText('Log the first ascent')).toBeVisible();
});

test.describe('a visitor who has not signed in', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('reads everyone’s ascents and is asked to sign in for their own', async ({
    page: phone
  }) => {
    await phone.goto(routePath(region.id, sector.id, route.id));
    await openTab(phone, 'Logbook');

    const panel = ascentsPanel(phone);

    await expect(panel.getByText('Phone member send')).toBeVisible();
    await expect(phone.getByRole('tab', { name: 'My ascents' })).toHaveCount(0);

    await phone.goto(routePath(region.id, sector.id, empty.id));
    await openTab(phone, 'Logbook');
    await panel.getByRole('button', { name: 'Log ascent' }).click();

    // The phone's sheet is not announced as a dialog, so it is found by its
    // title.
    await expect(
      phone.getByRole('heading', { name: 'Sign in to log this ascent' })
    ).toBeVisible();
  });
});

test('a sent route is marked on the photo, opened full screen too', async ({
  page: phone
}) => {
  await phone.goto(sectorPath(region.id, sector.id));

  await expect(
    card(phone, route.name).getByRole('img', { name: 'Climbed' })
  ).toBeVisible();
  // One mark in the list, one on the photo's badge.
  await expect(phone.getByRole('img', { name: 'Climbed' })).toHaveCount(2);

  // The overlay drawn over the photo is what takes the tap, and a tap away
  // from both lines opens the photo rather than a route.
  await phone
    .locator('svg')
    .filter({ has: phone.locator('title', { hasText: 'Photo 1' }) })
    .click({ position: { x: 5, y: 5 } });

  const viewer = phone.getByRole('dialog');

  await expect(viewer.getByRole('button', { name: 'Close' })).toBeVisible();
  await expect(viewer.getByRole('img', { name: 'Climbed' })).toHaveCount(1);
});

test('the logbook keeps its filters on a phone as well', async ({
  page: phone
}) => {
  await phone.goto('/logbook');
  await pickOption(phone, 'View', 'Compact');
  await expect(isFilterActive(phone, 'View')).toHaveCount(1);

  await phone.reload();

  await expect(phone.getByRole('combobox', { name: 'View' })).toHaveText(
    'Compact'
  );
  await expect(isFilterActive(phone, 'View')).toHaveCount(1);
});
