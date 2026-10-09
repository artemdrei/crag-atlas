import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { countClimberContent } from './climberContent';
import {
  assertLocalStack,
  authenticatedClient,
  serviceClient
} from './localSupabase';

// The bug this guards against counted the whole catalog for every scope, so
// the fixture deliberately puts content OUTSIDE the region under test.
describe('climber_content, scoped', () => {
  const db = serviceClient();
  const ids = { quiet: '', busy: '', busyRoute: '' };
  let caller: SupabaseClient;

  const insert = async (table: string, row: object): Promise<string> => {
    const { data, error } = await db
      .from(table)
      .insert(row)
      .select('id')
      .single();

    if (error) throw new Error(`${table}: ${error.message}`);

    return data.id as string;
  };

  const region = (name: string) =>
    insert('regions', { name, rock_type: 'limestone' });

  beforeAll(async () => {
    assertLocalStack();

    const signedIn = await authenticatedClient();

    caller = signedIn.client;
    ids.quiet = await region(`INT-Quiet-${crypto.randomUUID()}`);
    ids.busy = await region(`INT-Busy-${crypto.randomUUID()}`);

    const sector = await insert('sectors', {
      id_region: ids.busy,
      name: 'INT-Sector'
    });

    ids.busyRoute = await insert('routes', {
      id_sector: sector,
      name: 'INT-Route',
      grade: '6a',
      grade_scale: 'french',
      // Written by the API from sandbag, so a direct insert has to supply it.
      grade_score: 600,
      type: 'sport'
    });

    await db.from('ticks').insert({
      id_user: signedIn.idUser,
      id_route: ids.busyRoute,
      ascent_type: 'redpoint'
    });
  });

  afterAll(async () => {
    await db.from('ticks').delete().eq('id_route', ids.busyRoute);
    await db.from('regions').delete().in('id', [ids.quiet, ids.busy]);
  });

  it('reports nothing for a region nobody has climbed in', async () => {
    expect(
      await countClimberContent(caller, { idRegion: ids.quiet })
    ).toMatchObject({ ascents: 0, comments: 0, media: 0 });
  });

  it('reports the ascent for the region that holds it', async () => {
    expect(
      await countClimberContent(caller, { idRegion: ids.busy })
    ).toMatchObject({ ascents: 1 });
  });
});
