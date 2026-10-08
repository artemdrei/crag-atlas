import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundException } from '../common/exceptions/app.exception';
import { RoutesService } from './routes.service';

interface QueryResult {
  data: unknown;
  error: { message: string; code?: string } | null;
}

let result: QueryResult = { data: [], error: null };

vi.mock('../config/supabase.client', () => ({
  publicSupabase: () => {
    const builder = {
      select: () => builder,
      eq: () => builder,
      is: () => builder,
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
  grade_scale: 'french',
  type: 'sport',
  length: 20,
  bolts_count: 8,
  description: 'Технічний вихід.',
  is_archived: false,
  deleted_at: null,
  sectors: {
    name: 'Бастіон',
    id_region: 'kamianets',
    lat: 48.6744,
    lng: 26.5809,
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
        sectorLat: 48.6744,
        sectorLng: 26.5809,
        idRegion: 'kamianets',
        regionName: "Кам'янець-Подільський",
        name: 'Мізерна логіка',
        grade: '7a',
        gradeScale: 'french',
        type: 'sport',
        length: 20,
        boltsCount: 8,
        description: 'Технічний вихід.',
        isArchived: false,
        isDeleted: false
      });
    });

    it('returns an empty list when the sector has no routes', async () => {
      await expect(service.findBySector('nope')).resolves.toEqual([]);
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

    it('flags a route archived through its sector, not deleted itself', async () => {
      result = {
        data: { ...ROUTE_ROW, is_archived: true, deleted_at: null },
        error: null
      };

      await expect(service.findOne('mizerna-lohika')).resolves.toMatchObject({
        isArchived: true,
        isDeleted: false
      });
    });

    it('flags a route deleted on its own as both', async () => {
      result = {
        data: {
          ...ROUTE_ROW,
          is_archived: true,
          deleted_at: '2026-09-23T00:00:00Z'
        },
        error: null
      };

      await expect(service.findOne('mizerna-lohika')).resolves.toMatchObject({
        isArchived: true,
        isDeleted: true
      });
    });
  });
});
