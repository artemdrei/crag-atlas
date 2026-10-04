import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { openTab, routePath } from '../../fixtures/ui';

/**
 * A route climbed again is a repeat: the climber keeps every one, everyone
 * else sees the first send.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('Repeats-Region');
  sector = await makeSector(region.id, 'Repeats-Sector');
  route = await makeRoute(sector.id, 'Repeats-Route');

  await api.post('/ticks', {
    idRoute: route.id,
    ascentType: 'redpoint',
    climbedAt: '2026-05-01',
    note: 'First go at it'
  });
});

test.afterAll(cleanup);

test('a sent route is logged again as a repeat', async ({ page }) => {
  await page.goto(routePath(region.id, sector.id, route.id));

  await test.step('the route page knows it was sent', async () => {
    await expect(page.getByText('Sent ×1')).toBeVisible();
    await page.getByRole('button', { name: 'Log repeat' }).click();
  });

  const dialog = page.getByRole('dialog');

  await test.step('the form says it is a repeat', async () => {
    await expect(
      dialog.getByText('You have sent this route before')
    ).toBeVisible();

    await dialog.getByRole('combobox', { name: 'Ascent type' }).click();
    await expect(page.getByRole('option', { name: 'Onsight' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await page.getByRole('option', { name: 'Redpoint' }).click();
  });

  await test.step('and logs it', async () => {
    await dialog
      .getByRole('textbox', { name: 'Comment', exact: true })
      .fill('Second lap');
    await dialog.getByRole('button', { name: 'Log repeat' }).click();

    await expect(dialog).toBeHidden();
  });

  await test.step('the route logbook shows the first send only', async () => {
    await openTab(page, 'Logbook');

    await expect(page.getByText('First go at it')).toBeVisible();
    await expect(page.getByText('Second lap')).toHaveCount(0);
  });

  await test.step('the climber finds it under the first send', async () => {
    await page.goto('/logbook');
    await page.getByRole('button', { name: '1 repeat' }).click();

    await expect(page.getByText('Second lap')).toBeVisible();
  });
});

test('an onsight cannot follow a send', async () => {
  await expect(
    api.post('/ticks', { idRoute: route.id, ascentType: 'onsight' })
  ).rejects.toThrow('TICK_REPEAT_FIRST_ASCENT_STYLE');
});
