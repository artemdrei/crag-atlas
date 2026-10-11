import { expect, type Page, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  addLink,
  cleanup,
  makeRegion,
  makeRoute,
  makeSector,
  uniqueIdYoutube
} from '../../fixtures/catalog';
import { routePath } from '../../fixtures/ui';
import { env } from '../../setup/env';

/**
 * The gallery of every linked video, and the form that adds one from it. The
 * test videos do not exist on YouTube, so no title comes back and no route is
 * ever suggested: the climber always picks it.
 */
test.describe.configure({ mode: 'serial' });

const ID_HELD = uniqueIdYoutube();

let region: Row;
let sector: Row;
let held: Row;
let fresh: Row;

interface UploadedEvent {
  event_type: string;
  event_properties: Record<string, unknown>;
}

test.beforeAll(async () => {
  region = await makeRegion('Media-Page-Region');
  sector = await makeSector(region.id, 'Media-Page-Sector');
  held = await makeRoute(sector.id, 'Media-Page-Route-Held');
  fresh = await makeRoute(sector.id, 'Media-Page-Route-Fresh');

  await addLink(held.id, `https://youtu.be/${ID_HELD}`);
});

test.afterAll(cleanup);

const linkField = (page: Page) =>
  page.getByRole('dialog').getByPlaceholder('YouTube link');

const commitLink = async (page: Page, url: string) => {
  await linkField(page).fill(url);
  await linkField(page).press('Enter');
};

// The SDK batches on a 10 s timer, and a slow preview can push the flow
// across a flush: every upload is collected, not only the one that ends it.
const collectEvents = (page: Page) => {
  const events: UploadedEvent[] = [];

  page.on('request', (request) => {
    if (request.url() !== env.amplitudeUrl) return;

    events.push(
      ...(request.postDataJSON() as { events: UploadedEvent[] }).events
    );
  });

  return events;
};

test('the gallery finds a video by its route and plays it', async ({
  page
}) => {
  await page.goto('/media');
  await page.getByRole('textbox', { name: 'Search videos' }).fill(held.name);

  const card = page.getByRole('button', { name: `Play ${held.name}` });

  await expect(card).toHaveCount(1);
  await card.click();

  await expect(page.locator('iframe')).toHaveAttribute(
    'src',
    `https://www.youtube-nocookie.com/embed/${ID_HELD}?playsinline=1`
  );
});

test('a search nothing answers says so', async ({ page }) => {
  await page.goto(`/media?q=${uniqueIdYoutube()}`);

  await expect(page.getByText('No videos match these filters')).toBeVisible();
});

test('a link that is not YouTube is refused in the form', async ({ page }) => {
  await page.goto('/media');
  await page.getByRole('button', { name: 'Add video' }).click();
  await commitLink(page, 'https://vimeo.com/123456');

  await expect(page.getByText('Only YouTube links for now')).toBeVisible();
});

test('a video already in the catalog leads to its route', async ({ page }) => {
  await page.goto('/media');
  await page.getByRole('button', { name: 'Add video' }).click();
  await commitLink(page, `https://www.youtube.com/watch?v=${ID_HELD}&t=12`);

  const notice = page.getByRole('alert');

  await expect(notice).toContainText(held.name);
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Add', exact: true })
  ).toBeDisabled();

  await notice.getByRole('button', { name: 'Open' }).click();

  await expect(page).toHaveURL(
    new RegExp(`${routePath(region.id, sector.id, held.id)}$`)
  );
});

test('a climber adds a video and lands on it in the gallery', async ({
  page
}) => {
  await page.route(env.amplitudeUrl, (route) =>
    route.fulfill({ json: { code: 200 } })
  );
  const events = collectEvents(page);

  await page.goto('/media');
  await page.getByRole('button', { name: 'Add video' }).click();

  const dialog = page.getByRole('dialog');

  await commitLink(page, `https://youtu.be/${uniqueIdYoutube()}`);
  await dialog.getByPlaceholder('Search for a route').fill(fresh.name);
  await dialog.getByRole('button', { name: new RegExp(fresh.name) }).click();
  await dialog.getByRole('button', { name: 'Add', exact: true }).click();

  await expect(page).toHaveURL(/\/media\?added=/);
  await expect(
    page.getByRole('button', { name: `Play ${fresh.name}` })
  ).toBeVisible();

  await expect
    .poll(() => events.map(({ event_type }) => event_type), {
      timeout: 15_000
    })
    .toContain('Content Created');

  expect(events).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        event_type: 'Dialog Opened',
        event_properties: expect.objectContaining({ dialog: 'video_add' })
      }),
      expect.objectContaining({
        event_type: 'Video Link Checked',
        event_properties: expect.objectContaining({
          result: 'ok',
          has_suggestion: false
        })
      }),
      expect.objectContaining({
        event_type: 'Content Created',
        event_properties: expect.objectContaining({
          content_type: 'media',
          id_route: fresh.id,
          source: 'media',
          route_pick: 'manual'
        })
      })
    ])
  );
  expect(
    events.find(({ event_type }) => event_type === 'Dialog Dismissed')
  ).toBeUndefined();
});

test.describe('a visitor who has not signed in', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('browses the gallery and is sent to sign in to add', async ({
    page
  }) => {
    await page.goto(`/media?q=${encodeURIComponent(held.name)}`);

    await expect(
      page.getByRole('button', { name: `Play ${held.name}` })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Add video' }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
