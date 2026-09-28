import { expect, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';

/**
 * The phone searches through its own component: the hits are a list under the
 * field rather than a popper over it, and there is no click-away to close.
 */
test.describe.configure({ mode: 'serial' });

const LOCAL_TERM = 'Печера';

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('Phone-Search-Region');
  sector = await makeSector(region.id, 'Phone-Search-Sector');
  route = await makeRoute(
    sector.id,
    'Phone-Search-Route',
    `${LOCAL_TERM} Довбуша`
  );
});

test.afterAll(cleanup);

test('the phone searches the catalog and walks to the hit', async ({
  page
}) => {
  await page.goto('/');

  const field = page.getByPlaceholder('Search a region, sector or route');

  await field.fill(LOCAL_TERM.slice(0, 2));
  await expect(page.getByText('Type at least 3 letters')).toBeVisible();

  await test.step('the local spelling finds the route', async () => {
    await field.fill(LOCAL_TERM);
    await expect(
      page.getByRole('button', { name: new RegExp(route.name) })
    ).toBeVisible();
  });

  await test.step('and picking it opens the route', async () => {
    await page.getByRole('button', { name: new RegExp(route.name) }).click();

    await expect(page).toHaveURL(
      `/regions/${region.id}/sectors/${sector.id}/routes/${route.id}`
    );
    await expect(page.getByRole('heading', { name: route.name })).toBeVisible();
  });
});
