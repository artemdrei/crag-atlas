import type { Route, Topo } from '@crag-atlas/api';

import type { Point, PointKind, RouteDraft } from '../entities';

export type EditorAction =
  | { type: 'SESSION_HYDRATED'; topos: Topo[]; routes: Route[] }
  | { type: 'SELECT_TOPO'; idTopo: string }
  | { type: 'SELECT_ROUTE'; idRoute?: string }
  | { type: 'SELECT_POINT'; index?: number }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'MOVE_POINT'; index: number; point: Point }
  | { type: 'INSERT_POINT'; index: number; point: Point }
  | { type: 'DELETE_POINT'; index: number }
  | { type: 'APPEND_POINT'; point: Point }
  | { type: 'SET_POINT_KIND'; index: number; kind: PointKind }
  | { type: 'MOVE_LABEL'; offset: Point }
  | { type: 'DELETE_LINE' }
  | { type: 'MOVE_LINE'; idRoute: string; idTopo: string }
  | { type: 'EDIT_ROUTE'; idRoute: string; patch: Partial<RouteDraft> }
  | { type: 'ADD_ROUTE'; idDraft: string }
  | { type: 'ROUTE_CREATED'; idDraft: string; route: Route }
  | { type: 'REMOVE_ROUTE'; idRoute: string }
  | { type: 'ROUTE_RESTORED'; route: Route }
  | { type: 'REVERT_ROUTE'; idRoute: string; topos: Topo[]; routes: Route[] }
  | { type: 'ROUTE_SAVED'; idRoute: string }
  | { type: 'TOPOS_REPLACED'; topos: Topo[] }
  | { type: 'REORDER_TOPOS'; order: string[] };

// Undo rewinds what was drawn, never a selection, a drag frame or a save.
export const HISTORY_SKIPPED_ACTIONS = new Set<EditorAction['type']>([
  'SESSION_HYDRATED',
  'SELECT_TOPO',
  'SELECT_ROUTE',
  'SELECT_POINT',
  'TOGGLE_PREVIEW',
  'MOVE_POINT',
  'MOVE_LABEL',
  'ROUTE_SAVED',
  'TOPOS_REPLACED',
  'REORDER_TOPOS',
  'ROUTE_CREATED',
  'DELETE_LINE',
  'REMOVE_ROUTE',
  'ROUTE_RESTORED'
]);
