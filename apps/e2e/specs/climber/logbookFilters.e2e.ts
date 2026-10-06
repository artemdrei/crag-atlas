import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { expectFilters, isFilterActive, pickOption } from '../../fixtures/ui';

/**
 * The logbook's sort, style and view sit above the list, and each is kept
 * for the next visit — a climber who reads their logbook by date should not
 * have to say so every time.
 */
test.describe.configure({ mode: 'serial' });

const DEFAULTS = {
  'Sort by': 'Grade',
  'Ascent type': 'All styles',
  View: 'Detailed'
};

let route: Row;

test.beforeAll(async () => {
  const region = await makeRegion('Filters-Region');
  const sector = await makeSector(region.id, 'Filters-Sector');

  route = await makeRoute(sector.id, 'Filters-Route');

  await api.post('/ticks', {
    idRoute: route.id,
    ascentType: 'redpoint',
    note: 'Filters note on a redpoint'
  });
});

test.afterAll(cleanup);

test('the filters are kept for the next visit', async ({ page }) => {
  await page.goto('/logbook');

  await test.step('they start at their defaults', async () => {
    await expectFilters(page, DEFAULTS);
    await expect(page.locator('[data-active]')).toHaveCount(0);
    await expect(page.getByText('Filters note on a redpoint')).toBeVisible();
  });

  await test.step('a change marks the filter', async () => {
    await pickOption(page, 'Sort by', 'Date');
    await pickOption(page, 'Ascent type', 'Redpoint');
    await pickOption(page, 'View', 'Compact');

    for (const field of ['Sort by', 'Ascent type', 'View'])
      await expect(isFilterActive(page, field)).toHaveCount(1);

    await expect(page.getByText(route.name)).toBeVisible();
    await expect(page.getByText('Filters note on a redpoint')).toHaveCount(0);
  });

  await test.step('and outlives a reload', async () => {
    await page.reload();

    await expectFilters(page, {
      'Sort by': 'Date',
      'Ascent type': 'Redpoint',
      View: 'Compact'
    });
    await expect(page.getByText(route.name)).toBeVisible();
    await expect(page.getByText('Filters note on a redpoint')).toHaveCount(0);
  });
});

test('a stored value the app no longer knows falls back to the default', async ({
  page
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('crag-atlas:logbook-sort', 'rating');
    localStorage.setItem('crag-atlas:logbook-ascent-type', 'dyno');
    localStorage.setItem('crag-atlas:logbook-view', 'tiny');
  });
  await page.goto('/logbook');

  await expectFilters(page, DEFAULTS);
  await expect(page.locator('[data-active]')).toHaveCount(0);
});
