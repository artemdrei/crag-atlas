import { Injectable } from '@nestjs/common';

import type { ClimberContentDto } from '../common/dto/climberContent.dto';
import {
  NotFoundException,
  ValidationException
} from '../common/exceptions/app.exception';
import {
  readFailed,
  writeFailed
} from '../common/exceptions/database.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import type { ArchiveTarget } from '../common/utils/archive';
import {
  archiveRow,
  eraseArchivedRow,
  restoreRow
} from '../common/utils/archive';
import { countClimberContent } from '../common/utils/climberContent';
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
  'id, id_sector, name, grade, grade_scale, type, length, bolts_count, rating, rating_votes, ascents_count_total, onsight_count_total, votes_soft_total, votes_neutral_total, votes_hard_total, has_photo, has_video, description, is_archived, deleted_at, sectors (name, id_region, regions (name))';

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
  rating_votes: number | null;
  ascents_count_total: number | null;
  onsight_count_total: number | null;
  votes_soft_total: number | null;
  votes_neutral_total: number | null;
  votes_hard_total: number | null;
  has_photo: boolean;
  has_video: boolean;
  description: string;
  is_archived: boolean;
  deleted_at: string | null;
  sectors: {
    name: string;
    id_region: string;
    regions: { name: string } | null;
  } | null;
}

const TARGET: ArchiveTarget = {
  table: 'routes',
  entity: 'ROUTE',
  noun: 'route'
};

@Injectable()
export class RoutesService {
  async findBySector(
    idSector: string,
    filter: RouteFilterQuery = {},
    isArchiveOnly = false
  ): Promise<RouteDto[]> {
    let query = publicSupabase()
      .from('routes_with_stats')
      .select(COLUMNS)
      .eq('id_sector', idSector);

    // Own mark either way: an archived sector's page still lists its routes,
    // and its archive holds the routes deleted from it.
    query = isArchiveOnly
      ? query.not('deleted_at', 'is', null)
      : query.is('deleted_at', null);

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
      .from('routes_with_stats')
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

  async climberContent(idRoute: string): Promise<ClimberContentDto> {
    return countClimberContent(publicSupabase(), { idRoute });
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
  async remove(authUser: AuthUser, idRoute: string): Promise<void> {
    return archiveRow(userClient(authUser), TARGET, idRoute);
  }

  async restore(authUser: AuthUser, idRoute: string): Promise<RouteDto> {
    await restoreRow(userClient(authUser), TARGET, idRoute);

    return this.findOne(idRoute);
  }

  async purge(authUser: AuthUser, idRoute: string): Promise<void> {
    return eraseArchivedRow(userClient(authUser), TARGET, idRoute);
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
  ratingVotes: row.rating_votes,
  ascentsCount: row.ascents_count_total,
  onsightCount: row.onsight_count_total,
  votesSoft: row.votes_soft_total,
  votesNeutral: row.votes_neutral_total,
  votesHard: row.votes_hard_total,
  hasPhoto: row.has_photo,
  hasVideo: row.has_video,
  description: row.description,
  isArchived: row.is_archived,
  isDeleted: !!row.deleted_at
});
