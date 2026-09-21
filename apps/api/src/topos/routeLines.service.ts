import { Injectable } from '@nestjs/common';

import {
  AppException,
  NotFoundException,
  ValidationException
} from '../common/exceptions/app.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import type { GradeScale } from '../common/utils/grade';
import { userClient } from '../common/utils/userClient';
import { publicSupabase } from '../config/supabase.client';
import type { RouteLineDto, SaveRouteLineDto } from './topos.types';

const COLUMNS =
  'id_route, id_topo, points, bolts, anchor, label_offset_x, label_offset_y, routes (name, grade, grade_scale)';

const MAX_BOLTS = 60;

interface RouteLineRow {
  id_route: string;
  id_topo: string;
  points: number[][];
  bolts: number[][] | null;
  anchor: number[] | null;
  label_offset_x: number;
  label_offset_y: number;
  routes: { name: string; grade: string; grade_scale: GradeScale } | null;
}

@Injectable()
export class RouteLinesService {
  async save(
    authUser: AuthUser,
    idRoute: string,
    idTopo: string,
    payload: SaveRouteLineDto
  ): Promise<RouteLineDto> {
    const points = readPoints(payload.points);
    const bolts = (payload.bolts ?? []).map((bolt) => readPoint(bolt, 'bolt'));

    if (bolts.length > MAX_BOLTS) {
      throw new ValidationException(
        `A route takes at most ${MAX_BOLTS} bolts`,
        'LINE_TOO_MANY_BOLTS'
      );
    }

    const anchor = payload.anchor ? readPoint(payload.anchor, 'anchor') : null;

    const { data, error } = await userClient(authUser)
      .from('route_lines')
      .upsert(
        {
          id_route: idRoute,
          id_topo: idTopo,
          points,
          bolts,
          anchor,
          label_offset_x: readOffset(payload.labelOffsetX),
          label_offset_y: readOffset(payload.labelOffsetY)
        },
        { onConflict: 'id_route,id_topo' }
      )
      .select(COLUMNS)
      .single<RouteLineRow>();

    if (error) {
      throw new AppException(
        error.message,
        400,
        error.code ?? 'LINE_SAVE_FAILED'
      );
    }

    return toRouteLineDto(data);
  }

  async remove(
    authUser: AuthUser,
    idRoute: string,
    idTopo: string
  ): Promise<void> {
    const { data, error: readError } = await publicSupabase()
      .from('route_lines')
      .select('id_route')
      .eq('id_route', idRoute)
      .eq('id_topo', idTopo)
      .maybeSingle<{ id_route: string }>();

    if (readError) {
      throw new AppException(
        readError.message,
        500,
        readError.code ?? 'LINE_READ_FAILED'
      );
    }

    if (!data) {
      throw new NotFoundException(
        'This route has no line on that photo',
        'LINE_NOT_FOUND'
      );
    }

    const { error } = await userClient(authUser)
      .from('route_lines')
      .delete()
      .eq('id_route', idRoute)
      .eq('id_topo', idTopo);

    if (error) {
      throw new AppException(
        error.message,
        400,
        error.code ?? 'LINE_DELETE_FAILED'
      );
    }
  }
}

const readPoints = (points: number[][] | undefined): number[][] => {
  if (!Array.isArray(points) || points.length < 2) {
    throw new ValidationException(
      'A line needs at least two points',
      'LINE_TOO_SHORT'
    );
  }

  return points.map((point) => readPoint(point, 'point'));
};

const readPoint = (point: number[], field: string): number[] => {
  const isPair =
    Array.isArray(point) &&
    point.length === 2 &&
    point.every(
      (value) =>
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 1
    );

  if (!isPair) {
    throw new ValidationException(
      `Every ${field} must be an [x, y] pair of 0..1 fractions`,
      'LINE_POINT_INVALID'
    );
  }

  return point;
};

const readOffset = (value: number | undefined): number => {
  if (value === undefined) return 0;

  if (!Number.isFinite(value) || value < -1 || value > 1) {
    throw new ValidationException(
      'A label offset must be between -1 and 1',
      'LINE_OFFSET_INVALID'
    );
  }

  return value;
};

const toRouteLineDto = (row: RouteLineRow): RouteLineDto => ({
  idRoute: row.id_route,
  idTopo: row.id_topo,
  routeName: row.routes?.name ?? '',
  grade: row.routes?.grade ?? '',
  gradeScale: row.routes?.grade_scale ?? 'french',
  points: row.points,
  bolts: row.bolts ?? [],
  anchor: row.anchor,
  labelOffsetX: row.label_offset_x,
  labelOffsetY: row.label_offset_y
});
