import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import {
  assertLocalStack,
  authenticatedClient,
  serviceClient
} from '../common/utils/localSupabase';
import type { UploadedPhoto } from '../common/utils/photoStorage';
import { MeService } from './me.service';
import { AVATARS_BUCKET } from './me.types';

// `assertWebp` sniffs the RIFF/WEBP magic and nothing decodes the rest, so a
// header is the whole fixture.
const webp = (): UploadedPhoto => {
  const header = Buffer.from('RIFF\u0000\u0000\u0000\u0000WEBPVP8L', 'ascii');

  return {
    originalname: 'avatar.webp',
    mimetype: 'image/webp',
    size: header.length,
    buffer: header
  };
};

const tokenOf = async (client: SupabaseClient): Promise<string> => {
  const { data } = await client.auth.getSession();

  if (!data.session) throw new Error('The test user has no session');

  return data.session.access_token;
};

const folderOf = async (idUser: string): Promise<string[]> => {
  const { data } = await serviceClient()
    .storage.from(AVATARS_BUCKET)
    .list(idUser);

  return (data ?? []).map(({ name }) => name);
};

describe('an avatar of your own', () => {
  const service = new MeService();
  let authUser: AuthUser;
  let client: SupabaseClient;

  beforeAll(async () => {
    assertLocalStack();

    const signedIn = await authenticatedClient();

    client = signedIn.client;
    authUser = { idUser: signedIn.idUser, accessToken: await tokenOf(client) };
  });

  afterAll(async () => {
    await serviceClient().auth.admin.deleteUser(authUser.idUser);
  });

  it('replaces the picture and leaves no earlier one behind', async () => {
    const first = await service.replacePhoto(authUser, webp());

    expect(first.avatarUrl).toContain(`/${AVATARS_BUCKET}/${authUser.idUser}/`);
    expect(await folderOf(authUser.idUser)).toHaveLength(1);

    const second = await service.replacePhoto(authUser, webp());

    expect(second.avatarUrl).not.toBe(first.avatarUrl);
    expect(await folderOf(authUser.idUser)).toHaveLength(1);
  });

  it('refuses a write into another climber folder', async () => {
    const stranger = await authenticatedClient();

    const { error } = await createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_ANON_KEY ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${await tokenOf(stranger.client)}` }
        },
        auth: { persistSession: false, autoRefreshToken: false }
      }
    )
      .storage.from(AVATARS_BUCKET)
      .upload(`${authUser.idUser}/stolen.webp`, webp().buffer, {
        contentType: 'image/webp'
      });

    expect(error).toBeTruthy();

    await serviceClient().auth.admin.deleteUser(stranger.idUser);
  });

  it('removes the picture and its object', async () => {
    await service.replacePhoto(authUser, webp());
    await service.removePhoto(authUser);

    const me = await service.findMe(authUser);

    expect(me.avatarUrl).toBeNull();
    expect(await folderOf(authUser.idUser)).toHaveLength(0);
  });
});
