import { expect, test } from '@playwright/test';

import { member } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { routePath } from '../../fixtures/ui';
import { STORAGE_STATE_MEMBER } from '../../setup/storageState';

/**
 * What a climber does at the crag, with a phone in one hand: logging the
 * ascent and writing the beta. Both open a bottom sheet here rather than the
 * dialog the desktop shows, and the sheet is a different component.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;
let page: string;

test.beforeAll(async () => {
  region = await makeRegion('Phone-Climber-Region');
  sector = await makeSector(region.id, 'Phone-Climber-Sector');
  route = await makeRoute(sector.id, 'Phone-Climber-Route');
  page = routePath(region.id, sector.id, route.id);
});

test.afterAll(cleanup);

test('an ascent is logged from a sheet and taken back from one', async ({
  page: phone
}) => {
  await phone.goto(page);

  await test.step('the sheet carries the same form', async () => {
    await phone.getByRole('button', { name: 'Log ascent' }).click();

    await phone
      .getByRole('textbox', { name: 'Comment', exact: true })
      .fill('Sent before the rain');
    await phone
      .getByRole('button', { name: 'Log ascent', exact: true })
      .last()
      .click();
  });

  await test.step('and the ascent is on the route', async () => {
    await expect(phone.getByText('Sent before the rain')).toBeVisible();
  });

  await test.step('the menu is a sheet as well', async () => {
    await phone.getByRole('button', { name: 'Ascent actions' }).click();
    await phone.getByRole('button', { name: 'Delete' }).click();
    await phone
      .getByRole('button', { name: 'Delete', exact: true })
      .last()
      .click();

    await expect(
      phone.getByRole('button', { name: 'Ascent actions' })
    ).toHaveCount(0);
  });
});

test('beta is written and rewritten from the phone', async ({
  page: phone
}) => {
  await phone.goto(page);
  await phone.getByRole('tab', { name: 'Comments' }).click();

  await phone
    .getByRole('textbox', { name: 'Your beta' })
    .fill('Stick clip the first bolt');
  await phone.getByRole('button', { name: 'Post' }).click();

  await expect(phone.getByText('Stick clip the first bolt')).toBeVisible();

  await test.step('editing happens in a sheet', async () => {
    await phone.getByRole('button', { name: 'Comment actions' }).click();
    await phone.getByRole('button', { name: 'Edit' }).click();

    await phone
      .getByRole('textbox', { name: 'Your beta' })
      .last()
      .fill('Stick clip it, the first bolt is high');
    await phone.getByRole('button', { name: 'Save' }).click();

    await expect(
      phone.getByText('Stick clip it, the first bolt is high')
    ).toBeVisible();
  });
});

test('an admin may act on every comment here as well', async ({
  page: phone
}) => {
  await member.post(`/routes/${route.id}/comments`, {
    body: 'Left by another climber'
  });

  await phone.goto(page);
  await phone.getByRole('tab', { name: 'Comments' }).click();

  await expect(phone.getByText('Left by another climber')).toBeVisible();

  // Both carry a menu for an admin: their own to rewrite, the other to remove.
  await expect(
    phone.getByRole('button', { name: 'Comment actions' })
  ).toHaveCount(2);
});

test.describe('as an ordinary climber', () => {
  test.use({ storageState: STORAGE_STATE_MEMBER });

  test('only their own beta carries a menu', async ({ page: phone }) => {
    await phone.goto(page);
    await phone.getByRole('tab', { name: 'Comments' }).click();

    await expect(
      phone.getByRole('button', { name: 'Comment actions' })
    ).toHaveCount(1);
  });
});
