import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { sectorPath } from '../../fixtures/ui';

/**
 * One box over the whole catalog. What only a running stack can answer: that
 * the term reaches `catalog_search` in either spelling, that a hit carries the
 * reader to the row it names, and that the archive stays out of it.
 */
test.describe.configure({ mode: 'serial' });

const LOCAL_TERM = 'Стіна';

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('Search-Region');
  sector = await makeSector(region.id, 'Search-Sector');
  route = await makeRoute(sector.id, 'Search-Route', `${LOCAL_TERM} Довбуша`);
});

test.afterAll(cleanup);

const hit = (page: Page, name: string) =>
  page.getByRole('option', { name: new RegExp(name) });

const searchFor = (page: Page, term: string) =>
  page.getByPlaceholder('Search a region, sector or route').fill(term);

test('the box waits for three letters before it looks', async ({ page }) => {
  await page.goto('/');
  await searchFor(page, route.name.slice(0, 2));

  await expect(page.getByText('Type at least 3 letters')).toBeVisible();
  await expect(hit(page, route.name)).toHaveCount(0);

  await test.step('the third letter opens the list', async () => {
    await searchFor(page, route.name);
    await expect(hit(page, route.name)).toBeVisible();
  });
});

test('a route is found by the spelling locals use', async ({ page }) => {
  await page.goto('/');
  await searchFor(page, LOCAL_TERM);

  await test.step('the hit is listed under its Latin name', async () => {
    await expect(hit(page, route.name)).toBeVisible();
  });

  await test.step('and it leads to the route itself', async () => {
    await hit(page, route.name).click();

    await expect(page).toHaveURL(
      `/regions/${region.id}/sectors/${sector.id}/routes/${route.id}`
    );
    await expect(page.getByRole('heading', { name: route.name })).toBeVisible();
  });
});

test('an archived row is out of the catalog and out of the search', async ({
  page
}) => {
  await api.delete(`/sectors/${sector.id}`);

  await page.goto('/');
  await searchFor(page, sector.name);

  await expect(page.getByText('Nothing found')).toBeVisible();

  await test.step('restoring puts it back in the results', async () => {
    await api.post(`/sectors/${sector.id}/restore`);
    await page.goto('/');
    await searchFor(page, sector.name);

    await hit(page, sector.name).click();
    await expect(page).toHaveURL(sectorPath(region.id, sector.id));
  });
});
