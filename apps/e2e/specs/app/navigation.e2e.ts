import { expect, test } from '@playwright/test';

test('a path that does not exist lands on the catalog', async ({ page }) => {
  await page.goto('/');
  await page.goto('/no-such-page');

  await expect(page).toHaveURL('/');

  await test.step('and going back does not walk into it again', async () => {
    await page.goBack();

    await expect(page).toHaveURL('/');
  });
});

test('a deep path that does not exist lands there too', async ({ page }) => {
  await page.goto('/regions/not-a-region/sectors/not-a-sector/nonsense');

  await expect(page).toHaveURL('/');
});

test('someone already signed in is not shown the sign-in screen', async ({
  page
}) => {
  await page.goto('/login');

  await expect(page).toHaveURL('/');
});

test.describe('a visitor who has not signed in', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('still gets the sign-in screen when they ask for it', async ({
    page
  }) => {
    await page.goto('/login');

    await expect(page).toHaveURL('/login');
    await expect(
      page.getByRole('button', { name: 'Continue with Google' })
    ).toBeVisible();
  });
});
