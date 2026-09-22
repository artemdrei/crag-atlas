import type { GradeScale, Route } from '@crag-atlas/api';

export type Point = [number, number];

export type PointKind = 'plain' | 'bolt' | 'anchor';

export interface EditableLine {
  idRoute: string;
  points: Point[];
  kinds: PointKind[];
  labelOffset: Point;
  isDirty: boolean;
}

export interface EditableTopo {
  id: string;
  photoUrl: string;
  sortOrder: number;
  width?: number | null;
  height?: number | null;
  lines: Record<string, EditableLine>;
}

export interface RouteDraft {
  id: string;
  name: string;
  grade: string;
  gradeScale: GradeScale;
  type: Route['type'];
  length: string;
  boltsCount: string;
  description: string;
  isNew: boolean;
  isDirty: boolean;
}

export interface TopoEditorSession {
  topos: Record<string, EditableTopo>;
  order: string[];
  routes: Record<string, RouteDraft>;
  routeOrder: string[];
  idActiveTopo?: string;
  idSelectedRoute?: string;
  idSelectedPoint?: number;
  isPreview: boolean;
}

export const EMPTY_SESSION: TopoEditorSession = {
  topos: {},
  order: [],
  routes: {},
  routeOrder: [],
  isPreview: false
};
