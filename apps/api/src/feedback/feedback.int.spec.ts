import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import {
  assertLocalStack,
  authenticatedClient,
  serviceClient
} from '../common/utils/localSupabase';
import { FeedbackService } from './feedback.service';

const tokenOf = async (client: SupabaseClient): Promise<string> => {
  const { data } = await client.auth.getSession();

  if (!data.session) throw new Error('The test user has no session');

  return data.session.access_token;
};

const authUserOf = async (): Promise<AuthUser> => {
  const { client, idUser } = await authenticatedClient();

  return { idUser, accessToken: await tokenOf(client) };
};

describe('feedback', () => {
  const service = new FeedbackService();
  const db = serviceClient();
  let admin: AuthUser;
  let member: AuthUser;

  beforeAll(async () => {
    assertLocalStack();

    admin = await authUserOf();
    member = await authUserOf();

    await db
      .from('user_roles')
      .insert({ id_user: admin.idUser, role: 'admin' });
  });

  afterAll(async () => {
    await db.from('feedback').delete().eq('platform', 'int-test');
    await db.auth.admin.deleteUser(admin.idUser);
    await db.auth.admin.deleteUser(member.idUser);
  });

  it('takes a guest entry and a member entry', async () => {
    await service.create(
      {
        rating: 3,
        message: 'guest',
        email: 'guest@crag-atlas.test',
        platform: 'int-test'
      },
      null
    );
    await service.create(
      { rating: 5, message: 'member', platform: 'int-test' },
      member,
      'member@crag-atlas.test'
    );

    const { items } = await service.findPage(admin);
    const guest = items.find((row) => row.message === 'guest');
    const own = items.find((row) => row.message === 'member');

    expect(guest).toMatchObject({
      idUser: null,
      email: 'guest@crag-atlas.test'
    });
    expect(own).toMatchObject({
      idUser: member.idUser,
      email: 'member@crag-atlas.test'
    });
  });

  it('shows the list to an admin only', async () => {
    await expect(service.findPage(member)).resolves.toEqual({
      items: [],
      nextCursor: null
    });
  });

  it('lets an admin delete an entry and nobody else', async () => {
    const { items } = await service.findPage(admin);
    const target = items.find((row) => row.message === 'guest');

    if (!target) throw new Error('The guest entry is missing');

    await expect(service.remove(member, target.id)).rejects.toThrow(
      'Feedback not found'
    );
    await service.remove(admin, target.id);

    const { items: left } = await service.findPage(admin);

    expect(left.map((row) => row.id)).not.toContain(target.id);
  });
});
