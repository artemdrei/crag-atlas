import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { member, PIXEL_WEBP } from '../../fixtures/apiClient';
import { STORAGE_STATE_MEMBER } from '../../setup/storageState';

test.describe.configure({ mode: 'serial' });

test.use({ storageState: STORAGE_STATE_MEMBER });

const INITIALS = 'EM';

const picker = (page: Page): Locator =>
  page.getByRole('button', { name: /Change your photo|Add a photo/ }).first();

// The tag, not the role: Playwright reads the in-flight spinner's <svg> as
// role "img" too.
const headerAvatar = (page: Page): Locator =>
  page.getByRole('link', { name: 'Profile' }).locator('img');

const profileAvatar = (page: Page): Locator => picker(page).locator('img');

// react-easy-crop reports the crop area only once it has measured the image,
// so Save is waited for rather than clicked blind.
const chooseAndSave = async (page: Page): Promise<void> => {
  await page.getByLabel('Choose a photo').setInputFiles(PIXEL_WEBP);

  const dialog = page.getByRole('dialog');
  const save = dialog.getByRole('button', { name: 'Save' });

  await expect(save).toBeEnabled();
  await save.click();
  await expect(dialog).toHaveCount(0);
};

const srcOf = async (image: Locator): Promise<string> => {
  const src = await image.getAttribute('src');

  if (!src) throw new Error('The avatar carries no src');

  return src;
};

test.afterAll(async () => {
  await member.delete('/me/photo');
});

test('a climber sets, replaces and removes their photo', async ({ page }) => {
  await page.goto('/profile');

  let first = '';

  await test.step('it starts on initials, with nothing to remove', async () => {
    await expect(page.getByText(INITIALS).first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Remove your photo' })
    ).toHaveCount(0);
  });

  await test.step('a chosen photo becomes the avatar', async () => {
    await chooseAndSave(page);

    await expect(profileAvatar(page)).toBeVisible();

    first = await srcOf(profileAvatar(page));

    expect(first).toContain('/avatars/');
  });

  await test.step('the header carries the same picture', async () => {
    await expect(headerAvatar(page)).toHaveAttribute('src', first);
  });

  await test.step('and a reload still finds it', async () => {
    await page.reload();

    await expect(profileAvatar(page)).toHaveAttribute('src', first);
  });

  await test.step('a second photo replaces the first', async () => {
    await chooseAndSave(page);

    await expect(profileAvatar(page)).not.toHaveAttribute('src', first);
  });

  // A public bucket serves its bytes to anyone who ever saw the URL, so the
  // replaced object has to be gone, not just unreferenced.
  await test.step('and the replaced one stops being served', async () => {
    await expect
      .poll(async () => (await page.request.get(first)).status(), {
        timeout: 10_000
      })
      .toBeGreaterThanOrEqual(400);
  });

  await test.step('removing it goes back to initials', async () => {
    await page.getByRole('button', { name: 'Remove your photo' }).click();

    await expect(page.getByText(INITIALS).first()).toBeVisible();
    await expect(profileAvatar(page)).toHaveCount(0);
    await expect(headerAvatar(page)).toHaveCount(0);
  });

  await test.step('and the API agrees there is none', async () => {
    const me = await member.get<{ avatarUrl: string | null }>('/me');

    expect(me.avatarUrl).toBeNull();
  });
});

test('a file that is not an image never reaches the cropper', async ({
  page
}) => {
  await page.goto('/profile');

  await page.getByLabel('Choose a photo').setInputFiles({
    name: 'topo.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4')
  });

  await expect(
    page.getByText('Only an image can be used as a photo')
  ).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  const me = await member.get<{ avatarUrl: string | null }>('/me');

  expect(me.avatarUrl).toBeNull();
});
