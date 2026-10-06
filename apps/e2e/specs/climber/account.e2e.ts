import { expect, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { type Climber, makeClimber, signInAs } from '../../fixtures/climber';
import { routePath } from '../../fixtures/ui';

/**
 * What a climber sets on their own account. The settings live on the server,
 * and signing out ends every session the account has — so the climber here
 * is the spec's own, never one the rest of the suite signs in as.
 */
test.describe.configure({ mode: 'serial' });

signInAs(() => climber);

let climber: Climber;
let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  climber = await makeClimber('Account');
  region = await makeRegion('Account-Region');
  sector = await makeSector(region.id, 'Account-Sector');
  route = await makeRoute(sector.id, 'Account-Route');
});

test.afterAll(async () => {
  await climber.remove();
  await cleanup();
});

test('grades are read in the system the climber picked', async ({ page }) => {
  await test.step('the route starts in French', async () => {
    await page.goto(routePath(region.id, sector.id, route.id));
    await expect(page.getByText('6a', { exact: true }).first()).toBeVisible();
  });

  await test.step('YDS is picked on the profile', async () => {
    await page.goto('/profile');
    await page.getByRole('combobox', { name: 'Grade system — routes' }).click();
    await page.getByRole('option', { name: /\(5\.10a\)/ }).click();
  });

  await test.step('the choice is kept on the account', async () => {
    await page.reload();
    await expect(
      page.getByRole('combobox', { name: 'Grade system — routes' })
    ).toHaveText(/5\.10a/);
  });

  await test.step('and the route reads in it', async () => {
    await page.goto(routePath(region.id, sector.id, route.id));
    await expect(
      page.getByText('5.10a', { exact: true }).first()
    ).toBeVisible();
  });
});

test('signing out leaves a visitor behind', async ({ page }) => {
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(
    page.getByRole('banner').getByRole('link', { name: 'Sign in' })
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole('banner').getByRole('link', { name: 'Sign in' })
  ).toBeVisible();
});
