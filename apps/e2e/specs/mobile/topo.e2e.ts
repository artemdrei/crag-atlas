import { expect, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  addLine,
  addTopo,
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { routePath } from '../../fixtures/ui';

/**
 * The topo on a phone. There is no editor here — drawing is desktop-only —
 * but the photo and the line on it are what the climber came to see, and they
 * open in a sheet of their own.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('Phone-Topo-Region');
  sector = await makeSector(region.id, 'Phone-Topo-Sector');
  route = await makeRoute(sector.id, 'Phone-Topo-Route');

  const topo = await addTopo(sector.id);

  await addLine(route.id, topo.id, [
    [0.4, 0.8],
    [0.5, 0.3]
  ]);
});

test.afterAll(cleanup);

test('the route shows its photo, and the photo opens full width', async ({
  page: phone
}) => {
  await phone.goto(routePath(region.id, sector.id, route.id));

  const open = phone.getByRole('button', { name: 'Open the photo' });

  await expect(open).toBeVisible();
  await open.click();

  await expect(phone.getByRole('img', { name: 'Photo 1' })).toHaveCount(2);
});

test('a route nobody has drawn shows no photo to open', async ({
  page: phone
}) => {
  const bare = await makeRoute(sector.id, 'Phone-Topo-Undrawn');

  await phone.goto(routePath(region.id, sector.id, bare.id));

  await expect(
    phone.getByRole('button', { name: 'Open the photo' })
  ).toHaveCount(0);
});
