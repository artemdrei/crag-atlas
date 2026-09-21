import type { Route, Topo } from '@crag-atlas/api';

import { normalizeLineDirection } from '@web/features/topo';

import type {
  EditableLine,
  EditableTopo,
  Point,
  RouteDraft,
  TopoEditorSession
} from '../entities';
import { EMPTY_SESSION } from '../entities';
import { normalizePoint, toPointKinds } from '../lib';
import type { EditorAction } from './editorActions';

const MIN_POINTS = 2;

const clampOffset = (value: number): number =>
  Math.round(Math.min(1, Math.max(-1, value)) * 1e5) / 1e5;

export const editorSessionReducer = (
  session: TopoEditorSession,
  action: EditorAction
): TopoEditorSession => {
  switch (action.type) {
    case 'SESSION_HYDRATED':
      return hydrate(action.topos, action.routes, session);

    case 'TOPOS_REPLACED':
      return replaceTopos(session, action.topos);

    // Applied before the request: waiting for it makes the photo snap back.
    case 'REORDER_TOPOS':
      return {
        ...session,
        order: action.order,
        topos: Object.fromEntries(
          action.order.map((id, sortOrder) => [
            id,
            { ...session.topos[id], sortOrder }
          ])
        )
      };

    case 'SELECT_TOPO':
      return { ...session, idActiveTopo: action.idTopo, ...noSelection };

    case 'SELECT_ROUTE':
      return { ...session, idSelectedRoute: action.idRoute, ...noSelection };

    case 'SELECT_POINT':
      return { ...session, idSelectedPoint: action.index };

    case 'TOGGLE_PREVIEW':
      return { ...session, isPreview: !session.isPreview, ...noSelection };

    case 'MOVE_POINT':
      return withLine(session, (line) => ({
        ...line,
        points: line.points.map((point, index) =>
          index === action.index ? normalizePoint(action.point) : point
        )
      }));

    case 'INSERT_POINT':
      return withLine(session, (line) => ({
        ...line,
        points: insertAt(
          line.points,
          action.index,
          normalizePoint(action.point)
        ),
        kinds: insertAt(line.kinds, action.index, 'plain')
      }));

    case 'APPEND_POINT':
      return withLine(session, (line) => ({
        ...line,
        points: [...line.points, normalizePoint(action.point)],
        kinds: [...line.kinds, 'plain']
      }));

    case 'SET_POINT_KIND':
      return withLine(session, (line) => ({
        ...line,
        kinds: line.kinds.map((kind, index) => {
          if (action.kind === 'anchor' && kind === 'anchor') return 'plain';

          return index === action.index ? action.kind : kind;
        })
      }));

    case 'DELETE_POINT':
      return withLine(session, (line) => {
        // The ends anchor the badge and the top; both refusals are silent.
        const isEnd =
          action.index === 0 || action.index === line.points.length - 1;

        if (isEnd || line.points.length <= MIN_POINTS) return line;

        return {
          ...line,
          points: line.points.filter((_, index) => index !== action.index),
          kinds: line.kinds.filter((_, index) => index !== action.index)
        };
      });

    case 'MOVE_LABEL':
      return withLine(session, (line) => ({
        ...line,
        labelOffset: [
          clampOffset(action.offset[0]),
          clampOffset(action.offset[1])
        ]
      }));

    case 'DELETE_LINE':
      return withTopo(session, (topo) => {
        const { [session.idSelectedRoute ?? '']: _dropped, ...lines } =
          topo.lines;

        return { ...topo, lines };
      });

    case 'EDIT_ROUTE':
      return {
        ...session,
        routes: {
          ...session.routes,
          [action.idRoute]: {
            ...session.routes[action.idRoute],
            ...action.patch,
            isDirty: true
          }
        }
      };

    case 'ADD_ROUTE':
      return {
        ...session,
        routes: {
          ...session.routes,
          [action.idDraft]: {
            id: action.idDraft,
            name: '',
            grade: '',
            gradeScale: 'french',
            type: 'sport',
            length: '',
            boltsCount: '',
            description: '',
            isNew: true,
            isDirty: true
          }
        },
        routeOrder: [...session.routeOrder, action.idDraft],
        idSelectedRoute: action.idDraft
      };

    case 'ROUTE_CREATED':
      return renameRoute(session, action.idDraft, action.route);

    case 'REMOVE_ROUTE':
      return removeRoute(session, action.idRoute);

    case 'REVERT_ROUTE': {
      const server = hydrate(action.topos, action.routes, session);

      return restoreRoute(session, server, action.idRoute);
    }

    case 'ROUTE_SAVED':
      return markSaved(session, action.idRoute);

    default:
      return session;
  }
};

const noSelection = { idSelectedPoint: undefined } as const;

const insertAt = <T>(items: T[], index: number, item: T): T[] => [
  ...items.slice(0, index),
  item,
  ...items.slice(index)
];

const hydrate = (
  topos: Topo[],
  routes: Route[],
  session: TopoEditorSession
): TopoEditorSession => ({
  ...EMPTY_SESSION,
  topos: Object.fromEntries(
    topos.map((topo) => [topo.id, toEditableTopo(topo)])
  ),
  order: topos.map((topo) => topo.id),
  routes: Object.fromEntries(
    routes.map((route) => [route.id, toRouteDraft(route)])
  ),
  routeOrder: routes.map((route) => route.id),
  idActiveTopo: session.idActiveTopo ?? topos[0]?.id,
  idSelectedRoute: session.idSelectedRoute,
  isPreview: session.isPreview
});

/** Server metadata wins, but lines not saved yet survive the refetch. */
const replaceTopos = (
  session: TopoEditorSession,
  topos: Topo[]
): TopoEditorSession => {
  const merged = topos.map((topo) => {
    const current = session.topos[topo.id];
    const fresh = toEditableTopo(topo);

    if (!current) return fresh;

    const dirty = Object.values(current.lines).filter((line) => line.isDirty);

    return {
      ...fresh,
      lines: {
        ...fresh.lines,
        ...Object.fromEntries(dirty.map((line) => [line.idRoute, line]))
      }
    };
  });

  return {
    ...session,
    topos: Object.fromEntries(merged.map((topo) => [topo.id, topo])),
    order: merged.map((topo) => topo.id),
    idActiveTopo:
      session.idActiveTopo &&
      merged.some(({ id }) => id === session.idActiveTopo)
        ? session.idActiveTopo
        : merged[0]?.id
  };
};

const toEditableTopo = (topo: Topo): EditableTopo => ({
  id: topo.id,
  label: topo.label,
  photoUrl: topo.photoUrl,
  sortOrder: topo.sortOrder,
  width: topo.width,
  height: topo.height,
  lines: Object.fromEntries(
    topo.lines.map((line) => [line.idRoute, toEditableLine(line)])
  )
});

const toEditableLine = (line: Topo['lines'][number]): EditableLine => {
  const points = normalizeLineDirection(line.points) as Point[];

  return {
    idRoute: line.idRoute,
    points,
    kinds: toPointKinds(points, line.bolts, line.anchor ?? null),
    labelOffset: [line.labelOffsetX, line.labelOffsetY],
    isDirty: false
  };
};

const toRouteDraft = (route: Route): RouteDraft => ({
  id: route.id,
  name: route.name,
  grade: route.grade,
  gradeScale: route.gradeScale,
  type: route.type,
  length: route.length?.toString() ?? '',
  boltsCount: route.boltsCount?.toString() ?? '',
  description: route.description ?? '',
  isNew: false,
  isDirty: false
});

const withLine = (
  session: TopoEditorSession,
  change: (line: EditableLine) => EditableLine
): TopoEditorSession =>
  withTopo(session, (topo) => {
    const idRoute = session.idSelectedRoute;

    if (!idRoute) return topo;

    const current: EditableLine = topo.lines[idRoute] ?? {
      idRoute,
      points: [],
      kinds: [],
      labelOffset: [0, 0],
      isDirty: false
    };

    return {
      ...topo,
      lines: { ...topo.lines, [idRoute]: { ...change(current), isDirty: true } }
    };
  });

const withTopo = (
  session: TopoEditorSession,
  change: (topo: EditableTopo) => EditableTopo
): TopoEditorSession => {
  const topo = session.idActiveTopo
    ? session.topos[session.idActiveTopo]
    : undefined;

  if (!topo) return session;

  return {
    ...session,
    topos: { ...session.topos, [topo.id]: change(topo) }
  };
};

const removeRoute = (
  session: TopoEditorSession,
  idRoute: string
): TopoEditorSession => {
  const { [idRoute]: _dropped, ...routes } = session.routes;

  return {
    ...session,
    routes,
    routeOrder: session.routeOrder.filter((id) => id !== idRoute),
    topos: Object.fromEntries(
      Object.entries(session.topos).map(([id, topo]) => {
        const { [idRoute]: _line, ...lines } = topo.lines;

        return [id, { ...topo, lines }];
      })
    ),
    idSelectedRoute:
      session.idSelectedRoute === idRoute ? undefined : session.idSelectedRoute
  };
};

const restoreRoute = (
  session: TopoEditorSession,
  server: TopoEditorSession,
  idRoute: string
): TopoEditorSession => ({
  ...session,
  routes: { ...session.routes, [idRoute]: server.routes[idRoute] },
  topos: Object.fromEntries(
    Object.entries(session.topos).map(([id, topo]) => {
      const serverLine = server.topos[id]?.lines[idRoute];
      const { [idRoute]: _line, ...lines } = topo.lines;

      return [
        id,
        {
          ...topo,
          lines: serverLine ? { ...lines, [idRoute]: serverLine } : lines
        }
      ];
    })
  )
});

const renameRoute = (
  session: TopoEditorSession,
  idDraft: string,
  route: Route
): TopoEditorSession => {
  const { [idDraft]: _draft, ...routes } = session.routes;

  return {
    ...session,
    routes: { ...routes, [route.id]: toRouteDraft(route) },
    routeOrder: session.routeOrder.map((id) =>
      id === idDraft ? route.id : id
    ),
    topos: Object.fromEntries(
      Object.entries(session.topos).map(([id, topo]) => {
        const line = topo.lines[idDraft];
        const { [idDraft]: _line, ...lines } = topo.lines;

        return [
          id,
          {
            ...topo,
            lines: line
              ? {
                  ...lines,
                  [route.id]: { ...line, idRoute: route.id, isDirty: false }
                }
              : lines
          }
        ];
      })
    ),
    idSelectedRoute:
      session.idSelectedRoute === idDraft ? route.id : session.idSelectedRoute
  };
};

const markSaved = (
  session: TopoEditorSession,
  idRoute: string
): TopoEditorSession => ({
  ...session,
  routes: {
    ...session.routes,
    [idRoute]: { ...session.routes[idRoute], isDirty: false }
  },
  topos: Object.fromEntries(
    Object.entries(session.topos).map(([id, topo]) => {
      const line = topo.lines[idRoute];

      return [
        id,
        line
          ? {
              ...topo,
              lines: { ...topo.lines, [idRoute]: { ...line, isDirty: false } }
            }
          : topo
      ];
    })
  )
});

export const isRouteDirty = (
  session: TopoEditorSession,
  idRoute: string
): boolean =>
  !!session.routes[idRoute]?.isDirty ||
  Object.values(session.topos).some((topo) => topo.lines[idRoute]?.isDirty);

export const hasUnsavedChanges = (session: TopoEditorSession): boolean =>
  session.routeOrder.some((idRoute) => isRouteDirty(session, idRoute));

export const dirtyRouteIds = (session: TopoEditorSession): string[] =>
  session.routeOrder.filter((idRoute) => isRouteDirty(session, idRoute));
