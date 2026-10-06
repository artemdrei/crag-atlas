import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { assertLocalStack, serviceClient } from '../common/utils/localSupabase';
import type { HorizonService } from '../horizon/horizon.service';
import { SectorsService } from './sectors.service';

// One past `max_rows`, so a single unpaged request would come back short.
const ROUTE_COUNT = 1001;

describe('a region with more routes than one request returns', () => {
  const db = serviceClient();
  const service = new SectorsService({} as HorizonService);
  let idRegion = '';
  const idSectors: string[] = [];

  beforeAll(async () => {
    assertLocalStack();

    const { data: region, error } = await db
      .from('regions')
      .insert({
        name: `INT-Paged-${crypto.randomUUID()}`,
        rock_type: 'Limestone'
      })
      .select('id')
      .single();

    if (error) throw new Error(`regions: ${error.message}`);

    idRegion = region.id;

    const { data: sectors, error: sectorsError } = await db
      .from('sectors')
      .insert([
        { id_region: idRegion, name: 'INT-Paged-A' },
        { id_region: idRegion, name: 'INT-Paged-B' }
      ])
      .select('id');

    if (sectorsError) throw new Error(`sectors: ${sectorsError.message}`);

    idSectors.push(...sectors.map(({ id }) => id));

    const { error: routesError } = await db.from('routes').insert(
      Array.from({ length: ROUTE_COUNT }, (_, index) => ({
        id_sector: idSectors[index % 2],
        // Repeated names, so the pages are told apart by id, not by name.
        name: `INT-Paged-${index % 10}`,
        grade: '6a',
        grade_scale: 'french',
        grade_score: 600,
        type: 'sport'
      }))
    );

    if (routesError) throw new Error(`routes: ${routesError.message}`);
  });

  afterAll(async () => {
    await db.from('regions').delete().eq('id', idRegion);
  });

  it('lists every route once, under its own sector', async () => {
    const sectors = await service.findByRegion(idRegion);
    const ids = sectors.flatMap(({ routes }) => routes.map(({ id }) => id));

    expect(ids).toHaveLength(ROUTE_COUNT);
    expect(new Set(ids).size).toBe(ROUTE_COUNT);
    expect(sectors.map(({ routes }) => routes.length).sort()).toEqual([
      500, 501
    ]);
  });
});
