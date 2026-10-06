import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { routePath } from '../../fixtures/ui';

/**
 * A route edited from its own page: the editor opens on it, a change is
 * saved for everyone, and leaving with a change unsaved asks first.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('RouteEdit-Region');
  sector = await makeSector(region.id, 'RouteEdit-Sector');
  route = await makeRoute(sector.id, 'RouteEdit-Route');
});

test.afterAll(cleanup);

test('a route is edited from its own page and the change goes live', async ({
  page
}) => {
  await page.goto(routePath(region.id, sector.id, route.id));
  await page.getByRole('button', { name: 'Edit', exact: true }).click();

  await expect(page).toHaveURL(new RegExp(`/routes/${route.id}/edit$`));

  await page.getByRole('textbox', { name: 'Length, m' }).fill('27');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect
    .poll(
      async () =>
        (await api.get<{ length: number | null }>(`/routes/${route.id}`)).length
    )
    .toBe(27);

  await page.getByRole('button', { name: 'Close the editor' }).click();
  await expect(page).toHaveURL(new RegExp(`/routes/${route.id}$`));
  await expect(page.getByText('27 m')).toBeVisible();
});

test('leaving with a change unsaved asks first', async ({ page }) => {
  await page.goto(`${routePath(region.id, sector.id, route.id)}/edit`);

  await page.getByRole('textbox', { name: 'Length, m' }).fill('31');
  await page.getByRole('button', { name: 'Close the editor' }).click();

  const dialog = page.getByRole('dialog', { name: 'Leave without saving?' });

  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep editing' }).click();
  await expect(page).toHaveURL(/\/edit$/);
  await expect(page.getByRole('textbox', { name: 'Length, m' })).toHaveValue(
    '31'
  );

  await page.getByRole('button', { name: 'Close the editor' }).click();
  await page
    .getByRole('dialog', { name: 'Leave without saving?' })
    .getByRole('button', { name: 'Leave' })
    .click();

  await expect(page).toHaveURL(new RegExp(`/routes/${route.id}$`));
  expect(
    (await api.get<{ length: number | null }>(`/routes/${route.id}`)).length
  ).toBe(27);
});

test('a route that has left the sector says so in the editor', async ({
  page
}) => {
  const gone = await makeRoute(sector.id, 'RouteEdit-Route-Gone');

  await api.delete(`/routes/${gone.id}`);
  await page.goto(`${routePath(region.id, sector.id, gone.id)}/edit`);

  await expect(
    page.getByText('This route is not in the sector any more.')
  ).toBeVisible();
});
