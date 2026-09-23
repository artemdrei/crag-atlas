import type { GradeScale } from '../common/utils/grade';
import type { RouteLineDto } from './topos.types';

export const ROUTE_LINE_COLUMNS =
  'id_route, id_topo, points, bolts, anchor, label_offset_x, label_offset_y, routes (name, grade, grade_scale, deleted_at)';

export interface RouteLineRow {
  id_route: string;
  id_topo: string;
  points: number[][];
  bolts: number[][];
  anchor: number[] | null;
  label_offset_x: number;
  label_offset_y: number;
  routes: {
    name: string;
    grade: string;
    grade_scale: GradeScale;
    deleted_at: string | null;
  } | null;
}

// A deleted route keeps its line so that undoing the delete would bring the
// drawing back, but the photo must stop showing it the moment the route is
// gone from the catalog.
export const liveRouteLines = (rows: RouteLineRow[]): RouteLineRow[] =>
  rows.filter((row) => !row.routes?.deleted_at);

export const toRouteLineDto = (row: RouteLineRow): RouteLineDto => ({
  idRoute: row.id_route,
  idTopo: row.id_topo,
  routeName: row.routes?.name ?? '',
  grade: row.routes?.grade ?? '',
  gradeScale: row.routes?.grade_scale ?? 'french',
  points: row.points,
  bolts: row.bolts,
  anchor: row.anchor,
  labelOffsetX: row.label_offset_x,
  labelOffsetY: row.label_offset_y
});
