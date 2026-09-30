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
 * sit on the route itself: a phone zooms the photo where it is rather than
 * opening it anywhere else.
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

test('the route shows its photo with the line drawn on it', async ({
  page: phone
}) => {
  await phone.goto(routePath(region.id, sector.id, route.id));

  // The photo is on the route itself, once: the phone has nowhere to open it.
  await expect(phone.locator('img[alt="Photo 1"]')).toHaveCount(1);
  // The overlay over the photo answers to the same name, and the line is the
  // path drawn on it.
  await expect(
    phone.getByRole('img', { name: 'Photo 1' }).locator('path')
  ).toHaveCount(1);
});

test('a route nobody has drawn shows no photo', async ({ page: phone }) => {
  const bare = await makeRoute(sector.id, 'Phone-Topo-Undrawn');

  await phone.goto(routePath(region.id, sector.id, bare.id));

  await expect(phone.getByText('No topo yet')).toBeVisible();
  await expect(phone.locator('img[alt="Photo 1"]')).toHaveCount(0);
});
