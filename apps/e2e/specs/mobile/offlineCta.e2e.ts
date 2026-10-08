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

test.beforeAll(async () => {
  region = await makeRegion('Offline-Cta-Phone-Region');
  const sector = await makeSector(region.id, 'Offline-Cta-Phone-Sector');
  await makeRoute(sector.id, 'Offline-Cta-Phone-Route');
});

test.afterAll(cleanup);

test('the header saves the region from a sheet', async ({ page: phone }) => {
  await phone.goto(`/regions/${region.id}`);
  await waitForServiceWorker(phone);

  const cta = phone.getByRole('button', { name: 'Offline', exact: true });

  await expect(cta).toBeVisible();
  await cta.click();

  await expect(phone.getByText('1 route · 1 sector')).toBeVisible();
  await phone.getByRole('button', { name: 'Download' }).click();

  await expect(phone.getByText(`${region.name} is saved`)).toBeVisible({
    timeout: 30_000
  });
  await phone.getByRole('button', { name: 'Done' }).click();

  await expect(cta).toHaveCount(0);
});
