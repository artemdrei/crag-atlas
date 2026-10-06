import { expect, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  addAscent,
  addLine,
  addTopo,
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { card, sectorPath } from '../../fixtures/ui';

/**
 * A route the climber has sent says so wherever it is numbered: its row in the
 * sector's list and its badge on the photo.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let sent: Row;
let open: Row;

test.beforeAll(async () => {
  region = await makeRegion('Climbed-Region');
  sector = await makeSector(region.id, 'Climbed-Sector');
  sent = await makeRoute(sector.id, 'Climbed-Route-Sent');
  open = await makeRoute(sector.id, 'Climbed-Route-Open');

  const topo = await addTopo(sector.id);

  await addLine(sent.id, topo.id, [
    [0.3, 0.8],
    [0.35, 0.3]
  ]);
  await addLine(open.id, topo.id, [
    [0.7, 0.8],
    [0.65, 0.3]
  ]);
  await addAscent(sent.id);
});

test.afterAll(cleanup);

test('a sent route is marked in the list and on the photo', async ({
  page
}) => {
  await page.goto(sectorPath(region.id, sector.id));

  await expect(
    card(page, sent.name).getByRole('img', { name: 'Climbed' })
  ).toBeVisible();
  await expect(
    card(page, open.name).getByRole('img', { name: 'Climbed' })
  ).toHaveCount(0);

  // One mark in the list, one on the photo's badge — and none for the route
  // nobody here has sent.
  await expect(page.getByRole('img', { name: 'Climbed' })).toHaveCount(2);
});

test.describe('a visitor who has not signed in', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('sees no marks at all', async ({ page }) => {
    await page.goto(sectorPath(region.id, sector.id));

    // The photo's badges have to be on screen before their missing mark means
    // anything.
    await expect(card(page, sent.name)).toBeVisible();
    await expect(page.getByRole('button', { name: /^6a\s*1$/ })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Climbed' })).toHaveCount(0);
  });
});
