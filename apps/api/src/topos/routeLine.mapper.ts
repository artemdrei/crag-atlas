import type { GradeScale } from '../common/utils/grade';
import type { RouteLineDto } from './topos.types';

export const ROUTE_LINE_COLUMNS =
  'id_route, id_topo, points, bolts, anchor, label_offset_x, label_offset_y, routes (name, grade, grade_scale)';

export interface RouteLineRow {
  id_route: string;
  id_topo: string;
  points: number[][];
  bolts: number[][];
  anchor: number[] | null;
  label_offset_x: number;
  label_offset_y: number;
  routes: { name: string; grade: string; grade_scale: GradeScale } | null;
}

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
