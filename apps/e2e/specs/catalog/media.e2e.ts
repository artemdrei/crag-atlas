import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  addLink,
  addPhoto,
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import {
  confirm,
  editorPath,
  expectErased,
  openTab,
  routePath
} from '../../fixtures/ui';

/**
 * Photos and links are the third thing the erase offer counts, alongside
 * ascents and comments — and the only one that also leaves a file behind.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let linked: Row;
let photographed: Row;

test.beforeAll(async () => {
  region = await makeRegion('Media-Region');
  sector = await makeSector(region.id, 'Media-Sector');
  linked = await makeRoute(sector.id, 'Media-Route-Link');
  photographed = await makeRoute(sector.id, 'Media-Route-Photo');

  await addLink(linked.id);
  await addPhoto(photographed.id);
});

test.afterAll(cleanup);

test('a link holds a route back until it is deleted', async ({ page }) => {
  await api.delete(`/routes/${linked.id}`);

  await test.step('the editor counts it and refuses the erase', async () => {
    await page.goto(editorPath(region.id, sector.id, true));
    await expect(page.getByText('climbers left 1 photo or link')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Erase for good' })
    ).toBeDisabled();
  });

  // No reload between deleting the link and reading the note.
  await test.step('delete it from the route page', async () => {
    await page.goto(routePath(region.id, sector.id, linked.id));
    await openTab(page, 'Video and photo');
    await page.getByRole('button', { name: 'Delete media' }).first().click();
    await confirm(page, 'Delete');
  });

  await test.step('the offer changes and the route goes', async () => {
    await expect(page.getByText('Climbers left nothing here')).toBeVisible();
    await page.getByRole('button', { name: 'Erase for good' }).click();
    await confirm(page, 'Erase for good');
    await expectErased(`/routes/${linked.id}`);
  });
});

test('an uploaded photo behaves the same way', async ({ page }) => {
  const [photo] = await api.get<{ id: string; url: string }[]>(
    `/routes/${photographed.id}/media`
  );

  if (!photo) throw new Error('The fixture photo was not uploaded');

  // The bucket is public, so a successful upload is reachable by URL.
  expect((await fetch(photo.url)).status).toBe(200);

  await api.delete(`/routes/${photographed.id}`);
  await page.goto(editorPath(region.id, sector.id, true));

  await expect(page.getByText('climbers left 1 photo or link')).toBeVisible();

  await page.goto(routePath(region.id, sector.id, photographed.id));
  await openTab(page, 'Video and photo');
  await page.getByRole('button', { name: 'Delete media' }).first().click();
  await confirm(page, 'Delete');

  await expect(page.getByText('Climbers left nothing here')).toBeVisible();

  await page.getByRole('button', { name: 'Erase for good' }).click();
  await confirm(page, 'Erase for good');

  await expectErased(`/routes/${photographed.id}`);
});

test('the upload refuses anything that is not a WebP', async () => {
  const body = new FormData();

  body.set(
    'file',
    new Blob([Buffer.from('not an image')], { type: 'image/webp' }),
    'fake.webp'
  );

  const route = await makeRoute(sector.id, 'Media-Route-Bad-Upload');
  const response = await api.rawUpload(`/routes/${route.id}/media/photo`, body);

  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({ code: 'PHOTO_NOT_WEBP' });
});

test('the file behind a deleted photo leaves the bucket', async () => {
  const route = await makeRoute(sector.id, 'Media-Route-Orphan');
  const uploaded = await addPhoto(route.id);

  expect((await fetch(uploaded.url)).status).toBe(200);

  await api.delete(`/routes/${route.id}/media/${uploaded.id}`);

  await expect
    .poll(async () => (await fetch(uploaded.url)).status, { timeout: 5_000 })
    .not.toBe(200);
});
