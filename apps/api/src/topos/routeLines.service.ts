import { Injectable } from '@nestjs/common';

import {
  NotFoundException,
  ValidationException
} from '../common/exceptions/app.exception';
import {
  readFailed,
  writeFailed
} from '../common/exceptions/database.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { userClient } from '../common/utils/userClient';
import { publicSupabase } from '../config/supabase.client';
import {
  ROUTE_LINE_COLUMNS,
  type RouteLineRow,
  toRouteLineDto
} from './routeLine.mapper';
import type { RouteLineDto, SaveRouteLineDto } from './topos.types';

const MAX_BOLTS = 60;

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

    await this.assertSameSector(idRoute, idTopo);

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
        { onConflict: 'id_route' }
      )
      .select(ROUTE_LINE_COLUMNS)
      .single<RouteLineRow>();

    if (error) {
      throw writeFailed('Could not save the line', 'LINE_SAVE_FAILED', error);
    }

    return toRouteLineDto(data);
  }

  // The editor only offers photos of the route's own sector, so a mismatch
  // means the call did not come from it.
  private async assertSameSector(
    idRoute: string,
    idTopo: string
  ): Promise<void> {
    const [route, topo] = await Promise.all([
      sectorOf('routes', idRoute, 'route'),
      sectorOf('topos', idTopo, 'photo')
    ]);

    if (route !== topo) {
      throw new ValidationException(
        'A line only lives on a photo of its own sector',
        'LINE_FOREIGN_SECTOR'
      );
    }
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
      throw readFailed(
        'Could not load the line',
        'LINE_READ_FAILED',
        readError
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
      throw writeFailed(
        'Could not delete the line',
        'LINE_DELETE_FAILED',
        error
      );
    }
  }
}

const sectorOf = async (
  table: 'routes' | 'topos',
  id: string,
  label: 'route' | 'photo'
): Promise<string> => {
  const { data, error } = await publicSupabase()
    .from(table)
    .select('id_sector')
    .eq('id', id)
    .maybeSingle<{ id_sector: string }>();

  if (error) {
    throw readFailed(
      `Could not load the ${label}`,
      'LINE_SECTOR_READ_FAILED',
      error
    );
  }

  if (!data) {
    throw new NotFoundException(
      `That ${label} does not exist`,
      'LINE_SECTOR_TARGET_NOT_FOUND'
    );
  }

  return data.id_sector;
};

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
