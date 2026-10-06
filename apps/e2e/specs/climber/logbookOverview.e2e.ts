import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { type Climber, makeClimber, signInAs } from '../../fixtures/climber';
import { confirm, openTab } from '../../fixtures/ui';

/**
 * A logbook read from the top: the split between sport and bouldering, the
 * count of every style, the way back to each route, and the community feed
 * that keeps loading as it is scrolled. The climber is the spec's own, so the
 * counts are exactly what it logged.
 */
test.describe.configure({ mode: 'serial' });

signInAs(() => climber);

const FEED_PAGE = 20;

let climber: Climber;
let region: Row;
let sector: Row;
let onsight: Row;
let redpoint: Row;
let boulder: Row;
let oldRoutes: Row[];

test.beforeAll(async () => {
  climber = await makeClimber('Overview');
  region = await makeRegion('Overview-Region');
  sector = await makeSector(region.id, 'Overview-Sector');
  onsight = await makeRoute(sector.id, 'Overview-Onsight');
  redpoint = await makeRoute(sector.id, 'Overview-Redpoint');
  boulder = await makeRoute(sector.id, 'Overview-Boulder');

  await api.patch(`/routes/${boulder.id}`, {
    name: boulder.name,
    grade: '6A',
    gradeScale: 'font',
    type: 'boulder'
  });

  await climber.post('/ticks', { idRoute: onsight.id, ascentType: 'onsight' });
  await climber.post('/ticks', {
    idRoute: redpoint.id,
    ascentType: 'redpoint',
    climbedAt: '2026-04-01',
    note: 'Overview first send'
  });
  await climber.post('/ticks', {
    idRoute: redpoint.id,
    ascentType: 'redpoint',
    note: 'Overview second lap'
  });
  await climber.post('/ticks', { idRoute: boulder.id, ascentType: 'flash' });

  // More first sends than one page of the feed holds, all older than anything
  // else in the suite, so the oldest is only reached by scrolling.
  oldRoutes = await Promise.all(
    Array.from({ length: FEED_PAGE + 2 }, async (_, index) => {
      const day = index + 1;
      const route = await makeRoute(sector.id, `Overview-Old-${day}`);

      await climber.post('/ticks', {
        idRoute: route.id,
        ascentType: 'redpoint',
        climbedAt: `2001-01-${String(day).padStart(2, '0')}`
      });

      return route;
    })
  );
});

test.afterAll(async () => {
  await climber.remove();
  await cleanup();
});

test('the logbook counts every style it holds', async ({ page }) => {
  await page.goto('/logbook');

  // The counts are of first sends: a repeat lives under its first send, so it
  // adds nothing to them.
  await test.step('sport and bouldering are counted apart', async () => {
    await expect(page.getByRole('tab', { name: /^Sport · \d+$/ })).toHaveText(
      `Sport · ${2 + oldRoutes.length}`
    );
    await expect(
      page.getByRole('tab', { name: 'Bouldering · 1' })
    ).toBeVisible();
  });

  await test.step('each style has its own tile', async () => {
    await expect(
      page.getByRole('button', { name: /^1\s*Onsight$/ })
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: new RegExp(`^${1 + oldRoutes.length}\\s*Redpoint$`)
      })
    ).toBeVisible();
  });

  await test.step('a tile narrows the list to its style', async () => {
    await page.getByRole('button', { name: /^1\s*Onsight$/ }).click();

    await expect(page.getByText(onsight.name)).toBeVisible();
    await expect(page.getByText(redpoint.name)).toHaveCount(0);
  });

  await test.step('bouldering has its own list', async () => {
    await page.getByRole('tab', { name: 'Bouldering · 1' }).click();
    await page.getByRole('button', { name: /^1\s*All$/ }).click();

    await expect(page.getByText(boulder.name)).toBeVisible();
    await expect(page.getByText(onsight.name)).toHaveCount(0);
  });
});

test('a card leads back to its route and its region', async ({ page }) => {
  await page.goto('/logbook');
  await page.getByRole('link', { name: onsight.name }).click();
  await expect(page).toHaveURL(new RegExp(`/routes/${onsight.id}$`));

  await page.goBack();
  await page.getByRole('link', { name: region.name }).first().click();
  await expect(page).toHaveURL(new RegExp(`/regions/${region.id}$`));
});

test('a repeat is taken back from under its first send', async ({ page }) => {
  await page.goto('/logbook');
  await page.getByRole('button', { name: '1 repeat' }).click();
  await expect(page.getByText('Overview second lap')).toBeVisible();

  await page
    .locator('div')
    .filter({ hasText: 'Overview second lap' })
    .filter({ has: page.getByRole('button', { name: 'Ascent actions' }) })
    .last()
    .getByRole('button', { name: 'Ascent actions' })
    .click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await confirm(page, 'Delete');

  await expect(page.getByText('Overview second lap')).toHaveCount(0);
  await expect(page.getByText('Overview first send')).toBeVisible();
  await expect(page.getByRole('button', { name: '1 repeat' })).toHaveCount(0);
});

test('the community feed keeps loading as it is scrolled', async ({ page }) => {
  const [first] = oldRoutes;

  if (!first) throw new Error('No old routes were made');

  const oldest = page.getByRole('link', { name: first.name, exact: true });

  await page.goto('/logbook');
  await openTab(page, 'Community feed');

  // The page holds twenty; the oldest of these twenty-two is past it however
  // little else the feed carries.
  await expect(oldest).toHaveCount(0);

  await expect(async () => {
    await page.mouse.wheel(0, 4000);
    await expect(oldest).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 30_000 });
});
