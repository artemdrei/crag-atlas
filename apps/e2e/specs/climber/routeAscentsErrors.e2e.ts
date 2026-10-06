import { expect, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { ascentsPanel, openTab, routePath } from '../../fixtures/ui';

/**
 * The ascents panel when the API cannot answer, and in the other language.
 */
test.describe.configure({ mode: 'serial' });

// The service worker serves API calls itself, out of `page.route`'s reach.
test.use({ serviceWorkers: 'block' });

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('Errors-Region');
  sector = await makeSector(region.id, 'Errors-Sector');
  route = await makeRoute(sector.id, 'Errors-Route');
});

test.afterAll(cleanup);

test('a failed read says so instead of inviting the first ascent', async ({
  page
}) => {
  await page.route(/\/ticks\/routes\/[^/]+$/, (request) =>
    request.fulfill({
      status: 503,
      json: {
        statusCode: 503,
        code: 'TICKS_MINE_ROUTE_READ_FAILED',
        message: 'Could not load your ascents'
      }
    })
  );
  await page.goto(routePath(region.id, sector.id, route.id));
  await openTab(page, 'My ascents');

  const panel = ascentsPanel(page);

  await expect(panel.getByText('Could not load your ascents')).toBeVisible();
  await expect(panel.getByText('Track your progress')).toHaveCount(0);
});

test('the logbook filters speak Ukrainian', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('crag-atlas:locale', 'uk')
  );
  await page.goto('/logbook');

  await expect(
    page.getByRole('combobox', { name: 'Сортування' })
  ).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Тип пролазу' })).toHaveText(
    'Усі стилі'
  );
  await expect(page.getByRole('combobox', { name: 'Вигляд' })).toHaveText(
    'Детально'
  );
});
