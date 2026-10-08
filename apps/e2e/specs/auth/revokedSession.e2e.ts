import { expect, test } from '@playwright/test';

import { type Climber, makeClimber, signInAs } from '../../fixtures/climber';

/**
 * A session the server no longer accepts still sits in the browser's storage
 * until it expires. The app must drop it on the first 401 instead of asking
 * for `/me` again on every page, which is what once kept the API busy.
 */
let climber: Climber;

test.beforeAll(async () => {
  climber = await makeClimber('Revoked');
  // Deleting the account is the one revocation the API's token check sees at
  // once; an admin sign-out only ends the refresh token.
  await climber.remove();
});

signInAs(() => climber);

test('a revoked session is dropped after one rejected request', async ({
  page
}) => {
  const meRequests: string[] = [];

  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/me')
      meRequests.push(request.url());
  });

  await page.goto('/profile');

  const signIn = page.getByRole('main').getByRole('link', { name: 'Sign in' });

  await test.step('the members-only page offers to sign in', async () => {
    await expect(signIn).toBeVisible();
  });

  await test.step('the stored session is gone', async () => {
    await expect
      .poll(() =>
        page.evaluate(() =>
          Object.keys(localStorage).some((key) => key.endsWith('-auth-token'))
        )
      )
      .toBe(false);
  });

  await test.step('and moving around does not ask again', async () => {
    const asked = meRequests.length;

    await page.goto('/');
    await page.goto('/profile');

    await expect(signIn).toBeVisible();
    expect(meRequests.length).toBe(asked);
    expect(asked).toBe(1);
  });
});
