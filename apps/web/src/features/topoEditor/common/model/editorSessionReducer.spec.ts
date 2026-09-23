import type { Route, Topo } from '@crag-atlas/api';
import { describe, expect, it } from 'vitest';

import type {
  EditableLine,
  EditableTopo,
  RouteDraft,
  TopoEditorSession
} from '../entities';
import { EMPTY_SESSION } from '../entities';
import type { EditorAction } from './editorActions';
import { HISTORY_SKIPPED_ACTIONS } from './editorActions';
import {
  dirtyRouteIds,
  editorSessionReducer,
  hasUnsavedChanges,
  isRouteDirty
} from './editorSessionReducer';

const route = (id: string, name = id): Route =>
  ({
    id,
    idSector: 'sector',
    sectorName: 'Sector',
    idRegion: 'region',
    regionName: 'Region',
    name,
    grade: '7a',
    gradeScale: 'french',
    type: 'sport',
    description: ''
  }) as Route;

const topo = (id: string, points: number[][]): Topo =>
  ({
    id,
    label: id,
    photoUrl: `https://example.test/${id}.webp`,
    sortOrder: 0,
    width: 1600,
    height: 1200,
    lines: [
      {
        idRoute: 'alpha',
        idTopo: id,
        routeName: 'alpha',
        grade: '7a',
        gradeScale: 'french',
        points,
        bolts: [],
        anchor: null,
        labelOffsetX: 0,
        labelOffsetY: 0
      }
    ]
  }) as Topo;

const hydrated = (
  points = [
    [0.2, 0.9],
    [0.2, 0.5],
    [0.2, 0.1]
  ]
) =>
  editorSessionReducer(EMPTY_SESSION, {
    type: 'SESSION_HYDRATED',
    topos: [topo('photo', points)],
    routes: [route('alpha'), route('beta')]
  });

const bare = (id: string): Topo =>
  ({
    id,
    label: id,
    photoUrl: `https://example.test/${id}.webp`,
    sortOrder: 1,
    width: 1600,
    height: 1200,
    lines: []
  }) as Topo;

const twoPhotos = () =>
  editorSessionReducer(EMPTY_SESSION, {
    type: 'SESSION_HYDRATED',
    topos: [
      topo('photo', [
        [0.2, 0.9],
        [0.2, 0.1]
      ]),
      bare('other')
    ],
    routes: [route('alpha'), route('beta')]
  });

const run = (session = hydrated(), ...actions: EditorAction[]) =>
  actions.reduce(editorSessionReducer, session);

// The fixtures below put these in place, so a miss is a broken test rather
// than a case the assertion has to handle.
const topoOf = (session: TopoEditorSession, idTopo = 'photo'): EditableTopo => {
  const topo = session.topos[idTopo];

  if (!topo) throw new Error(`the session has no topo "${idTopo}"`);

  return topo;
};

const lineOf = (
  session: TopoEditorSession,
  idRoute = 'alpha',
  idTopo = 'photo'
): EditableLine => {
  const line = topoOf(session, idTopo).lines[idRoute];

  if (!line) throw new Error(`topo "${idTopo}" has no line for "${idRoute}"`);

  return line;
};

const routeOf = (session: TopoEditorSession, idRoute: string): RouteDraft => {
  const route = session.routes[idRoute];

  if (!route) throw new Error(`the session has no route "${idRoute}"`);

  return route;
};

describe('editorSessionReducer', () => {
  it('selects the first photo on hydration', () => {
    expect(hydrated().idActiveTopo).toBe('photo');
  });

  it('reverses a line stored top-first', () => {
    const session = hydrated([
      [0.2, 0.1],
      [0.2, 0.9]
    ]);

    expect(lineOf(session).points).toEqual([
      [0.2, 0.9],
      [0.2, 0.1]
    ]);
  });

  it('refuses to delete the first or last point', () => {
    const session = run(
      hydrated(),
      { type: 'SELECT_ROUTE', idRoute: 'alpha' },
      { type: 'DELETE_POINT', index: 0 },
      { type: 'DELETE_POINT', index: 2 }
    );

    expect(lineOf(session).points).toHaveLength(3);
  });

  it('deletes an interior point', () => {
    const session = run(
      hydrated(),
      { type: 'SELECT_ROUTE', idRoute: 'alpha' },
      { type: 'DELETE_POINT', index: 1 }
    );

    expect(lineOf(session).points).toEqual([
      [0.2, 0.9],
      [0.2, 0.1]
    ]);
  });

  it('never leaves fewer than two points', () => {
    const session = run(
      hydrated([
        [0.2, 0.9],
        [0.2, 0.1]
      ]),
      { type: 'SELECT_ROUTE', idRoute: 'alpha' },
      { type: 'DELETE_POINT', index: 1 }
    );

    expect(lineOf(session).points).toHaveLength(2);
  });

  it('marks geometry edits dirty and clears them on save', () => {
    const edited = run(
      hydrated(),
      { type: 'SELECT_ROUTE', idRoute: 'alpha' },
      { type: 'SET_POINT_KIND', index: 1, kind: 'bolt' }
    );

    expect(isRouteDirty(edited, 'alpha')).toBe(true);
    expect(dirtyRouteIds(edited)).toEqual(['alpha']);

    const saved = editorSessionReducer(edited, {
      type: 'ROUTE_SAVED',
      idRoute: 'alpha'
    });

    expect(hasUnsavedChanges(saved)).toBe(false);
  });

  it('keeps kinds aligned with points when one is inserted', () => {
    const session = run(
      hydrated(),
      { type: 'SELECT_ROUTE', idRoute: 'alpha' },
      { type: 'SET_POINT_KIND', index: 2, kind: 'anchor' },
      { type: 'INSERT_POINT', index: 1, point: [0.2, 0.75] }
    );

    const line = lineOf(session);

    expect(line.points).toHaveLength(4);
    expect(line.kinds).toEqual(['plain', 'plain', 'plain', 'anchor']);
  });

  it('moves the anchor rather than keeping two', () => {
    const session = run(
      hydrated(),
      { type: 'SELECT_ROUTE', idRoute: 'alpha' },
      { type: 'SET_POINT_KIND', index: 2, kind: 'anchor' },
      { type: 'SET_POINT_KIND', index: 1, kind: 'anchor' }
    );

    expect(lineOf(session).kinds).toEqual(['plain', 'anchor', 'plain']);
  });

  it('appends a point to the top of the line', () => {
    const session = run(
      hydrated(),
      { type: 'SELECT_ROUTE', idRoute: 'alpha' },
      { type: 'APPEND_POINT', point: [0.25, 0.05] }
    );

    const line = lineOf(session);

    expect(line.points[line.points.length - 1]).toEqual([0.25, 0.05]);
    expect(line.kinds).toHaveLength(line.points.length);
  });

  it('marks a field edit dirty', () => {
    const session = editorSessionReducer(hydrated(), {
      type: 'EDIT_ROUTE',
      idRoute: 'beta',
      patch: { name: 'Renamed' }
    });

    expect(routeOf(session, 'beta').name).toBe('Renamed');
    expect(isRouteDirty(session, 'beta')).toBe(true);
  });

  it('leaves geometry untouched when only the selection changes', () => {
    const before = run(hydrated(), { type: 'SELECT_ROUTE', idRoute: 'alpha' });
    const after = run(
      before,

      { type: 'SELECT_POINT', index: 1 }
    );

    expect(after.topos).toBe(before.topos);
  });

  it('restores one route from the server and leaves the others', () => {
    const edited = run(
      hydrated(),
      { type: 'SELECT_ROUTE', idRoute: 'alpha' },
      { type: 'SET_POINT_KIND', index: 1, kind: 'bolt' },
      { type: 'EDIT_ROUTE', idRoute: 'beta', patch: { name: 'Kept' } }
    );

    const reverted = editorSessionReducer(edited, {
      type: 'REVERT_ROUTE',
      idRoute: 'alpha',
      topos: [
        topo('photo', [
          [0.2, 0.9],
          [0.2, 0.5],
          [0.2, 0.1]
        ])
      ],
      routes: [route('alpha'), route('beta')]
    });

    expect(lineOf(reverted).kinds).toEqual(['plain', 'plain', 'plain']);
    expect(routeOf(reverted, 'beta').name).toBe('Kept');
  });

  it('never records a line removal in history', () => {
    expect(HISTORY_SKIPPED_ACTIONS.has('DELETE_LINE')).toBe(true);
    expect(HISTORY_SKIPPED_ACTIONS.has('REMOVE_ROUTE')).toBe(true);
  });

  it('adds a route as a local draft, not a saved one', () => {
    const session = editorSessionReducer(hydrated(), {
      type: 'ADD_ROUTE',
      idDraft: 'draft'
    });

    expect(routeOf(session, 'draft').isNew).toBe(true);
    expect(session.idSelectedRoute).toBe('draft');
    expect(isRouteDirty(session, 'draft')).toBe(true);
  });

  it('moves a draft and its line onto the real id once created', () => {
    const drafted = run(
      hydrated(),
      { type: 'ADD_ROUTE', idDraft: 'draft' },
      { type: 'APPEND_POINT', point: [0.5, 0.9] },
      { type: 'APPEND_POINT', point: [0.5, 0.2] }
    );

    const created = editorSessionReducer(drafted, {
      type: 'ROUTE_CREATED',
      idDraft: 'draft',
      route: route('real', 'Real')
    });

    expect(created.routes.draft).toBeUndefined();
    expect(created.routeOrder).toContain('real');
    expect(created.idSelectedRoute).toBe('real');
    expect(lineOf(created, 'real').points).toHaveLength(2);
    expect(topoOf(created).lines.draft).toBeUndefined();
    expect(isRouteDirty(created, 'real')).toBe(false);
  });

  it('drops a removed route and its lines', () => {
    const session = editorSessionReducer(hydrated(), {
      type: 'REMOVE_ROUTE',
      idRoute: 'alpha'
    });

    expect(session.routes.alpha).toBeUndefined();
    expect(topoOf(session).lines.alpha).toBeUndefined();
    expect(session.routeOrder).toEqual(['beta']);
  });

  it('reorders photos without waiting for the server', () => {
    const session = editorSessionReducer(
      {
        ...hydrated(),
        order: ['a', 'b'],
        topos: {
          a: { id: 'a', photoUrl: '', sortOrder: 0, lines: {} },
          b: { id: 'b', photoUrl: '', sortOrder: 1, lines: {} }
        }
      },
      { type: 'REORDER_TOPOS', order: ['b', 'a'] }
    );

    expect(session.order).toEqual(['b', 'a']);
    expect(topoOf(session, 'b').sortOrder).toBe(0);
    expect(topoOf(session, 'a').sortOrder).toBe(1);
  });

  it('opens the route on the photo it was dropped onto', () => {
    const session = editorSessionReducer(twoPhotos(), {
      type: 'MOVE_LINE',
      idRoute: 'alpha',
      idTopo: 'other'
    });

    expect(session.idActiveTopo).toBe('other');
    expect(session.idSelectedRoute).toBe('alpha');
    expect(topoOf(session, 'photo').lines.alpha).toBeUndefined();
    expect(lineOf(session, 'alpha', 'other').isDirty).toBe(true);
  });

  it('leaves the session alone when the line is dropped back where it was', () => {
    const before = twoPhotos();

    const session = editorSessionReducer(before, {
      type: 'MOVE_LINE',
      idRoute: 'alpha',
      idTopo: 'photo'
    });

    expect(session).toBe(before);
  });

  it('keeps unsaved lines when photos are refetched', () => {
    const edited = run(
      hydrated(),
      { type: 'SELECT_ROUTE', idRoute: 'alpha' },
      { type: 'SET_POINT_KIND', index: 1, kind: 'bolt' }
    );

    const refetched = editorSessionReducer(edited, {
      type: 'TOPOS_REPLACED',
      topos: [
        topo('photo', [
          [0.2, 0.9],
          [0.2, 0.1]
        ])
      ]
    });

    expect(lineOf(refetched).kinds[1]).toBe('bolt');
  });

  it('takes a restored route into the session without touching the rest', () => {
    const edited = run(
      hydrated(),
      { type: 'SELECT_ROUTE', idRoute: 'alpha' },
      { type: 'EDIT_ROUTE', idRoute: 'alpha', patch: { name: 'Renamed' } }
    );

    const withRestored = editorSessionReducer(edited, {
      type: 'ROUTE_RESTORED',
      route: route('gamma')
    });

    expect(withRestored.routes.gamma?.name).toBe('gamma');
    expect(withRestored.routeOrder).toContain('gamma');
    expect(withRestored.routes.alpha?.name).toBe('Renamed');
  });

  it('does not add a restored route to the order twice', () => {
    const once = editorSessionReducer(hydrated(), {
      type: 'ROUTE_RESTORED',
      route: route('alpha')
    });

    expect(once.routeOrder.filter((id) => id === 'alpha')).toHaveLength(1);
  });
});
