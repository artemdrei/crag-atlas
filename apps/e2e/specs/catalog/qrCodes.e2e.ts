import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import { cleanup, makeRegion, makeSector } from '../../fixtures/catalog';
import { readQrPlaques } from '../../fixtures/qrPdf';
import { confirm } from '../../fixtures/ui';
import { env } from '../../setup/env';

/**
 * A plaque on the rock carries a `/q/` address: the admin makes it, checks it
 * opens the sector, and may move it without the plaques already printed
 * going dead.
 */
test.describe.configure({ mode: 'serial' });

interface SectorQr {
  path: string | null;
  oldPaths: string[];
}

let region: Row;
let sector: Row;
let other: Row;

const qrOf = async () => {
  const [row] = await api.get<SectorQr[]>(`/qr-paths?idSector=${sector.id}`);

  if (!row) throw new Error('The sector has no QR row');

  return row;
};

test.beforeAll(async () => {
  region = await makeRegion('QR-Region');
  sector = await makeSector(region.id, 'QR-Sector');
  other = await makeSector(region.id, 'QR-Other');
});

test.afterAll(cleanup);

test('the QR codes wait for a region to be chosen', async ({ page }) => {
  await page.goto('/admin/qr-codes');

  await expect(
    page.getByText('Choose a region to see its sectors and QR codes.')
  ).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);

  await page.getByRole('combobox', { name: 'Region', exact: true }).click();
  await page.getByRole('option', { name: region.name }).click();

  await expect(page).toHaveURL(new RegExp(`region=${region.id}`));
  await expect(
    page.getByRole('row').filter({ hasText: sector.name })
  ).toBeVisible();
});

test('an admin makes a QR code and it opens the sector', async ({ page }) => {
  await page.goto(`/admin/qr-codes?region=${region.id}`);

  const row = page.getByRole('row').filter({ hasText: sector.name });

  await row.getByRole('button', { name: 'Create a QR code' }).click();

  await expect(
    row.getByRole('img', { name: `QR code of ${sector.name}` })
  ).toBeVisible();

  const { path } = await qrOf();

  expect(path).toMatch(/^ua\/[a-z0-9-]+\/[a-z0-9-]+$/);

  await page.route(env.amplitudeUrl, (route) =>
    route.fulfill({ json: { code: 200 } })
  );

  // The SDK batches on a 10 s timer, so the wait has to outlast it.
  const upload = page.waitForRequest(
    (request) =>
      request.url() === env.amplitudeUrl &&
      !!request.postData()?.includes('QR Code Scanned'),
    { timeout: 15_000 }
  );

  await page.goto(`/q/${path}`);

  await expect(page).toHaveURL(
    new RegExp(`/regions/${region.id}/sectors/${sector.id}$`)
  );

  const { events } = (await upload).postDataJSON() as {
    events: { event_type: string; event_properties: Record<string, unknown> }[];
  };

  expect(
    events.find((event) => event.event_type === 'QR Code Scanned')
  ).toMatchObject({
    event_properties: {
      result: 'opened',
      qr_path: path,
      id_sector: sector.id,
      sector_name: sector.name
    }
  });
});

test('a changed address keeps the old plaques working', async ({ page }) => {
  const before = await qrOf();

  await page.goto(`/admin/qr-codes?region=${region.id}`);

  const row = page.getByRole('row').filter({ hasText: sector.name });

  await row.getByLabel('QR address').fill('moved-plaque');
  await row.getByRole('button', { name: 'Change', exact: true }).click();
  await confirm(page, 'Change the address');

  await expect.poll(async () => (await qrOf()).path).toMatch(/moved-plaque$/);

  await page.goto(`/q/${before.path}`);

  await expect(page).toHaveURL(new RegExp(`/sectors/${sector.id}$`));
});

test('the selected plaques download as one PDF', async ({ page }) => {
  await page.goto(`/admin/qr-codes?region=${region.id}`);

  await page.getByRole('checkbox', { name: `Select ${sector.name}` }).check();

  const download = page.waitForEvent('download');

  await page.getByRole('button', { name: /^Download selected/ }).click();

  expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
});

test('every plaque in the PDF scans to its own sector', async ({ page }) => {
  await api.post('/qr-paths', { idSectors: [sector.id, other.id] });
  await page.goto(`/admin/qr-codes?region=${region.id}`);

  const download = page.waitForEvent('download');

  await page.getByRole('button', { name: /^Download all/ }).click();

  const pdf = readFileSync(await (await download).path());
  const [slots = []] = await readQrPlaques(page.context(), pdf);
  const scanned = slots.filter((url): url is string => !!url);

  expect(scanned).toHaveLength(2);

  for (const [idSector, url] of [
    [other.id, scanned.find((one) => one.endsWith('qr-other'))],
    [sector.id, scanned.find((one) => !one.endsWith('qr-other'))]
  ] as const) {
    expect(url).toBeDefined();

    await page.goto(url ?? '');

    await expect(page).toHaveURL(
      new RegExp(`/regions/${region.id}/sectors/${idSector}$`)
    );
  }
});

test('an address nobody made says so', async ({ page }) => {
  await page.goto('/q/ua/no-such-region/no-such-sector');

  await expect(
    page.getByText('This QR code does not lead to a sector.')
  ).toBeVisible();
});
