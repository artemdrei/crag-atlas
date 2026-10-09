import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  assertLocalStack,
  authenticatedClient,
  serviceClient
} from '../common/utils/localSupabase';

describe('repeat ascents', () => {
  const db = serviceClient();
  let climber: SupabaseClient;
  let idUser: string;
  let idRegion: string;
  let idRoute: string;
  const ticks = { attempt: '', first: '', sameDay: '', later: '' };

  const insert = async (table: string, row: object): Promise<string> => {
    const { data, error } = await db
      .from(table)
      .insert(row)
      .select('id')
      .single();

    if (error) throw new Error(`${table}: ${error.message}`);

    return data.id as string;
  };

  const tick = (row: object) =>
    insert('ticks', { id_user: idUser, id_route: idRoute, ...row });

  const firstIds = async () => {
    const { data, error } = await climber
      .from('ticks')
      .select('id')
      .eq('id_route', idRoute)
      .eq('is_repeat', false);

    if (error) throw new Error(error.message);

    return data.map((row) => row.id).sort();
  };

  beforeAll(async () => {
    assertLocalStack();

    ({ client: climber, idUser } = await authenticatedClient());
    idRegion = await insert('regions', {
      name: `INT-Repeats-${crypto.randomUUID()}`,
      rock_type: 'limestone'
    });

    const idSector = await insert('sectors', {
      id_region: idRegion,
      name: 'INT-Sector'
    });

    idRoute = await insert('routes', {
      id_sector: idSector,
      name: 'INT-Route',
      grade: '6a',
      grade_scale: 'french',
      grade_score: 600,
      type: 'sport'
    });

    ticks.attempt = await tick({
      ascent_type: 'attempt',
      climbed_at: '2026-04-01'
    });
    ticks.first = await tick({
      ascent_type: 'redpoint',
      climbed_at: '2026-05-01',
      climbed_at_time: '11:00'
    });
    ticks.sameDay = await tick({
      ascent_type: 'redpoint',
      climbed_at: '2026-05-01',
      climbed_at_time: '15:00'
    });
    ticks.later = await tick({
      ascent_type: 'toprope',
      climbed_at: '2026-06-01'
    });
  });

  afterAll(async () => {
    await db.from('ticks').delete().eq('id_route', idRoute);
    await db.from('regions').delete().eq('id', idRegion);
  });

  it('keeps two ascents of one route on one day', async () => {
    expect(ticks.sameDay).toBeTruthy();
  });

  it('shows everyone the first send and the attempts only', async () => {
    expect(await firstIds()).toEqual([ticks.attempt, ticks.first].sort());
  });

  it('counts the route once in the stats everyone sees', async () => {
    const { data } = await climber
      .from('routes_with_stats')
      .select('ascents_count_total')
      .eq('id', idRoute)
      .single();

    expect(data?.ascents_count_total).toBe(2);
  });

  it('pages the logbook by first sends, with the repeats counted', async () => {
    const { data } = await climber.rpc('tick_page', { id_user: idUser });

    expect(data).toMatchObject({
      total: 2,
      repeats: { [ticks.first]: 2 }
    });
    expect([...data.ids].sort()).toEqual([ticks.attempt, ticks.first].sort());
  });

  it('refuses an onsight logged after the route was sent', async () => {
    const { error } = await climber.from('ticks').insert({
      id_user: idUser,
      id_route: idRoute,
      ascent_type: 'onsight',
      climbed_at: '2026-07-01'
    });

    expect(error?.code).toBe('CA001');
  });

  it('refuses a send that would turn the first onsight into a repeat', async () => {
    await db
      .from('ticks')
      .update({ ascent_type: 'onsight' })
      .eq('id', ticks.first);

    const { error } = await climber.from('ticks').insert({
      id_user: idUser,
      id_route: idRoute,
      ascent_type: 'redpoint',
      climbed_at: '2026-04-15'
    });

    await db
      .from('ticks')
      .update({ ascent_type: 'redpoint' })
      .eq('id', ticks.first);

    expect(error?.code).toBe('CA001');
  });

  it('promotes the next send when the first is deleted', async () => {
    await db.from('ticks').delete().eq('id', ticks.first);

    expect(await firstIds()).toEqual([ticks.attempt, ticks.sameDay].sort());
  });
});
