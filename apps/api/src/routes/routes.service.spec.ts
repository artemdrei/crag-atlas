import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundException } from '../common/exceptions/app.exception';
import { RoutesService } from './routes.service';

interface QueryResult {
  data: unknown;
  error: { message: string; code?: string } | null;
}

let result: QueryResult = { data: [], error: null };

// The service talks to Supabase; the stub keeps the test about mapping and
// error handling rather than about the network.
vi.mock('../config/supabase.client', () => ({
  publicSupabase: () => {
    const builder = {
      select: () => builder,
      eq: () => builder,
      order: () => builder,
      returns: () => Promise.resolve(result),
      maybeSingle: () => Promise.resolve(result)
    };

    return { from: () => builder };
  }
}));

const ROUTE_ROW = {
  id: 'mizerna-lohika',
  id_sector: 'bastion',
  name: 'Мізерна логіка',
  grade: '7a',
  type: 'sport',
  length: 20,
  bolts_count: 8,
  description: 'Технічний вихід.',
  sectors: {
    name: 'Бастіон',
    id_region: 'kamianets',
    regions: { name: "Кам'янець-Подільський" }
  }
};

describe('RoutesService', () => {
  const service = new RoutesService();

  beforeEach(() => {
    result = { data: [], error: null };
  });

  describe('findBySector', () => {
    it('maps snake_case rows to the camelCase DTO', async () => {
      result = { data: [ROUTE_ROW], error: null };

      const [route] = await service.findBySector('bastion');

      expect(route).toEqual({
        id: 'mizerna-lohika',
        idSector: 'bastion',
        sectorName: 'Бастіон',
        idRegion: 'kamianets',
        regionName: "Кам'янець-Подільський",
        name: 'Мізерна логіка',
        grade: '7a',
        type: 'sport',
        length: 20,
        boltsCount: 8,
        description: 'Технічний вихід.'
      });
    });

    it('throws NotFoundException when the sector has no routes', async () => {
      await expect(service.findBySector('nope')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findOne', () => {
    it('returns the route with the given id', async () => {
      result = { data: ROUTE_ROW, error: null };

      expect((await service.findOne('mizerna-lohika')).id).toBe(
        'mizerna-lohika'
      );
    });

    it('throws NotFoundException for an unknown route', async () => {
      result = { data: null, error: null };

      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
