import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import {
  assertLocalStack,
  authenticatedClient,
  serviceClient
} from '../common/utils/localSupabase';
import { QrPathsService } from './qrPaths.service';
import type { SectorQrDto } from './qrPaths.types';

const tokenOf = async (client: SupabaseClient): Promise<string> => {
  const { data } = await client.auth.getSession();

  if (!data.session) throw new Error('The test user has no session');

  return data.session.access_token;
};

describe('the paths printed on QR plaques', () => {
  const db = serviceClient();
  const service = new QrPathsService();
  const run = crypto.randomUUID().slice(0, 8);
  let admin: AuthUser;
  let member: AuthUser;
  let idRegion = '';
  let idSector = '';
  let idTwin = '';

  const currentPathOf = async (): Promise<string> => {
    const [row]: (SectorQrDto | undefined)[] = await service.list(admin, {
      idSector
    });

    if (!row?.path) throw new Error('The sector has no QR path');

    return row.path;
  };

  beforeAll(async () => {
    assertLocalStack();

    for (const role of ['admin', 'member'] as const) {
      const { client, idUser } = await authenticatedClient();
      const user = { idUser, accessToken: await tokenOf(client) };

      if (role === 'admin') admin = user;
      else member = user;
    }

    await db
      .from('user_roles')
      .insert({ id_user: admin.idUser, role: 'admin' });

    const { data: region, error } = await db
      .from('regions')
      .insert({ name: `INT QR ${run}`, country: 'UA', rock_type: 'Limestone' })
      .select('id')
      .single();

    if (error) throw new Error(`regions: ${error.message}`);

    idRegion = region.id;

    const { data: sectors, error: sectorsError } = await db
      .from('sectors')
      .insert([
        { id_region: idRegion, name: "Dal'nij Mist" },
        { id_region: idRegion, name: 'Dal’nij  Mist' }
      ])
      .select('id');

    if (sectorsError) throw new Error(`sectors: ${sectorsError.message}`);

    [idSector, idTwin] = sectors.map(({ id }) => id);
  });

  afterAll(async () => {
    await db.from('regions').delete().eq('id', idRegion);
    await db.auth.admin.deleteUser(admin.idUser);
    await db.auth.admin.deleteUser(member.idUser);
  });

  it('gives each sector its own path under the region', async () => {
    const rows = await service.create(admin, [idSector, idTwin]);
    const paths = rows.map(({ path }) => path).sort();

    expect(paths).toEqual([
      `ua/int-qr-${run}/dalnij-mist`,
      `ua/int-qr-${run}/dalnij-mist-2`
    ]);
  });

  it('opens a sector by its path, whatever the case or slashes', async () => {
    const path = await currentPathOf();

    await expect(
      service.resolve(`/${path.toUpperCase()}/`)
    ).resolves.toMatchObject({ idRegion, idSector });
  });

  it('keeps an old path working after the slug changes', async () => {
    const before = await currentPathOf();
    const after = await service.setSlug(admin, idSector, 'big-mist');

    expect(after.path).toBe(`ua/int-qr-${run}/big-mist`);
    expect(after.oldPaths).toEqual([before]);
    await expect(service.resolve(before)).resolves.toMatchObject({
      idSector
    });
  });

  it('refuses a path another sector already has', async () => {
    await expect(
      service.setSlug(admin, idTwin, 'big-mist')
    ).rejects.toMatchObject({ code: 'QR_PATH_TAKEN' });
  });

  it('never lets a written path change or leave on its own', async () => {
    const { error } = await db
      .from('sector_qr_paths')
      .update({ path: `ua/int-qr-${run}/elsewhere` })
      .eq('id_sector', idSector);

    expect(error?.code).toBe('CA002');
  });

  it('lets only an admin write one', async () => {
    await expect(
      service.setSlug(member, idSector, 'mine')
    ).rejects.toBeDefined();
  });
});
