import { expect, test } from '@playwright/test';

import { api, WALL_WEBP } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  addLine,
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { confirm, editorPath, thumbAction } from '../../fixtures/ui';

test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;

const toposOf = () =>
  api.get<{ id: string; lines: unknown[] }[]>(`/sectors/${sector.id}/topos`);

test.beforeAll(async () => {
  region = await makeRegion('Photos-Region');
  sector = await makeSector(region.id, 'Photos-Sector');
  route = await makeRoute(sector.id, 'Photos-Route');
});

test.afterAll(cleanup);

test('a sector without a photo asks for one, and takes it', async ({
  page
}) => {
  await page.goto(editorPath(region.id, sector.id));

  await expect(
    page.getByText('Add a photo to start drawing routes on it.')
  ).toBeVisible();

  await test.step('pick a file and confirm the upload', async () => {
    // Handed to the real file chooser rather than pushed into a hidden input:
    // only the click tells the editor which photo the file is for.
    const chooser = page.waitForEvent('filechooser');

    await page.getByRole('button', { name: 'Add photo' }).first().click();
    await (await chooser).setFiles(WALL_WEBP);
    await expect(page.getByRole('dialog')).toContainText('Add photo');
    await confirm(page, 'Upload');
  });

  await test.step('it is on the stage and in the rail', async () => {
    await expect(page.getByText('Photo uploaded')).toBeVisible();
    await expect(
      page.getByRole('img', { name: 'Photo 1' }).first()
    ).toBeVisible();
    await expect.poll(async () => (await toposOf()).length).toBe(1);
  });
});

test('replacing a photo that carries lines says what happens to them', async ({
  page
}) => {
  const [topo] = await toposOf();

  if (!topo) throw new Error('The sector has no photo to replace');

  await addLine(route.id, topo.id, [
    [0.4, 0.8],
    [0.5, 0.3]
  ]);

  await page.goto(editorPath(region.id, sector.id));
  // Only the click on the thumbnail's actions tells the rail which photo is
  // being replaced.
  await page.getByRole('img', { name: 'Photo 1' }).last().hover();

  const chooser = page.waitForEvent('filechooser');

  await thumbAction(page, 'Replace photo').click();
  await (await chooser).setFiles(WALL_WEBP);

  await expect(page.getByRole('dialog')).toContainText('Replace photo');
  await expect(page.getByText('The lines are kept')).toBeVisible();

  await confirm(page, 'Replace photo');

  await test.step('the line is still on the sector', async () => {
    await expect
      .poll(async () => (await toposOf()).at(0)?.lines.length)
      .toBe(1);
  });
});

test('deleting a photo names the routes whose lines go with it', async ({
  page
}) => {
  await page.goto(editorPath(region.id, sector.id));
  await page.getByRole('img', { name: 'Photo 1' }).last().hover();
  await thumbAction(page, 'Delete photo').click();

  await expect(page.getByRole('dialog')).toContainText(route.name);

  await confirm(page, 'Delete photo');

  await test.step('the sector is back to having none', async () => {
    await expect.poll(async () => (await toposOf()).length).toBe(0);
    await expect(
      page.getByText('Add a photo to start drawing routes on it.')
    ).toBeVisible();
  });

  await test.step('but the route itself stays in the catalog', async () => {
    const routes = await api.get<Row[]>(`/sectors/${sector.id}/routes`);

    expect(routes.map(({ id }) => id)).toContain(route.id);
  });
});

test('a photo can be cropped to a preset shape before it is sent', async ({
  page
}) => {
  const square = await makeSector(region.id, 'Photos-Cropped-Sector');

  await page.goto(editorPath(region.id, square.id));

  const chooser = page.waitForEvent('filechooser');

  await page.getByRole('button', { name: 'Add photo' }).first().click();
  await (await chooser).setFiles(WALL_WEBP);

  const dialog = page.getByRole('dialog');

  await expect(dialog.getByText('1600×1200').first()).toBeVisible();
  await expect(dialog.getByText(/(\d+)×\1\b/)).toHaveCount(0);

  await test.step('a square preset makes the frame square', async () => {
    await dialog.getByRole('button', { name: 'Crop', exact: true }).click();
    await dialog.getByRole('button', { name: '1:1', exact: true }).click();
    await dialog.getByRole('button', { name: 'Apply' }).click();

    await expect(dialog.getByText(/(\d+)×\1\b/)).toBeVisible();
  });

  await test.step('and what is sent is the cropped photo', async () => {
    await confirm(page, 'Upload');
    await expect(page.getByText('Photo uploaded')).toBeVisible();

    const [topo] = await api.get<{ width: number; height: number }[]>(
      `/sectors/${square.id}/topos`
    );

    expect(topo?.width).toBe(topo?.height);
  });
});
