import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

import { member, PIXEL_WEBP } from '../../fixtures/apiClient';
import { env } from '../../setup/env';
import { STORAGE_STATE_MEMBER } from '../../setup/storageState';

/**
 * The same picture on a phone. A touch screen has no hover, so the two
 * buttons the desktop reveals under the avatar have to be reachable straight
 * away — that, and not the upload itself, is what this spec is for.
 */
test.describe.configure({ mode: 'serial' });

test.use({ storageState: STORAGE_STATE_MEMBER });

const service = () =>
  createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

/**
 * WebKit cannot encode the WebP the upload needs (see the last test), so the
 * picture is put in place the way the API would have — object and row both,
 * since the remove button deletes the one the path names. A URL with nothing
 * behind it would not do: MUI drops an <img> that fails to load and falls
 * back to the initials.
 */
const putAvatar = async (): Promise<string> => {
  const { idUser } = await member.get<{ idUser: string }>('/me');
  const path = `${idUser}/phone-fixture.webp`;
  const client = service();

  const { error: upload } = await client.storage
    .from('avatars')
    .upload(path, await readFile(PIXEL_WEBP), {
      contentType: 'image/webp',
      upsert: true
    });

  if (upload) throw new Error(`Could not store the avatar: ${upload.message}`);

  const url = `${env.supabaseUrl}/storage/v1/object/public/avatars/${path}`;
  const { error } = await client
    .from('users')
    .update({ avatar_url: url, avatar_path: path })
    .eq('id', idUser);

  if (error) throw new Error(`Could not set the avatar: ${error.message}`);

  return url;
};

test.afterAll(async () => {
  await member.delete('/me/photo');
});

test('the photo buttons are reachable without a hover', async ({
  page: phone
}) => {
  const standingIn = await putAvatar();

  await phone.goto('/profile');

  const picker = phone
    .getByRole('button', { name: 'Change your photo' })
    .first();

  await test.step('the picture the API holds is the one shown', async () => {
    await expect(picker.locator('img')).toHaveAttribute('src', standingIn);
  });

  await test.step('both buttons are visible with nothing hovered', async () => {
    await expect(
      phone.getByRole('button', { name: 'Change your photo' }).last()
    ).toBeVisible();
    await expect(
      phone.getByRole('button', { name: 'Remove your photo' })
    ).toBeVisible();
  });

  await test.step('and the trash takes the picture away', async () => {
    await phone.getByRole('button', { name: 'Remove your photo' }).click();

    await expect(picker.locator('img')).toHaveCount(0);
    expect(
      (await member.get<{ avatarUrl: string | null }>('/me')).avatarUrl
    ).toBeNull();
  });
});

/**
 * Safari encodes no WebP: `canvas.toBlob(…, 'image/webp')` and
 * `OffscreenCanvas.convertToBlob({ type: 'image/webp' })` both hand back a
 * PNG, so `imageToWebp` uploads a PNG and the API refuses it. This is not the
 * avatar's bug — every photo upload in the app goes through the same helper —
 * but the avatar is where the suite first walks into it. The day the encoder
 * is replaced, this test starts passing and Playwright reports it.
 */
test.fail(
  'picking a photo is refused on WebKit, which encodes no WebP',
  async ({ page: phone }) => {
    await phone.goto('/profile');
    await phone.getByLabel('Choose a photo').setInputFiles(PIXEL_WEBP);

    await expect(
      phone
        .getByRole('button', { name: /Change your photo|Add a photo/ })
        .first()
        .locator('img')
    ).toBeVisible();
  }
);
