import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  addAscent,
  addComment,
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
  expectArchived,
  openTab,
  regionPath,
  routePath
} from '../../fixtures/ui';

/**
 * Archiving takes a row out of the catalog and destroys nothing: the dialog
 * says what leaves with it, the rows below read as archived without a mark of
 * their own, and restoring puts back everything except what was archived
 * separately.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let emptySector: Row;
let sector: Row;
let route: Row;
let routeWithContent: Row;

test.beforeAll(async () => {
  region = await makeRegion('Archive-Region-Parent');
  emptySector = await makeSector(region.id, 'Archive-Sector-Bare');
  sector = await makeSector(region.id, 'Archive-Sector-Full');
  route = await makeRoute(sector.id, 'Archive-Route-Alone');
  routeWithContent = await makeRoute(sector.id, 'Archive-Route-With-Content');

  await addAscent(routeWithContent.id);
  await addComment(routeWithContent.id);
});

test.afterAll(cleanup);

test('a route leaves the catalog with its lines, and comes back whole', async ({
  page
}) => {
  await test.step('archive it from the topo editor', async () => {
    await page.goto(editorPath(region.id, sector.id));
    await card(page, route.name).click();
    await page.getByRole('button', { name: 'Archive route' }).click();

    await expect(
      page.getByText('leaves the catalog for everyone, together with its lines')
    ).toBeVisible();

    await confirm(page, 'Archive route');
  });

  await test.step('it is out of the route list', async () => {
    await expect(card(page, route.name)).toHaveCount(0);
  });

  await test.step('restore it from the archive view', async () => {
    await page.goto(editorPath(region.id, sector.id, true));
    await page.getByRole('button', { name: 'Restore' }).click();

    await expect(
      page.getByText('Nothing archived here — every route is in the catalog.')
    ).toBeVisible();
  });

  await test.step('it is back in the route list', async () => {
    await page.goto(editorPath(region.id, sector.id));
    await expect(page.getByText(route.name)).toBeVisible();
  });
});

test('an archived route keeps everything climbers left on it', async ({
  page
}) => {
  await api.delete(`/routes/${routeWithContent.id}`);
  await page.goto(routePath(region.id, sector.id, routeWithContent.id));

  await expect(page.getByText('This route is in the archive')).toBeVisible();
  await expect(
    page.getByText('climbers left 1 ascent, 1 comment')
  ).toBeVisible();
  await openTab(page, 'Comments');

  await expect(page.getByText('Fixture comment')).toBeVisible();

  await test.step('but it cannot be ticked any more', async () => {
    await expect(page.getByRole('button', { name: /log ascent/i })).toHaveCount(
      0
    );
  });

  await api.post(`/routes/${routeWithContent.id}/restore`);
});

test('the sector dialog says whether routes go with it', async ({ page }) => {
  await test.step('an empty sector takes only itself', async () => {
    await page.goto(regionPath(region.id));
    await card(page, emptySector.name).click();
    await page.getByRole('button', { name: 'Archive sector' }).click();

    await expect(
      page.getByText('is empty, so only the sector itself and its photos')
    ).toBeVisible();

    await confirm(page, 'Archive sector');
  });

  await test.step('a sector with routes says so', async () => {
    await page.goto(regionPath(region.id));
    await card(page, sector.name).click();
    await page.getByRole('button', { name: 'Archive sector' }).click();

    await expect(
      page.getByText(
        'leaves the catalog for everyone, together with its routes'
      )
    ).toBeVisible();

    await confirm(page, 'Archive sector');
  });

  await expectArchived(`/sectors/${emptySector.id}`);
  await expectArchived(`/sectors/${sector.id}`);
  await api.post(`/sectors/${emptySector.id}/restore`);
  await api.post(`/sectors/${sector.id}/restore`);
});

test('the region dialog says whether sectors go with it', async ({ page }) => {
  const lonely = await makeRegion('Archive-Region-Solo');

  await test.step('an empty region takes only itself', async () => {
    await page.goto(catalogPath());
    await card(page, lonely.name).click();
    await page.getByRole('button', { name: 'Archive region' }).click();

    await expect(
      page.getByText('is empty, so only the region itself and its photo')
    ).toBeVisible();

    await confirm(page, 'Archive region');
  });

  await test.step('a region with sectors says so', async () => {
    await page.goto(catalogPath());
    await card(page, region.name).click();
    await page.getByRole('button', { name: 'Archive region' }).click();

    await expect(
      page.getByText('together with its sectors and their routes')
    ).toBeVisible();

    await confirm(page, 'Archive region');
  });

  await expectArchived(`/regions/${region.id}`);
  await api.post(`/regions/${region.id}/restore`);
});

test('a row archived by its ancestor is not offered for erase', async ({
  page
}) => {
  await api.delete(`/regions/${region.id}`);

  await test.step('the archive view lists only rows archived on their own', async () => {
    await page.goto(regionPath(region.id, true));
    await expect(card(page, sector.name)).toHaveCount(0);
  });

  await test.step('the edit list still holds them', async () => {
    await page.goto(regionPath(region.id));
    await expect(card(page, sector.name)).toBeVisible();
  });

  await api.post(`/regions/${region.id}/restore`);
});

test('restoring leaves separately archived rows archived', async ({ page }) => {
  await test.step('archive one route on its own, then its region', async () => {
    await api.delete(`/routes/${route.id}`);
    await api.delete(`/regions/${region.id}`);
  });

  await test.step('restore the region from the archive view', async () => {
    await page.goto(catalogPath(true));
    await card(page, region.name).click();
    await page.getByRole('button', { name: 'Restore' }).click();
  });

  await test.step('its other routes are back', async () => {
    await page.goto(editorPath(region.id, sector.id));
    await expect(page.getByText(routeWithContent.name)).toBeVisible();
    await expect(card(page, route.name)).toHaveCount(0);
  });

  await test.step('the one archived on its own is not', async () => {
    await page.goto(editorPath(region.id, sector.id, true));
    await expect(page.getByText(route.name)).toBeVisible();
  });
});

test('the archive is a view inside editing, never a place of its own', async ({
  page
}) => {
  const flagged = await makeRegion('Archive-Region-Flagged');

  await api.delete(`/regions/${flagged.id}`);

  await test.step('?archive=1 alone shows the catalog', async () => {
    await page.goto('/?archive=1');

    await expect(
      page.getByRole('button', { name: 'Edit', exact: true })
    ).toBeVisible();
    await expect(card(page, flagged.name)).toHaveCount(0);
  });

  await test.step('it takes edit mode to reach the archived region', async () => {
    await page.goto(catalogPath(true));
    await expect(card(page, flagged.name)).toBeVisible();
  });

  await test.step('and closing editing takes the archive with it', async () => {
    await page.getByRole('button', { name: 'Close editing' }).click();

    await expect(page).not.toHaveURL(/edit=1/);
    await expect(page).not.toHaveURL(/archive=1/);
    await expect(card(page, flagged.name)).toHaveCount(0);
  });

  await api.post(`/regions/${flagged.id}/restore`);
});
