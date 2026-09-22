import { Injectable } from '@nestjs/common';

import {
  AppException,
  NotFoundException,
  ValidationException
} from '../common/exceptions/app.exception';
import {
  readFailed,
  writeFailed
} from '../common/exceptions/database.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import type { GradeScale } from '../common/utils/grade';
import {
  gradeScore,
  gradeScoreRange,
  isGradeScale,
  isValidGrade
} from '../common/utils/grade';
import { userClient } from '../common/utils/userClient';
import { publicSupabase } from '../config/supabase.client';
import type {
  CreateRouteDto,
  RouteDto,
  RouteFilterQuery,
  UpdateRouteDto
} from './routes.types';
import { ROUTE_TYPES } from './routes.types';

const COLUMNS =
  'id, id_sector, name, grade, grade_scale, type, length, bolts_count, rating, ascents_count, onsight_count, votes_soft, votes_neutral, votes_hard, description, sectors (name, id_region, regions (name))';

interface RouteRow {
  id: string;
  id_sector: string;
  name: string;
  grade: string;
  grade_scale: GradeScale;
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
  async findBySector(
    idSector: string,
    filter: RouteFilterQuery = {}
  ): Promise<RouteDto[]> {
    let query = publicSupabase()
      .from('routes')
      .select(COLUMNS)
      .eq('id_sector', idSector);

    if (filter.type) {
      query = query.eq('type', filter.type);
    }

    const bounds = scoreBounds(filter);

    if (bounds.from !== undefined) {
      query = query.gte('grade_score', bounds.from);
    }

    if (bounds.to !== undefined) {
      query = query.lte('grade_score', bounds.to);
    }

    const { data, error } = await query.order('name').returns<RouteRow[]>();

    if (error) {
      throw readFailed(
        'Could not load the routes',
        'ROUTES_READ_FAILED',
        error
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
      throw readFailed('Could not load the route', 'ROUTE_READ_FAILED', error);
    }

    if (!data) {
      throw new NotFoundException(
        `Route "${idRoute}" not found`,
        'ROUTE_NOT_FOUND'
      );
    }

    return toRouteDto(data);
  }

  async create(
    authUser: AuthUser,
    idSector: string,
    payload: CreateRouteDto
  ): Promise<RouteDto> {
    const name = payload.name?.trim() ?? '';
    const grade = payload.grade?.trim() ?? '';

    if (!name) {
      throw new ValidationException('A name is required', 'ROUTE_NAME_EMPTY');
    }

    if (!grade) {
      throw new ValidationException('A grade is required', 'ROUTE_GRADE_EMPTY');
    }

    if (!ROUTE_TYPES.includes(payload.type)) {
      throw new ValidationException(
        `Unknown route type "${payload.type}"`,
        'ROUTE_TYPE_UNKNOWN'
      );
    }

    const { data, error } = await userClient(authUser)
      .from('routes')
      .insert({
        id_sector: idSector,
        name,
        ...gradeColumns(grade, payload.gradeScale),
        type: payload.type,
        length: payload.length ?? null,
        bolts_count: payload.boltsCount ?? null,
        description: payload.description?.trim() ?? ''
      })
      .select('id')
      .single<{ id: string }>();

    if (error) {
      throw writeFailed(
        'Could not create the route',
        'ROUTE_CREATE_FAILED',
        error
      );
    }

    return this.findOne(data.id);
  }

  async remove(authUser: AuthUser, idRoute: string): Promise<void> {
    // Ticks are other users' logbooks; say so instead of leaking an FK error.
    const { count, error: ticksError } = await publicSupabase()
      .from('ticks')
      .select('id', { count: 'exact', head: true })
      .eq('id_route', idRoute);

    if (ticksError) {
      throw readFailed(
        'Could not check the logged ascents',
        'ROUTE_TICKS_READ_FAILED',
        ticksError
      );
    }

    if (count && count > 0) {
      throw new AppException(
        'This route has logged ascents',
        409,
        'ROUTE_HAS_TICKS',
        { ticksCount: count }
      );
    }

    const { error } = await userClient(authUser)
      .from('routes')
      .delete()
      .eq('id', idRoute);

    if (error) {
      throw writeFailed(
        'Could not delete the route',
        'ROUTE_DELETE_FAILED',
        error
      );
    }
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
        ...gradeColumns(payload.grade?.trim() ?? '', payload.gradeScale),
        type: payload.type,
        length: payload.length ?? null,
        bolts_count: payload.boltsCount ?? null,
        description: payload.description ?? ''
      })
      .eq('id', idRoute);

    if (error) {
      throw writeFailed(
        'Could not save the route',
        'ROUTE_UPDATE_FAILED',
        error
      );
    }

    return this.findOne(idRoute);
  }
}

/**
 * A grade is only meaningful together with its scale, and the sorting key is
 * derived from both — so the three columns are always written as one unit.
 */
const gradeColumns = (
  grade: string,
  scale: unknown
): { grade: string; grade_scale: GradeScale; grade_score: number } => {
  if (!isGradeScale(scale)) {
    throw new ValidationException(
      `Unknown grade scale "${String(scale)}"`,
      'ROUTE_GRADE_SCALE_UNKNOWN'
    );
  }

  if (!isValidGrade(grade, scale)) {
    throw new ValidationException(
      `"${grade}" is not a ${scale} grade`,
      'ROUTE_GRADE_INVALID'
    );
  }

  return {
    grade,
    grade_scale: scale,
    grade_score: gradeScore(grade, scale)
  };
};

/**
 * Each bound widens to the full span of its grade, so a route graded in
 * another system is included whenever it overlaps the requested range.
 */
const scoreBounds = (
  filter: RouteFilterQuery
): { from?: number; to?: number } => {
  const scale = filter.gradeScale;

  if (!scale || (!filter.gradeFrom && !filter.gradeTo)) {
    return {};
  }

  if (!isGradeScale(scale)) {
    throw new ValidationException(
      `Unknown grade scale "${String(scale)}"`,
      'ROUTE_GRADE_SCALE_UNKNOWN'
    );
  }

  const bound = (grade: string | undefined, edge: 0 | 1) => {
    if (!grade) {
      return undefined;
    }

    if (!isValidGrade(grade, scale)) {
      throw new ValidationException(
        `"${grade}" is not a ${scale} grade`,
        'ROUTE_GRADE_INVALID'
      );
    }

    return gradeScoreRange(grade, scale)[edge];
  };

  return {
    from: bound(filter.gradeFrom, 0),
    to: bound(filter.gradeTo, 1)
  };
};

const toRouteDto = (row: RouteRow): RouteDto => ({
  id: row.id,
  idSector: row.id_sector,
  sectorName: row.sectors?.name ?? '',
  idRegion: row.sectors?.id_region ?? '',
  regionName: row.sectors?.regions?.name ?? '',
  name: row.name,
  grade: row.grade,
  gradeScale: row.grade_scale,
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
