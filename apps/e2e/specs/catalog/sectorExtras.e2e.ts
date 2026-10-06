import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { card, conditionsOf, pickOption, sectorPath } from '../../fixtures/ui';

/**
 * What a sector offers besides its routes: when to come, how to get there,
 * and the routes in the order the climber asks for.
 */
test.describe.configure({ mode: 'serial' });

// The service worker serves API calls itself, out of `page.route`'s reach.
test.use({ serviceWorkers: 'block' });

let region: Row;
let sector: Row;
let easy: Row;
let hard: Row;

test.beforeAll(async () => {
  region = await makeRegion('Extras-Region');
  sector = await makeSector(region.id, 'Extras-Sector');
  easy = await makeRoute(sector.id, 'Extras-Route-Easy');
  hard = await makeRoute(sector.id, 'Extras-Route-Hard');

  await api.patch(`/routes/${hard.id}`, {
    name: hard.name,
    grade: '7a',
    gradeScale: 'french',
    type: 'sport'
  });
});

test.afterAll(cleanup);

test('the days ahead are scored, and a day opens its reading', async ({
  page
}) => {
  await page.route(/\/sectors\/[^/]+\/conditions$/, (request) =>
    request.fulfill({ json: conditionsOf([94, 41]) })
  );
  await page.goto(sectorPath(region.id, sector.id));

  const today = page.getByRole('button', { name: /^today \d+ 94$/ });
  const tomorrow = page.getByRole('button', { name: / 41$/ });

  await expect(today).toBeVisible();
  await expect(tomorrow).toBeVisible();
  await expect(page.getByText('Weather by Open-Meteo.com')).toHaveCount(0);

  await tomorrow.click();

  await expect(page.getByText('Weather by Open-Meteo.com')).toBeVisible();
});

test('a sector without a pin has no conditions to show', async ({ page }) => {
  await page.route(/\/sectors\/[^/]+\/conditions$/, (request) =>
    request.fulfill({ json: conditionsOf([94], false) })
  );
  await page.goto(sectorPath(region.id, sector.id));

  await expect(card(page, easy.name)).toBeVisible();
  await expect(page.getByRole('button', { name: /^today / })).toHaveCount(0);
});

test('directions lead to the sector’s pin', async ({ page }) => {
  // A sector is created without a pin and given one in the editor.
  await api.patch(`/sectors/${sector.id}`, {
    name: sector.name,
    lat: 48.68291,
    lng: 26.56402
  });
  await page.goto(sectorPath(region.id, sector.id));

  await expect(page.getByRole('link', { name: 'Directions' })).toHaveAttribute(
    'href',
    /destination=48\.68291,26\.56402/
  );
});

test('routes are sorted by grade, either way', async ({ page }) => {
  await page.goto(sectorPath(region.id, sector.id));

  const isEasyFirst = async () => {
    const [a, b] = await Promise.all([
      card(page, easy.name).boundingBox(),
      card(page, hard.name).boundingBox()
    ]);

    return (a?.y ?? 0) < (b?.y ?? 0);
  };

  await page.getByRole('button', { name: 'Filters' }).click();
  await pickOption(page, 'Sort', 'Grade');

  const direction = page.getByRole('button', {
    name: /^(Ascending|Descending)$/
  });

  await expect(direction).toBeVisible();

  const before = (await direction.textContent())?.trim();
  const wasEasyFirst = before === 'Ascending';

  await expect.poll(isEasyFirst).toBe(wasEasyFirst);

  await direction.click();

  await expect(direction).not.toHaveText(before ?? '');
  await expect.poll(isEasyFirst).toBe(!wasEasyFirst);
});
