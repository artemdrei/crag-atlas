import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import { cleanup, makeRegion, makeSector } from '../../fixtures/catalog';

let region: Row;
let sector: Row;
let path: string;

test.beforeAll(async () => {
  region = await makeRegion('Phone-QR-Region');
  sector = await makeSector(region.id, 'Phone-QR-Sector');

  const [row] = await api.post<{ path: string }[]>('/qr-paths', {
    idSectors: [sector.id]
  });

  if (!row) throw new Error('No QR path was made');

  path = row.path;
});

test.afterAll(cleanup);

test.describe('a climber who scans a plaque', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('lands on the sector without signing in', async ({ page: phone }) => {
    await phone.goto(`/q/${path}`);

    await expect(phone).toHaveURL(
      new RegExp(`/regions/${region.id}/sectors/${sector.id}$`)
    );
  });
});

test('an admin opens the admin page from the profile', async ({
  page: phone
}) => {
  await phone.goto('/profile');
  await phone.getByRole('link', { name: 'Open' }).click();

  await expect(phone).toHaveURL(/\/admin\/access$/);
  await expect(phone.getByRole('button', { name: 'Add admin' })).toBeVisible();

  await phone.goto('/admin/qr-codes');

  await expect(phone).toHaveURL(/\/admin\/access$/);
});
