import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import { cleanup, makeRegion, makeSector } from '../../fixtures/catalog';
import { conditionsOf, sectorPath } from '../../fixtures/ui';

/**
 * A sector's conditions and directions on a phone, where the climber is most
 * likely to want them — on the way to the crag.
 */
test.describe.configure({ mode: 'serial' });

// The service worker serves API calls itself, out of `page.route`'s reach.
test.use({ serviceWorkers: 'block' });

let region: Row;
let sector: Row;

test.beforeAll(async () => {
  region = await makeRegion('Phone-Extras-Region');
  sector = await makeSector(region.id, 'Phone-Extras-Sector');

  // A sector is created without a pin and given one in the editor.
  await api.patch(`/sectors/${sector.id}`, {
    name: sector.name,
    lat: 48.68291,
    lng: 26.56402
  });
});

test.afterAll(cleanup);

test('the days ahead and the way there are on the phone', async ({
  page: phone
}) => {
  await phone.route(/\/sectors\/[^/]+\/conditions$/, (request) =>
    request.fulfill({ json: conditionsOf([88, 35]) })
  );
  await phone.goto(sectorPath(region.id, sector.id));

  await expect(
    phone.getByRole('button', { name: /^today \d+ 88$/ })
  ).toBeVisible();

  await phone.getByRole('button', { name: / 35$/ }).click();
  await expect(phone.getByText('Weather by Open-Meteo.com')).toBeVisible();

  await expect(phone.getByRole('link', { name: 'Directions' })).toHaveAttribute(
    'href',
    /destination=48\.68291,26\.56402/
  );
});
