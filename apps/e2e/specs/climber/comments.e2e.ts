import { expect, test } from '@playwright/test';

import { api, member } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { confirm, routePath } from '../../fixtures/ui';
import { STORAGE_STATE_MEMBER } from '../../setup/storageState';

/**
 * Beta written by climbers. A comment belongs to whoever wrote it: only they
 * may change it, an admin may remove it, and nobody else may do either.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;
let page: string;

test.beforeAll(async () => {
  region = await makeRegion('Comments-Region');
  sector = await makeSector(region.id, 'Comments-Sector');
  route = await makeRoute(sector.id, 'Comments-Route');
  page = routePath(region.id, sector.id, route.id);
});

test.afterAll(cleanup);

test('beta is posted, edited and taken back by its author', async ({
  page: browser
}) => {
  await browser.goto(page);

  const composer = browser.getByRole('textbox', { name: 'Your beta' });
  const post = browser.getByRole('button', { name: 'Post' });

  await test.step('an empty box posts nothing', async () => {
    await expect(post).toBeDisabled();
  });

  await test.step('a comment appears once it is posted', async () => {
    await composer.fill('Clip the third bolt from the rest');
    await expect(post).toBeEnabled();
    await post.click();

    await expect(
      browser.getByText('Clip the third bolt from the rest')
    ).toBeVisible();
  });

  await test.step('its author can rewrite it', async () => {
    await browser.getByRole('button', { name: 'Comment actions' }).click();
    await browser.getByRole('menuitem', { name: 'Edit' }).click();

    // Editing happens in a dialog whose field is labelled like the composer
    // below it, so the edit is typed into the dialog, not into the page.
    const dialog = browser.getByRole('dialog');

    await dialog
      .getByRole('textbox', { name: 'Your beta' })
      .fill('Clip the third bolt from the good rest');
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(
      browser.getByText('Clip the third bolt from the good rest')
    ).toBeVisible();
  });

  await test.step('and take it back', async () => {
    await browser.getByRole('button', { name: 'Comment actions' }).click();
    await browser.getByRole('menuitem', { name: 'Delete' }).click();
    await confirm(browser, 'Delete');

    await expect(
      browser.getByRole('button', { name: 'Comment actions' })
    ).toHaveCount(0);
    await expect(
      browser.getByText('Clip the third bolt from the good rest')
    ).toHaveCount(0);
  });
});

test('an admin may remove somebody else’s beta, but not rewrite it', async ({
  page: browser
}) => {
  await member.post(`/routes/${route.id}/comments`, {
    body: 'Sandbagged, bring a long draw'
  });

  await browser.goto(page);
  await browser.getByRole('button', { name: 'Comment actions' }).click();

  await expect(browser.getByRole('menuitem', { name: 'Edit' })).toHaveCount(0);

  await browser.getByRole('menuitem', { name: 'Delete' }).click();
  await confirm(browser, 'Delete');

  await expect(browser.getByText('Sandbagged, bring a long draw')).toHaveCount(
    0
  );
});

test.describe('as an ordinary climber', () => {
  test.use({ storageState: STORAGE_STATE_MEMBER });

  test('only their own beta answers to them', async ({ page: browser }) => {
    await api.post(`/routes/${route.id}/comments`, {
      body: 'Written by the admin'
    });
    await member.post(`/routes/${route.id}/comments`, {
      body: 'Written by the climber'
    });

    await browser.goto(page);

    await expect(browser.getByText('Written by the admin')).toBeVisible();
    await expect(browser.getByText('Written by the climber')).toBeVisible();

    await test.step('one of the two carries a menu', async () => {
      await expect(
        browser.getByRole('button', { name: 'Comment actions' })
      ).toHaveCount(1);
    });

    await test.step('and it is theirs, with Edit in it', async () => {
      await browser.getByRole('button', { name: 'Comment actions' }).click();
      await expect(
        browser.getByRole('menuitem', { name: 'Edit' })
      ).toBeVisible();
    });
  });
});
