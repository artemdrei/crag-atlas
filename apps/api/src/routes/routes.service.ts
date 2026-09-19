import { Injectable } from '@nestjs/common';

import {
  AppException,
  NotFoundException
} from '../common/exceptions/app.exception';
import { publicSupabase } from '../config/supabase.client';
import type { RouteDto } from './routes.types';

const COLUMNS =
  'id, id_sector, name, grade, type, length, bolts_count, description';

interface RouteRow {
  id: string;
  id_sector: string;
  name: string;
  grade: string;
  type: RouteDto['type'];
  length: number | null;
  bolts_count: number | null;
  description: string;
}

@Injectable()
export class RoutesService {
  async findBySector(idSector: string): Promise<RouteDto[]> {
    const { data, error } = await publicSupabase()
      .from('routes')
      .select(COLUMNS)
      .eq('id_sector', idSector)
      .order('name')
      .returns<RouteRow[]>();

    if (error) {
      throw new AppException(
        error.message,
        500,
        error.code ?? 'ROUTES_READ_FAILED'
      );
    }

    if (data.length === 0) {
      throw new NotFoundException(
        `No routes found for sector "${idSector}"`,
        'SECTOR_NOT_FOUND'
      );
    }

    return data.map(toRouteDto);
  }

  async findOne(idRoute: string): Promise<RouteDto> {
    const { data, error } = await publicSupabase()
      .from('routes')
      .select(COLUMNS)
      .eq('id', idRoute)
      .maybeSingle<RouteRow>();

    if (error) {
      throw new AppException(
        error.message,
        500,
        error.code ?? 'ROUTE_READ_FAILED'
      );
    }

    if (!data) {
      throw new NotFoundException(
        `Route "${idRoute}" not found`,
        'ROUTE_NOT_FOUND'
      );
    }

    return toRouteDto(data);
  }
}

const toRouteDto = (row: RouteRow): RouteDto => ({
  id: row.id,
  idSector: row.id_sector,
  name: row.name,
  grade: row.grade,
  type: row.type,
  length: row.length ?? 0,
  boltsCount: row.bolts_count ?? 0,
  description: row.description
});
