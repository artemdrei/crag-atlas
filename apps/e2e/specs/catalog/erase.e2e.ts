import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  addAscent,
  addComment,
  addTopo,
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import {
  card,
  catalogPath,
  confirm,
  editorPath,
  expectErased,
  regionPath,
  routePath
} from '../../fixtures/ui';

/**
 * Erasing destroys rows for good. It is refused while anything climbers made
 * points at them, it takes every catalog row underneath, and the panel warns
 * about that before the click.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let plainSector: Row;
let plainRouteA: Row;
let plainRouteB: Row;
let routeWithContent: Row;

test.beforeAll(async () => {
  region = await makeRegion('Erase-Region-Home');
  sector = await makeSector(region.id, 'Erase-Sector-Home');
  routeWithContent = await makeRoute(sector.id, 'Erase-Route-Content');

  await addAscent(routeWithContent.id);
  await addComment(routeWithContent.id);

  plainSector = await makeSector(region.id, 'Erase-Sector-Plain');
  plainRouteA = await makeRoute(plainSector.id, 'Erase-Route-A');
  plainRouteB = await makeRoute(plainSector.id, 'Erase-Route-B');
});

test.afterAll(cleanup);

test('a route can be erased once nothing climbers made points at it', async ({
  page
}) => {
  await api.delete(`/routes/${routeWithContent.id}`);
  await page.goto(routePath(region.id, sector.id, routeWithContent.id));

  await test.step('while the content is there, erase is refused', async () => {
    await expect(
      page.getByRole('button', { name: 'Erase for good' })
    ).toBeDisabled();
  });

  // No reload from here on: the count behind the button is cached for five
  // minutes, so it can only be right if deleting the content invalidates it.
  await test.step('delete the ascent', async () => {
    await page.getByRole('button', { name: 'Ascent actions' }).first().click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await confirm(page, 'Delete');
  });

  await test.step('delete the comment', async () => {
    await page.getByRole('button', { name: 'Comment actions' }).first().click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await confirm(page, 'Delete');
  });

  await test.step('the offer changes without a reload', async () => {
    await expect(page.getByText('Climbers left nothing here')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Erase for good' })
    ).toBeEnabled();
  });

  await test.step('and the route goes', async () => {
    await page.getByRole('button', { name: 'Erase for good' }).click();
    await confirm(page, 'Erase for good');
    await expectErased(`/routes/${routeWithContent.id}`);
  });
});

test('the API refuses an erase made behind the UI’s back', async () => {
  const route = await makeRoute(sector.id, 'Erase-Route-Guarded');

  await addAscent(route.id);
  await api.delete(`/routes/${route.id}`);

  const response = await api.raw('DELETE', `/routes/${route.id}/permanent`);

  expect(response.status).toBe(409);
  expect(await response.json()).toMatchObject({ code: 'ROUTE_HAS_CONTENT' });
});

test('erasing a sector takes the routes under it', async ({ page }) => {
  await api.delete(`/sectors/${plainSector.id}`);
  await page.goto(regionPath(region.id, true));
  await card(page, plainSector.name).click();

  await test.step('the panel warns how many routes go with it', async () => {
    await expect(page.getByText('Climbers left nothing here')).toBeVisible();
    await expect(
      page.getByText('Erasing takes 2 routes with it')
    ).toBeVisible();
  });

  await test.step('the dialog does not repeat the number', async () => {
    await page.getByRole('button', { name: 'Erase for good' }).click();
    await expect(
      page.getByText('and everything filed under it leave the database')
    ).toBeVisible();
    await confirm(page, 'Erase for good');
  });

  await test.step('sector and routes are gone from the database', async () => {
    await expectErased(`/sectors/${plainSector.id}`);
    await expectErased(`/routes/${plainRouteA.id}`);
    await expectErased(`/routes/${plainRouteB.id}`);
  });
});

test('the warning does not count a separately archived route', async ({
  page
}) => {
  const doomed = await makeSector(region.id, 'Erase-Sector-Undercount');
  const visible = await makeRoute(doomed.id, 'Erase-Route-Visible');
  const hidden = await makeRoute(doomed.id, 'Erase-Route-Hidden');

  await api.delete(`/routes/${hidden.id}`);
  await api.delete(`/sectors/${doomed.id}`);

  await page.goto(regionPath(region.id, true));
  await card(page, doomed.name).click();

  await test.step('the warning names one route', async () => {
    await expect(page.getByText('Erasing takes 1 route with it')).toBeVisible();
  });

  await test.step('the cascade takes both', async () => {
    await page.getByRole('button', { name: 'Erase for good' }).click();
    await confirm(page, 'Erase for good');
    await expectErased(`/routes/${visible.id}`);
    await expectErased(`/routes/${hidden.id}`);
  });
});

test('a sector whose routes carry content cannot be erased', async ({
  page
}) => {
  const kept = await makeSector(region.id, 'Erase-Sector-Kept');
  const route = await makeRoute(kept.id, 'Erase-Route-Kept');

  await addAscent(route.id);
  await addComment(route.id);
  await api.delete(`/sectors/${kept.id}`);

  await page.goto(regionPath(region.id, true));
  await card(page, kept.name).click();

  await expect(
    page.getByText('climbers left 1 ascent, 1 comment')
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Erase for good' })
  ).toBeDisabled();
});

test('a region whose catalog holds content cannot be erased either', async ({
  page
}) => {
  // Its own region: the shared one has been added to and erased from by the
  // scenarios above, and this assertion is about an exact count.
  const kept = await makeRegion('Erase-Region-Kept');
  const keptSector = await makeSector(kept.id, 'Erase-Sector-In-Kept');
  const route = await makeRoute(keptSector.id, 'Erase-Route-In-Kept');

  await addAscent(route.id);
  await addComment(route.id);
  await api.delete(`/regions/${kept.id}`);

  await page.goto(catalogPath(true));
  await card(page, kept.name).click();

  // The count that must be scoped to this region: before 034 it reported
  // whatever the rest of the catalog held.
  await expect(
    page.getByText('climbers left 1 ascent, 1 comment')
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Erase for good' })
  ).toBeDisabled();
});

test('an empty region reads as empty and erases', async ({ page }) => {
  const lonely = await makeRegion('Erase-Region-Empty');

  await api.delete(`/regions/${lonely.id}`);
  await page.goto(catalogPath(true));
  await card(page, lonely.name).click();

  // The cheapest guard on the scoping fix: a brand-new region must read as
  // empty while the rest of the catalog holds ascents and comments.
  await expect(page.getByText('Climbers left nothing here')).toBeVisible();

  await page.getByRole('button', { name: 'Erase for good' }).click();
  await confirm(page, 'Erase for good');

  await expectErased(`/regions/${lonely.id}`);
});

test('erasing a region takes its sectors and their routes', async ({
  page
}) => {
  const doomed = await makeRegion('Erase-Region-Doomed');
  const sectorOfIt = await makeSector(doomed.id, 'Erase-Sector-Doomed');
  const routeA = await makeRoute(sectorOfIt.id, 'Erase-Route-Doomed-A');
  const routeB = await makeRoute(sectorOfIt.id, 'Erase-Route-Doomed-B');

  await api.delete(`/regions/${doomed.id}`);
  await page.goto(catalogPath(true));
  await card(page, doomed.name).click();

  await expect(
    page.getByText('Erasing takes 1 sector and 2 routes with it')
  ).toBeVisible();

  await page.getByRole('button', { name: 'Erase for good' }).click();
  await confirm(page, 'Erase for good');

  await expectErased(`/sectors/${sectorOfIt.id}`);
  await expectErased(`/routes/${routeA.id}`);
  await expectErased(`/routes/${routeB.id}`);
});

test('the topo editor cannot erase a route that still has an ascent', async ({
  page
}) => {
  // Its own sector, so the archive view holds exactly one row to read.
  const own = await makeSector(region.id, 'Erase-Sector-Offer');
  const route = await makeRoute(own.id, 'Erase-Route-Offer');

  await addAscent(route.id);
  await api.delete(`/routes/${route.id}`);

  await page.goto(editorPath(region.id, own.id, true));

  await expect(page.getByText('climbers left 1 ascent')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Erase for good' })
  ).toBeDisabled();
});

test('erasing a sector takes its photos out of the bucket', async () => {
  const doomed = await makeSector(region.id, 'Erase-Sector-With-Photo');
  const topo = await addTopo(doomed.id);
  const photoUrl = (
    await api.get<{ id: string; photoUrl: string }[]>(
      `/sectors/${doomed.id}/topos`
    )
  ).find(({ id }) => id === topo.id)?.photoUrl;

  if (!photoUrl) throw new Error('The fixture photo was not uploaded');

  expect((await fetch(photoUrl)).status).toBe(200);

  await api.delete(`/sectors/${doomed.id}`);
  await api.delete(`/sectors/${doomed.id}/permanent`);

  await expectErased(`/sectors/${doomed.id}`);

  // The rows go by a SQL cascade, which knows nothing about storage — so the
  // file has to be taken out by whoever ran the erase.
  await expect
    .poll(async () => (await fetch(photoUrl)).status, { timeout: 5_000 })
    .not.toBe(200);
});

test('erasing a region takes the photos two levels down', async () => {
  const doomed = await makeRegion('Erase-Region-With-Photo');
  const sectorOfIt = await makeSector(doomed.id, 'Erase-Sector-Under-Region');
  const topo = await addTopo(sectorOfIt.id);
  const photoUrl = (
    await api.get<{ id: string; photoUrl: string }[]>(
      `/sectors/${sectorOfIt.id}/topos`
    )
  ).find(({ id }) => id === topo.id)?.photoUrl;

  if (!photoUrl) throw new Error('The fixture photo was not uploaded');

  await api.delete(`/regions/${doomed.id}`);
  await api.delete(`/regions/${doomed.id}/permanent`);

  await expectErased(`/regions/${doomed.id}`);
  await expect
    .poll(async () => (await fetch(photoUrl)).status, { timeout: 5_000 })
    .not.toBe(200);
});
