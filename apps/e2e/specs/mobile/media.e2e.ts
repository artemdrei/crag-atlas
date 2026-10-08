import { expect, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  addLink,
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { routePath, sectorPath } from '../../fixtures/ui';

/**
 * Video and photo on a phone. The form is the same one the desktop dialog
 * carries, but it arrives in a bottom sheet, and the gallery it opens is a
 * modal of its own.
 */
test.describe.configure({ mode: 'serial' });

const YOUTUBE = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

let region: Row;
let sector: Row;
let filmed: Row;

test.beforeAll(async () => {
  region = await makeRegion('Phone-Media-Region');
  sector = await makeSector(region.id, 'Phone-Media-Sector');
  filmed = await makeRoute(sector.id, 'Phone-Media-Route-Filmed');

  await addLink(filmed.id, YOUTUBE);
});

test.afterAll(cleanup);

test('a link is added from a sheet', async ({ page: phone }) => {
  const route = await makeRoute(sector.id, 'Phone-Media-Route-Fresh');

  await phone.goto(routePath(region.id, sector.id, route.id));
  await phone.getByRole('button', { name: 'Add photo or video' }).click();

  await phone
    .getByRole('textbox', { name: 'YouTube link' })
    .fill('https://vimeo.com/123456');

  await expect(phone.getByText('This is not a YouTube link.')).toBeVisible();

  await phone.getByRole('textbox', { name: 'YouTube link' }).fill(YOUTUBE);
  await phone.getByRole('button', { name: 'Add', exact: true }).click();

  await expect(
    phone.getByRole('tab', { name: 'Video and photo (1)' })
  ).toBeVisible();
});

test('the mark in the route list opens the gallery here too', async ({
  page: phone
}) => {
  await phone.goto(sectorPath(region.id, sector.id));

  await phone
    .getByRole('button', { name: 'Video and photo' })
    .filter({ has: phone.getByRole('img', { name: 'Has video' }) })
    .first()
    .click();

  await expect(phone.getByRole('dialog').getByTitle('Video 1')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1'
  );
});
