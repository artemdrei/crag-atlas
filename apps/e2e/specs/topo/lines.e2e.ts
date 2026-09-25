import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import { clickPhoto, dragHandleTo, handles } from '../../fixtures/canvas';
import type { Row } from '../../fixtures/catalog';
import {
  addTopo,
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { card, confirm, editorPath, routeRow } from '../../fixtures/ui';

/**
 * Drawing a route onto a photo. The overlay is the only part of the app a
 * spec has to point at rather than name, so these go through
 * `fixtures/canvas.ts`.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;

interface Line {
  idRoute: string;
  /** The API sends points as [x, y] pairs in the photo's 0..1 space. */
  points: [number, number][];
}

/** The line a route carries, wherever on the sector's photos it sits. */
const lineOf = async (idRoute: string) => {
  const topos = await api.get<{ lines: Line[] }[]>(
    `/sectors/${sector.id}/topos`
  );

  return topos
    .flatMap(({ lines }) => lines)
    .find((line) => line.idRoute === idRoute);
};

test.beforeAll(async () => {
  region = await makeRegion('Lines-Region');
  sector = await makeSector(region.id, 'Lines-Sector');
  route = await makeRoute(sector.id, 'Lines-Route');

  await addTopo(sector.id);
});

test.afterAll(cleanup);

test('a route is drawn by clicking the photo, and saved on purpose', async ({
  page
}) => {
  await page.goto(editorPath(region.id, sector.id));

  await test.step('nothing is drawn until a route is selected', async () => {
    await clickPhoto(page, 0.5, 0.5);
    await expect(
      page.getByRole('button', { name: 'Save changes' })
    ).toHaveCount(0);
  });

  await test.step('three clicks make a line', async () => {
    await routeRow(page, route.name).click();
    await clickPhoto(page, 0.4, 0.8);
    await clickPhoto(page, 0.45, 0.55);
    await clickPhoto(page, 0.5, 0.3);

    await expect(
      page.getByRole('button', { name: 'Delete line' })
    ).toBeEnabled();
  });

  await test.step('saving sends it to everyone', async () => {
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect
      .poll(async () => (await lineOf(route.id))?.points.length)
      .toBe(3);
  });
});

test('undo takes back the last point, redo puts it again', async ({ page }) => {
  await page.goto(editorPath(region.id, sector.id));
  await routeRow(page, route.name).click();

  await clickPhoto(page, 0.6, 0.2);
  await page.getByRole('button', { name: 'Undo' }).click();

  await test.step('the save is back to nothing to save', async () => {
    await expect(
      page.getByRole('button', { name: 'Save changes' })
    ).toBeDisabled();
  });

  await page.getByRole('button', { name: 'Redo' }).click();

  await expect(
    page.getByRole('button', { name: 'Save changes' })
  ).toBeEnabled();
});

test('a point is dragged to where the rock is', async ({ page }) => {
  const before = await lineOf(route.id);

  await page.goto(editorPath(region.id, sector.id));
  await routeRow(page, route.name).click();

  await dragHandleTo(page, handles(page).last(), { x: 0.7, y: 0.25 });
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect
    .poll(async () => (await lineOf(route.id))?.points.at(-1)?.[0])
    .not.toBe(before?.points.at(-1)?.[0]);
});

test('a line is deleted without touching the route', async ({ page }) => {
  await page.goto(editorPath(region.id, sector.id));
  await routeRow(page, route.name).click();

  await page.getByRole('button', { name: 'Delete line' }).click();
  await confirm(page, 'Delete line');

  // Unlike drawing, deleting a line does not wait to be saved: it goes
  // straight to the server, and the panel has nothing left to save.
  await expect.poll(async () => await lineOf(route.id)).toBeUndefined();
  await expect(
    page.getByRole('button', { name: 'Save changes' })
  ).toBeDisabled();

  await test.step('the route itself is still in the catalog', async () => {
    await page.goto(editorPath(region.id, sector.id));
    await expect(card(page, route.name)).toBeVisible();
  });
});
