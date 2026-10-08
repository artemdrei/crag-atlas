import { expect, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { waitForServiceWorker } from '../../fixtures/serviceWorker';

test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;

test.beforeAll(async () => {
  region = await makeRegion('Offline-Cta-Region');
  sector = await makeSector(region.id, 'Offline-Cta-Sector');
  await makeRoute(sector.id, 'Offline-Cta-Route');
});

test.afterAll(cleanup);

test('on a desktop a region is saved from the profile, not the header', async ({
  page
}) => {
  await page.goto(`/regions/${region.id}/sectors/${sector.id}`);
  await waitForServiceWorker(page);

  await expect(page.getByRole('button', { name: 'Save offline' })).toHaveCount(
    0
  );

  await page.goto('/profile');
  await page.getByRole('button', { name: 'Save a region' }).click();

  const dialog = page.getByRole('dialog');

  await test.step('the dialog asks which region', async () => {
    await dialog
      .getByRole('combobox', { name: 'Region', exact: true })
      .fill(region.name);
    await page.getByRole('option', { name: region.name }).click();
  });

  await test.step('then says what the download holds', async () => {
    await expect(dialog.getByText('1 route · 1 sector')).toBeVisible();
  });

  await test.step('and ends on a success screen', async () => {
    await dialog.getByRole('button', { name: 'Download' }).click();

    await expect(dialog.getByText(`${region.name} is saved`)).toBeVisible({
      timeout: 30_000
    });
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  await test.step('after which the profile lists it', async () => {
    await expect(page.getByRole('link', { name: region.name })).toBeVisible();
  });
});
