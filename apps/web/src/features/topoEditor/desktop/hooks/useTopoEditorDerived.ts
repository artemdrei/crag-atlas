import { useCallback, useMemo } from 'react';

import type { GradeScale } from '@crag-atlas/api';
import { useTheme } from '@mui/material/styles';

import { findTopoOfRoute, orderRoutes } from '@web/features/topo';
import { getGradeColor } from '@web/shared/theme/palette';

import type { TopoEditorSessionApi } from '../../common';
import { orderedTopos } from '../../common';

export const useTopoEditorDerived = ({
  session,
  dispatch
}: Pick<TopoEditorSessionApi, 'session' | 'dispatch'>) => {
  const theme = useTheme();

  // One adapter for both `orderRoutes` and `findTopoOfRoute`: rebuilding it
  // per call would run once per pointer move while a point is dragged.
  const toposWithLines = useMemo(
    () =>
      orderedTopos(session.order, session.topos).map((topo) => ({
        ...topo,
        lines: Object.values(topo.lines)
      })),
    [session.order, session.topos]
  );

  const numberOf = useMemo(
    () => orderRoutes(toposWithLines, session.routeOrder),
    [toposWithLines, session.routeOrder]
  );

  const gradeOf = useCallback(
    (idRoute: string) => session.routes[idRoute]?.grade ?? '',
    [session.routes]
  );

  const gradeScaleOf = useCallback(
    (idRoute: string): GradeScale =>
      session.routes[idRoute]?.gradeScale ?? 'french',
    [session.routes]
  );

  const nameOf = useCallback(
    (idRoute: string) => session.routes[idRoute]?.name ?? '',
    [session.routes]
  );

  const colorOf = useCallback(
    (idRoute: string) =>
      getGradeColor(
        theme.palette.grade,
        gradeOf(idRoute),
        gradeScaleOf(idRoute)
      ),
    [theme.palette.grade, gradeOf, gradeScaleOf]
  );

  const selectRoute = useCallback(
    (idRoute: string) => {
      const topo = findTopoOfRoute(toposWithLines, idRoute);

      if (topo && topo.id !== session.idActiveTopo) {
        dispatch({ type: 'SELECT_TOPO', idTopo: topo.id });
      }

      dispatch({ type: 'SELECT_ROUTE', idRoute });
    },
    [toposWithLines, session.idActiveTopo, dispatch]
  );

  return { numberOf, gradeOf, gradeScaleOf, nameOf, colorOf, selectRoute };
};
