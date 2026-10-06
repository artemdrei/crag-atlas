import { expect, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { type Climber, makeClimber, signInAs } from '../../fixtures/climber';
import { ascentsPanel, logTickButton, routePath } from '../../fixtures/ui';

/**
 * The route page on a desktop fills the screen and scrolls by column: a long
 * list of ascents scrolls inside its own panel, and the log button above it
 * stays in reach. A narrower window stacks the columns instead.
 */
test.describe.configure({ mode: 'serial' });

signInAs(() => climber);

const LAPS = 15;

let climber: Climber;
let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  climber = await makeClimber('Layout');
  region = await makeRegion('Layout-Region');
  sector = await makeSector(region.id, 'Layout-Sector');
  route = await makeRoute(sector.id, 'Layout-Route');

  await Promise.all(
    Array.from({ length: LAPS }, (_, index) =>
      climber.post('/ticks', {
        idRoute: route.id,
        ascentType: 'redpoint',
        climbedAt: `2026-03-${String(index + 1).padStart(2, '0')}`,
        note: `Layout lap ${index + 1}`
      })
    )
  );
});

test.afterAll(async () => {
  await climber.remove();
  await cleanup();
});

test('a long list scrolls inside its panel, the log button stays put', async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 800 });

  await page.goto(routePath(region.id, sector.id, route.id));

  const panel = ascentsPanel(page);
  const firstLap = panel.getByText('Layout lap 1', { exact: true });

  await expect(panel.getByText(`Layout lap ${LAPS}`)).toBeVisible();
  await expect(firstLap).not.toBeInViewport();

  await firstLap.scrollIntoViewIfNeeded();

  await expect(firstLap).toBeInViewport();
  await expect(logTickButton(page)).toBeInViewport();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('a narrower window stacks the panel under the route', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });

  await page.goto(routePath(region.id, sector.id, route.id));

  // Stacked, not overlapping: the panel starts below the last thing the
  // route column shows.
  const tabs = await page.getByRole('tab', { name: 'Comments' }).boundingBox();
  const button = await logTickButton(page).boundingBox();

  expect(tabs).not.toBeNull();
  expect(button).not.toBeNull();
  expect(button?.y ?? 0).toBeGreaterThan((tabs?.y ?? 0) + (tabs?.height ?? 0));
});
