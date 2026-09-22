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

  const numberOf = useMemo(
    () =>
      orderRoutes(
        orderedTopos(session.order, session.topos).map((topo) => ({
          sortOrder: topo.sortOrder,
          lines: Object.values(topo.lines)
        })),
        session.routeOrder
      ),
    [session.order, session.topos, session.routeOrder]
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
      const topo = findTopoOfRoute(
        orderedTopos(session.order, session.topos).map((item) => ({
          ...item,
          lines: Object.values(item.lines)
        })),
        idRoute
      );

      if (topo && topo.id !== session.idActiveTopo) {
        dispatch({ type: 'SELECT_TOPO', idTopo: topo.id });
      }

      dispatch({ type: 'SELECT_ROUTE', idRoute });
    },
    [session.order, session.topos, session.idActiveTopo, dispatch]
  );

  return { numberOf, gradeOf, gradeScaleOf, nameOf, colorOf, selectRoute };
};
