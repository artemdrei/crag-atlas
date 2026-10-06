import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { breadcrumb, card, pickGrade } from '../../fixtures/ui';

test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let bare: Row;
let easy: Row;
let hard: Row;

test.beforeAll(async () => {
  region = await makeRegion('Browse-Region');
  sector = await makeSector(region.id, 'Browse-Sector-Full');
  bare = await makeSector(region.id, 'Browse-Nothing-Sector');
  easy = await makeRoute(sector.id, 'Browse-Route-Easy');
  hard = await makeRoute(sector.id, 'Browse-Route-Hard');

  await api.patch(`/routes/${hard.id}`, {
    name: hard.name,
    grade: '7a',
    gradeScale: 'french',
    type: 'sport'
  });
});

test.afterAll(cleanup);

test('the catalog walks down to a route and back up again', async ({
  page
}) => {
  await page.goto('/');
  await card(page, region.name).click();

  await test.step('the region lists its sectors', async () => {
    await expect(card(page, sector.name)).toBeVisible();
    await card(page, sector.name).click();
  });

  await test.step('the sector lists its routes', async () => {
    await expect(card(page, easy.name)).toBeVisible();
    await expect(page.getByText('2 routes')).toHaveCount(1);
    await card(page, easy.name).click();
  });

  await test.step('the route names where it is', async () => {
    await expect(page.getByRole('heading', { name: easy.name })).toBeVisible();
  });

  await test.step('and the trail leads back', async () => {
    await breadcrumb(page, sector.name).click();
    await expect(card(page, easy.name)).toBeVisible();
    await expect(page.getByText('2 routes')).toHaveCount(1);

    await breadcrumb(page, region.name).click();
    await expect(card(page, sector.name)).toBeVisible();

    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Regions' })
      .click();
    await expect(card(page, region.name)).toBeVisible();
  });
});

test('the grade histogram narrows the sector down', async ({ page }) => {
  await page.goto(`/regions/${region.id}/sectors/${sector.id}`);

  await expect(page.getByText('2 routes')).toBeVisible();

  await test.step('picking a grade leaves only what climbs at it', async () => {
    await pickGrade(page, '7a');

    await expect(page.getByText('1 route', { exact: true })).toBeVisible();
    await expect(card(page, hard.name)).toBeVisible();
    await expect(card(page, easy.name)).toHaveCount(0);
  });

  await test.step('and resetting brings the rest back', async () => {
    await page.getByRole('button', { name: 'Clear all filters' }).click();

    await expect(page.getByText('2 routes')).toBeVisible();
    await expect(card(page, easy.name)).toBeVisible();
  });
});

test('the filter lives in the URL, not in the page', async ({ page }) => {
  await page.goto(`/regions/${region.id}/sectors/${sector.id}`);
  await pickGrade(page, '7a');

  await test.step('picking a grade writes it into the address', async () => {
    await expect(page).toHaveURL(/[?&]grades=french%7C7a/);
  });

  await test.step('a reload reads it back', async () => {
    await page.reload();

    await expect(page.getByText('1 route', { exact: true })).toBeVisible();
    await expect(card(page, easy.name)).toHaveCount(0);
  });

  await test.step('an address written by hand is obeyed', async () => {
    await page.goto(
      `/regions/${region.id}/sectors/${sector.id}?grades=french%7C6a`
    );

    await expect(card(page, easy.name)).toBeVisible();
    await expect(card(page, hard.name)).toHaveCount(0);
  });

  await test.step('and clearing it takes the parameter away', async () => {
    await page.getByRole('button', { name: 'Clear all filters' }).click();

    await expect(page).not.toHaveURL(/grades=/);
    await expect(page.getByText('2 routes')).toBeVisible();
  });
});

test('a filter cleared in a sector stays cleared in its region', async ({
  page
}) => {
  await page.goto(`/regions/${region.id}`);
  await pickGrade(page, '7a');
  await card(page, sector.name).click();

  await expect(page).toHaveURL(/\/sectors\/.+grades=french%7C7a/);

  await page.getByRole('button', { name: 'Clear all filters' }).click();
  await page.goBack();

  await expect(page).toHaveURL(new RegExp(`/regions/${region.id}$`));
});

test('a filter is not a step the back button walks', async ({ page }) => {
  await page.goto(`/regions/${region.id}`);
  await page.goto(`/regions/${region.id}/sectors/${sector.id}`);
  await pickGrade(page, '7a');

  await expect(page).toHaveURL(/grades=french%7C7a/);

  await test.step('back leaves the sector rather than undoing the filter', async () => {
    await page.goBack();

    await expect(page).toHaveURL(new RegExp(`/regions/${region.id}$`));
  });

  await test.step('and the sector comes back with the filter still on', async () => {
    await page.goForward();

    await expect(page).toHaveURL(/grades=french%7C7a/);
    await expect(page.getByText('1 route', { exact: true })).toBeVisible();
  });
});

test('a region narrows its sectors by route, and the sector keeps it', async ({
  page
}) => {
  await page.goto(`/regions/${region.id}`);
  await pickGrade(page, '7a');

  await test.step('each sector counts what matches, and an empty one sinks', async () => {
    await expect(card(page, sector.name)).toContainText('1 of 2 match');
    await expect(card(page, bare.name)).toContainText('no matches');

    const full = await card(page, sector.name).boundingBox();
    const empty = await card(page, bare.name).boundingBox();

    expect(full?.y).toBeLessThan(empty?.y ?? 0);
  });

  await test.step('opening the sector carries the filter into it', async () => {
    await card(page, sector.name).click();

    await expect(page).toHaveURL(
      new RegExp(`/sectors/${sector.id}\\?grades=french%7C7a`)
    );
    await expect(card(page, hard.name)).toBeVisible();
    await expect(card(page, easy.name)).toHaveCount(0);
  });
});

test('a sector nobody has drawn yet says it holds nothing', async ({
  page
}) => {
  await page.goto(`/regions/${region.id}/sectors/${bare.id}`);

  await expect(page.getByText('0 routes')).toBeVisible();
});

test('a map opens with a pin already chosen, so its card is there', async ({
  page
}) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Open region' })).toBeVisible();

  await test.step('a region opens on one of its sectors the same way', async () => {
    // Creating a sector takes no coordinates, only editing one does.
    await api.patch(`/sectors/${sector.id}`, {
      name: sector.name,
      nameLocal: sector.name,
      lat: 48.68291,
      lng: 26.56402
    });

    await page.goto(`/regions/${region.id}`);

    await expect(
      page.getByRole('button', { name: 'Open sector' })
    ).toBeVisible();
  });

  await test.step('and it is chosen again on the way back', async () => {
    await page.getByRole('button', { name: 'Open sector' }).click();
    await page.goBack();

    await expect(
      page.getByRole('button', { name: 'Open sector' })
    ).toBeVisible();
  });
});
