import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  assertLocalStack,
  authenticatedClient,
  serviceClient
} from './localSupabase';

// What the catalog may and may not destroy is decided by the schema, not by a
// service method, so it is asserted against a real database.
describe('archive and erase, at the table level', () => {
  const db = serviceClient();
  const created = { idRegion: '', idSector: '', idRoute: '' };
  let idUser = '';

  const insert = async <T>(table: string, row: object): Promise<T> => {
    const { data, error } = await db
      .from(table)
      .insert(row)
      .select('id')
      .single();

    if (error) throw new Error(`${table}: ${error.message}`);

    return data as T;
  };

  beforeAll(async () => {
    assertLocalStack();
    ({ idUser } = await authenticatedClient());

    const region = await insert<{ id: string }>('regions', {
      name: `INT-${crypto.randomUUID()}`,
      province: 'Test province',
      rock_type: 'Limestone'
    });
    const sector = await insert<{ id: string }>('sectors', {
      id_region: region.id,
      name: 'INT-Sector'
    });
    const route = await insert<{ id: string }>('routes', {
      id_sector: sector.id,
      name: 'INT-Route',
      grade: '6a',
      grade_scale: 'french',
      // Written by the API from sandbag, so a direct insert has to supply it.
      grade_score: 600,
      type: 'sport'
    });

    created.idRegion = region.id;
    created.idSector = sector.id;
    created.idRoute = route.id;
  });

  afterAll(async () => {
    await db.from('ticks').delete().eq('id_route', created.idRoute);
    await db.from('route_comments').delete().eq('id_route', created.idRoute);
    await db.from('route_media').delete().eq('id_route', created.idRoute);
    await db.from('regions').delete().eq('id', created.idRegion);
  });

  it('marks only the row the click was on, and derives the rest', async () => {
    await db
      .from('regions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', created.idRegion);

    const { data } = await db
      .from('sectors_with_stats')
      .select('deleted_at, is_archived')
      .eq('id', created.idSector)
      .single();

    expect(data).toMatchObject({ deleted_at: null, is_archived: true });

    await db
      .from('regions')
      .update({ deleted_at: null })
      .eq('id', created.idRegion);
  });

  it('refuses to delete a route climbers left a comment on', async () => {
    const { error: commentError } = await db.from('route_comments').insert({
      id_route: created.idRoute,
      id_user: idUser,
      body: 'Integration comment'
    });

    expect(commentError).toBeNull();

    const { error } = await db
      .from('routes')
      .delete()
      .eq('id', created.idRoute);

    expect(error?.code).toBe('23503');

    await db.from('route_comments').delete().eq('id_route', created.idRoute);
  });

  it('refuses to delete a route somebody attached a link to', async () => {
    const { error: mediaError } = await db.from('route_media').insert({
      id_route: created.idRoute,
      id_user: idUser,
      kind: 'video',
      url: 'https://example.com/integration-video'
    });

    expect(mediaError).toBeNull();

    const { error } = await db
      .from('routes')
      .delete()
      .eq('id', created.idRoute);

    expect(error?.code).toBe('23503');

    await db.from('route_media').delete().eq('id_route', created.idRoute);
  });

  it('takes the routes of a sector that is deleted for good', async () => {
    const { error } = await db
      .from('sectors')
      .delete()
      .eq('id', created.idSector);

    expect(error).toBeNull();

    const { data } = await db
      .from('routes')
      .select('id')
      .eq('id', created.idRoute);

    expect(data).toEqual([]);
  });
});
