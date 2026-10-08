import { expect, test } from '@playwright/test';

import {
  readSignInCode,
  removeAccount,
  signInEmail
} from '../../fixtures/mailbox';

/**
 * The emailed code is the one way in that a test can drive end to end: the
 * local stack keeps the email, and the code in it is what the form expects.
 * Google is an outside page and stays a manual check.
 */
test.use({ storageState: { cookies: [], origins: [] } });

const email = signInEmail('Otp');

test.afterAll(async () => {
  await removeAccount(email);
});

test('a climber signs in with the code from their email', async ({ page }) => {
  await page.goto('/login');

  await test.step('the code is asked for by email', async () => {
    await page.getByPlaceholder('Enter email address').fill(email);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText(`We sent a code to`)).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  await test.step('a wrong code is refused', async () => {
    await page.getByPlaceholder('Enter code').fill('000000');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page.getByText(/invalid/i)).toBeVisible();
    await expect(page.getByPlaceholder('Enter code')).toBeVisible();
  });

  await test.step('the emailed code lets them in', async () => {
    const code = await readSignInCode(email);

    await page.getByPlaceholder('Enter code').fill(code);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page).toHaveURL('/');
  });

  await test.step('and the session survives a reload', async () => {
    await page.goto('/profile');

    await expect(page).toHaveURL('/profile');
    await expect(page.getByText(email)).toBeVisible();
  });
});
