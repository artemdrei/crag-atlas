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

/**
 * The gallery on a phone: the form arrives in a bottom sheet, and the route is
 * picked on a screen of its own rather than in a list under the link.
 */
test.describe.configure({ mode: 'serial' });

const ID_HELD = uniqueIdYoutube();

let region: Row;
let sector: Row;
let held: Row;
let fresh: Row;

test.beforeAll(async () => {
  region = await makeRegion('Phone-Media-Page-Region');
  sector = await makeSector(region.id, 'Phone-Media-Page-Sector');
  held = await makeRoute(sector.id, 'Phone-Media-Page-Route-Held');
  fresh = await makeRoute(sector.id, 'Phone-Media-Page-Route-Fresh');

  await addLink(held.id, `https://youtu.be/${ID_HELD}`);
});

test.afterAll(cleanup);

// The sheet is react-modal-sheet's own DOM, with no role to reach it by.
const sheet = (phone: Page) => phone.locator('.react-modal-sheet-container');

const commitLink = async (phone: Page, url: string) => {
  const field = phone.getByPlaceholder('YouTube link');

  await field.fill(url);
  await field.press('Enter');
};

test('a climber adds a video from the sheet', async ({ page: phone }) => {
  await phone.goto('/media');
  await phone.getByRole('button', { name: 'Add', exact: true }).click();
  await commitLink(phone, `https://youtu.be/${uniqueIdYoutube()}`);

  await phone.getByRole('button', { name: 'Choose a route' }).click();
  await phone.getByPlaceholder('Search for a route').fill(fresh.name);
  await phone.getByRole('button', { name: new RegExp(fresh.name) }).click();
  await sheet(phone).getByRole('button', { name: 'Add', exact: true }).click();

  await expect(phone).toHaveURL(/\/media\?added=/);
  await expect(
    phone.getByRole('button', { name: `Play ${fresh.name}` })
  ).toBeVisible();
});

test('a video already in the catalog cannot be added twice', async ({
  page: phone
}) => {
  await phone.goto('/media');
  await phone.getByRole('button', { name: 'Add', exact: true }).click();
  await commitLink(phone, `https://youtu.be/${ID_HELD}`);

  await expect(phone.getByRole('alert')).toContainText(held.name);
  await expect(
    sheet(phone).getByRole('button', { name: 'Add', exact: true })
  ).toBeDisabled();
});
