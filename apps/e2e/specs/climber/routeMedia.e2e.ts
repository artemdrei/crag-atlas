import { expect, test } from '@playwright/test';

import { PIXEL_WEBP } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  addLink,
  addPhoto,
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { routePath, sectorPath } from '../../fixtures/ui';

/**
 * Video and photo hung on a route by the climbers themselves: what the form
 * takes, what the list says a route carries, and what the player is pointed
 * at. The link is parsed in the browser — the API takes any http link — so
 * the refusal is the form's, and only a spec can see it.
 */
test.describe.configure({ mode: 'serial' });

const YOUTUBE = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

let region: Row;
let added: Row;
let listed: Row;
let filmed: Row;
let shot: Row;
let bare: Row;

test.beforeAll(async () => {
  region = await makeRegion('Gallery-Region');
  added = await makeSector(region.id, 'Gallery-Sector-Add');
  listed = await makeSector(region.id, 'Gallery-Sector-List');

  filmed = await makeRoute(listed.id, 'Gallery-Route-Filmed');
  shot = await makeRoute(listed.id, 'Gallery-Route-Shot');

  bare = await makeRoute(listed.id, 'Gallery-Route-Bare');

  await addLink(filmed.id, YOUTUBE);
  await addPhoto(shot.id);
});

test.afterAll(cleanup);

test('a climber hangs a link and a photo on a route', async ({ page }) => {
  const route = await makeRoute(added.id, 'Gallery-Route-Fresh');

  await page.goto(routePath(region.id, added.id, route.id));

  await test.step('a host the app cannot play is refused', async () => {
    await page.getByRole('button', { name: 'Add yours' }).click();

    const dialog = page.getByRole('dialog');

    await dialog
      .getByRole('textbox', { name: 'YouTube or Instagram link' })
      .fill('https://vimeo.com/123456');

    await expect(
      dialog.getByText('Only YouTube and Instagram links.')
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Add', exact: true })
    ).toBeDisabled();
  });

  await test.step('a YouTube link goes in', async () => {
    const dialog = page.getByRole('dialog');

    await dialog
      .getByRole('textbox', { name: 'YouTube or Instagram link' })
      .fill(YOUTUBE);
    await dialog.getByRole('button', { name: 'Add', exact: true }).click();

    await expect(
      page.getByRole('tab', { name: 'Video and photo (1)' })
    ).toBeVisible();
  });

  await test.step('and a photo after it', async () => {
    await page.getByRole('button', { name: 'Add yours' }).click();

    const dialog = page.getByRole('dialog');

    // The picker is hidden behind its own button; the label is what names it.
    await dialog.getByLabel('Add photo').setInputFiles(PIXEL_WEBP);

    // One or the other, never both: the link field closes once a file is in.
    await expect(
      dialog.getByRole('textbox', { name: 'YouTube or Instagram link' })
    ).toBeDisabled();

    await dialog.getByRole('button', { name: 'Add', exact: true }).click();

    await expect(
      page.getByRole('tab', { name: 'Video and photo (2)' })
    ).toBeVisible();
  });
});

test('the sector list marks the routes that carry something', async ({
  page
}) => {
  await page.goto(sectorPath(region.id, listed.id));

  await expect(page.getByRole('img', { name: 'Has video' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Has photo' })).toBeVisible();

  // Three routes, two of them with media: the bare one carries no mark.
  await expect(
    page.getByRole('button', { name: 'Video and photo' })
  ).toHaveCount(2);

  await test.step('the mark opens the gallery', async () => {
    await page
      .getByRole('button', { name: 'Video and photo' })
      .filter({ has: page.getByRole('img', { name: 'Has video' }) })
      .click();

    await expect(page.getByRole('dialog')).toBeVisible();
  });

  await test.step('the frame is built from the id, never from the link', async () => {
    await expect(
      page.getByRole('dialog').getByTitle('Video 1')
    ).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1'
    );
  });
});

test.describe('a visitor who has not signed in', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('reads what hangs on the route and is offered no form', async ({
    page
  }) => {
    await page.goto(routePath(region.id, listed.id, filmed.id));

    await expect(
      page.getByRole('tab', { name: 'Video and photo (1)' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add yours' })).toHaveCount(
      0
    );
  });

  test('a route nobody has filmed says so', async ({ page }) => {
    await page.goto(routePath(region.id, listed.id, bare.id));

    await expect(page.getByText('No videos or photos yet.')).toBeVisible();
  });
});
