import { Injectable } from '@nestjs/common';

import {
  AppException,
  NotFoundException
} from '../common/exceptions/app.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { userClient } from '../common/utils/userClient';
import { publicSupabase } from '../config/supabase.client';
import type { RouteDto, UpdateRouteDto } from './routes.types';

// Sector and region names ride along for the breadcrumbs — see SectorsService.
const COLUMNS =
  'id, id_sector, name, grade, type, length, bolts_count, rating, ascents_count, onsight_count, votes_soft, votes_neutral, votes_hard, description, sectors (name, id_region, regions (name))';

interface RouteRow {
  id: string;
  id_sector: string;
  name: string;
  grade: string;
  type: RouteDto['type'];
  length: number | null;
  bolts_count: number | null;
  rating: number | null;
  ascents_count: number | null;
  onsight_count: number | null;
  votes_soft: number | null;
  votes_neutral: number | null;
  votes_hard: number | null;
  description: string;
  sectors: {
    name: string;
    id_region: string;
    regions: { name: string } | null;
  } | null;
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

  async update(
    authUser: AuthUser,
    idRoute: string,
    payload: UpdateRouteDto
  ): Promise<RouteDto> {
    const { error } = await userClient(authUser)
      .from('routes')
      .update({
        name: payload.name,
        grade: payload.grade,
        type: payload.type,
        length: payload.length ?? null,
        bolts_count: payload.boltsCount ?? null,
        rating: payload.rating ?? null,
        description: payload.description ?? ''
      })
      .eq('id', idRoute);

    if (error) {
      throw new AppException(
        error.message,
        400,
        error.code ?? 'ROUTE_UPDATE_FAILED'
      );
    }

    return this.findOne(idRoute);
  }
}

const toRouteDto = (row: RouteRow): RouteDto => ({
  id: row.id,
  idSector: row.id_sector,
  sectorName: row.sectors?.name ?? '',
  idRegion: row.sectors?.id_region ?? '',
  regionName: row.sectors?.regions?.name ?? '',
  name: row.name,
  grade: row.grade,
  type: row.type,
  length: row.length,
  boltsCount: row.bolts_count,
  rating: row.rating,
  ascentsCount: row.ascents_count,
  onsightCount: row.onsight_count,
  votesSoft: row.votes_soft,
  votesNeutral: row.votes_neutral,
  votesHard: row.votes_hard,
  description: row.description
});
