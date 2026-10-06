import { expect, test } from '@playwright/test';

import { type Climber, makeClimber } from '../../fixtures/climber';
import { STORAGE_STATE_MEMBER } from '../../setup/storageState';

/**
 * Who may edit the catalog is decided on the Access page, by an admin. The
 * climber granted and stripped of the role here is the spec's own: the
 * member every other spec relies on must stay an ordinary climber.
 */
test.describe.configure({ mode: 'serial' });

let climber: Climber;

test.beforeAll(async () => {
  climber = await makeClimber('Access-Grant');
});

test.afterAll(async () => {
  await climber.remove();
});

test('an admin reaches the Access tab from the header', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Admin', exact: true }).click();

  await expect(page).toHaveURL(/\/admin\/access$/);

  await page.getByRole('tab', { name: 'QR codes' }).click();

  await expect(page).toHaveURL(/\/admin\/qr-codes$/);
});

test('the old Access address still lands on the tab', async ({ page }) => {
  await page.goto('/access');

  await expect(page).toHaveURL(/\/admin\/access$/);
});

test('an admin grants the role and takes it back', async ({ page }) => {
  await page.goto('/admin/access');

  await test.step('the climber is not an admin yet', async () => {
    expect(await climber.status('GET', '/admins')).toBe(403);
  });

  await test.step('they are found and granted the role', async () => {
    await page.getByRole('button', { name: 'Add admin' }).click();

    const dialog = page.getByRole('dialog');

    await dialog
      .getByPlaceholder('Search by name or email')
      .fill(climber.email);
    await dialog
      .getByRole('button', { name: new RegExp(climber.email) })
      .click();
    await expect(dialog.getByText('Selected: 1')).toBeVisible();
    await dialog.getByRole('button', { name: 'Grant access' }).click();
    await expect(dialog).toBeHidden();
  });

  const row = page
    .locator('div')
    .filter({ hasText: climber.email })
    .filter({ has: page.getByRole('button', { name: 'Revoke access' }) })
    .last();

  await test.step('the list and the API agree', async () => {
    await expect(row).toBeVisible();
    await expect.poll(() => climber.status('GET', '/admins')).toBe(200);
  });

  await test.step('and the role is taken back', async () => {
    await row.getByRole('button', { name: 'Revoke access' }).click();

    await expect(page.getByText(climber.email)).toHaveCount(0);
    await expect.poll(() => climber.status('GET', '/admins')).toBe(403);
  });
});

test.describe('a climber who is not an admin', () => {
  test.use({ storageState: STORAGE_STATE_MEMBER });

  test('is turned away from the admin page and never sees it', async ({
    page
  }) => {
    await page.goto('/admin/access');

    await expect(page).not.toHaveURL(/\/admin/);
    await expect(
      page.getByRole('link', { name: 'Admin', exact: true })
    ).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Add admin' })).toHaveCount(
      0
    );
  });
});
