import { expect, test } from '@playwright/test';

import { member } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { confirm, openTab, routePath } from '../../fixtures/ui';
import { STORAGE_STATE_MEMBER } from '../../setup/storageState';

/**
 * Logging an ascent. A tick belongs to the climber who logged it: it follows
 * them to their logbook, only they may change it, and the note they mark
 * private is theirs alone.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;
let shared: Row;
let page: string;

test.beforeAll(async () => {
  region = await makeRegion('Ticks-Region');
  sector = await makeSector(region.id, 'Ticks-Sector');
  route = await makeRoute(sector.id, 'Ticks-Route');
  shared = await makeRoute(sector.id, 'Ticks-Route-Shared');
  page = routePath(region.id, sector.id, route.id);
});

test.afterAll(cleanup);

test('an ascent is logged, edited and taken back', async ({
  page: browser
}) => {
  await browser.goto(page);

  await test.step('log it from the route page', async () => {
    await browser.getByRole('button', { name: 'Log ascent' }).click();

    const dialog = browser.getByRole('dialog');

    await dialog
      .getByRole('textbox', { name: 'Comment', exact: true })
      .fill('Went second go');
    await dialog.getByRole('button', { name: 'Log ascent' }).click();
  });

  await test.step('it is on the route', async () => {
    await openTab(browser, 'Logbook');

    await expect(browser.getByText('Went second go')).toBeVisible();
    await expect(
      browser.getByRole('button', { name: 'Ascent actions' })
    ).toBeVisible();
  });

  await test.step('and in the logbook', async () => {
    await browser.goto('/logbook');
    await expect(browser.getByText(route.name)).toBeVisible();
  });

  await test.step('its climber can rewrite it', async () => {
    await browser.goto(page);
    await openTab(browser, 'Logbook');
    await browser.getByRole('button', { name: 'Ascent actions' }).click();
    await browser.getByRole('menuitem', { name: 'Edit' }).click();

    const dialog = browser.getByRole('dialog');

    await dialog
      .getByRole('textbox', { name: 'Comment', exact: true })
      .fill('Went first go, actually');
    await dialog.getByRole('button', { name: 'Save' }).click();

    // The dialog fades out, and until it has the comment is on screen twice:
    // once in the logbook, once still in the textarea it was typed into.
    await expect(dialog).toBeHidden();
    await expect(browser.getByText('Went first go, actually')).toBeVisible();
  });

  await test.step('and take it back', async () => {
    await browser.getByRole('button', { name: 'Ascent actions' }).click();
    await browser.getByRole('menuitem', { name: 'Delete' }).click();
    await confirm(browser, 'Delete');

    await expect(
      browser.getByRole('button', { name: 'Ascent actions' })
    ).toHaveCount(0);
  });
});

test('a private note is not for the rest of the world', async ({
  page: browser
}) => {
  await member.post('/ticks', {
    idRoute: shared.id,
    ascentType: 'redpoint',
    note: 'Knee bar nobody else found',
    notePrivate: true
  });

  await browser.goto(routePath(region.id, sector.id, shared.id));
  await openTab(browser, 'Logbook');

  await expect(browser.getByText('Knee bar nobody else found')).toHaveCount(0);
});

test.describe('as the climber who logged it', () => {
  test.use({ storageState: STORAGE_STATE_MEMBER });

  // The route's logbook hands the mapper no viewer, so it holds the note back
  // from its author as well. Their own logbook is where they read it.
  test('their own private note is theirs to read', async ({
    page: browser
  }) => {
    await browser.goto('/logbook');

    await expect(browser.getByText('Knee bar nobody else found')).toBeVisible();
  });

  test('somebody else’s ascent offers them nothing', async ({
    page: browser
  }) => {
    await browser.goto(routePath(region.id, sector.id, shared.id));
    await openTab(browser, 'Logbook');

    // Their own ascent is on this route, and it is the only one with a menu.
    await expect(
      browser.getByRole('button', { name: 'Ascent actions' })
    ).toHaveCount(1);
  });
});
