import { expect, test } from '@playwright/test';

test('a path that does not exist lands on the catalog', async ({
  page: phone
}) => {
  await phone.goto('/no-such-page');

  await expect(phone).toHaveURL('/');
});

test('someone already signed in is not shown the sign-in screen', async ({
  page: phone
}) => {
  await phone.goto('/login');

  await expect(phone).toHaveURL('/');
});

test.describe('a visitor who has not signed in', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('still gets the sign-in screen when they ask for it', async ({
    page: phone
  }) => {
    await phone.goto('/login');

    await expect(phone).toHaveURL('/login');
    await expect(
      phone.getByRole('button', { name: 'Continue with Google' })
    ).toBeVisible();
  });
});
