import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import {
  assertLocalStack,
  authenticatedClient,
  serviceClient
} from '../common/utils/localSupabase';
import { MeService } from '../me/me.service';
import { AdminsService } from './admins.service';

const tokenOf = async (client: SupabaseClient): Promise<string> => {
  const { data } = await client.auth.getSession();

  if (!data.session) throw new Error('The test user has no session');

  return data.session.access_token;
};

const authUserOf = async (): Promise<AuthUser> => {
  const { client, idUser } = await authenticatedClient();

  return { idUser, accessToken: await tokenOf(client) };
};

describe('handing the admin role around', () => {
  const service = new AdminsService();
  let admin: AuthUser;
  let member: AuthUser;

  beforeAll(async () => {
    assertLocalStack();

    admin = await authUserOf();
    member = await authUserOf();

    await serviceClient()
      .from('user_roles')
      .insert({ id_user: admin.idUser, role: 'admin' });
  });

  afterAll(async () => {
    await serviceClient().auth.admin.deleteUser(admin.idUser);
    await serviceClient().auth.admin.deleteUser(member.idUser);
  });

  it('lists an admin with the address that tells them apart', async () => {
    const admins = await service.findAll(admin);
    const me = admins.find((row) => row.idUser === admin.idUser);

    expect(me?.email).toContain('@crag-atlas.test');
  });

  it('grants, says who already has it, and revokes', async () => {
    const [candidate] = await service.search(admin, member.idUser.slice(0, 8));

    expect(candidate).toBeUndefined();

    const granted = await service.grant(admin, [member.idUser]);

    expect(granted.map((row) => row.idUser)).toContain(member.idUser);

    const { data: row } = await serviceClient()
      .from('user_roles')
      .select('id_user_granted_by')
      .eq('id_user', member.idUser)
      .single();

    expect(row?.id_user_granted_by).toBe(admin.idUser);

    await service.grant(admin, [member.idUser]);

    const again = await service.findAll(admin);

    expect(again.filter((row) => row.idUser === member.idUser)).toHaveLength(1);

    await service.revoke(admin, member.idUser);

    const left = await service.findAll(admin);

    expect(left.map((row) => row.idUser)).not.toContain(member.idUser);
  });

  it('still reports the role to each of two admins', async () => {
    const me = new MeService();

    await service.grant(admin, [member.idUser]);

    expect((await me.findMe(admin)).isAdmin).toBe(true);
    expect((await me.findMe(member)).isAdmin).toBe(true);

    await service.revoke(admin, member.idUser);
  });

  it('refuses an admin revoking their own access', async () => {
    await expect(service.revoke(admin, admin.idUser)).rejects.toThrow(
      'An admin cannot revoke their own access'
    );

    const admins = await service.findAll(admin);

    expect(admins.map((row) => row.idUser)).toContain(admin.idUser);
  });

  it('tells a plain member nothing and lets them promote nobody', async () => {
    expect(await service.findAll(member)).toHaveLength(0);
    expect(await service.search(member, 'int-')).toHaveLength(0);

    await expect(service.grant(member, [member.idUser])).rejects.toThrow(
      'Could not grant admin'
    );
  });
});
