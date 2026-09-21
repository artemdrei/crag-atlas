import { useCallback, useMemo, useState } from 'react';

import type { GradeScale } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { findTopoOfRoute, orderRoutes } from '@web/features/topo';
import { getGradeColor } from '@web/shared/theme/palette';

import type { TopoEditorSessionApi } from '../common';
import type { TopoEditorActions } from './hooks';
import { useEditorHotkeys } from './hooks';
import {
  TopoEditorRouteList,
  TopoEditorRoutePanel,
  TopoEditStage,
  TopoThumbRail
} from './ui';

export interface Props {
  editor: TopoEditorSessionApi;
  actions: TopoEditorActions;
}

export const TopoEditorDesktop = ({ editor, actions }: Props) => {
  const theme = useTheme();
  const { session, dispatch, beginGesture, endGesture, undo, redo } = editor;
  const [idHoveredRoute, setIdHoveredRoute] = useState<string>();

  const activeTopo = session.idActiveTopo
    ? session.topos[session.idActiveTopo]
    : undefined;
  const selectedRoute = session.idSelectedRoute
    ? session.routes[session.idSelectedRoute]
    : undefined;

  const groups = useMemo(() => {
    const isOnActiveTopo = (idRoute: string) =>
      !!activeTopo?.lines[idRoute]?.points.length;

    const routes = session.routeOrder.map((id) => session.routes[id]);

    return {
      onThisTopo: routes.filter((route) => isOnActiveTopo(route.id)),
      elsewhere: routes
        .filter((route) => !isOnActiveTopo(route.id))
        .sort((left, right) => left.name.localeCompare(right.name))
    };
  }, [activeTopo, session.routeOrder, session.routes]);

  const numberOf = useMemo(
    () =>
      orderRoutes(
        session.order.map((id) => ({
          sortOrder: session.topos[id].sortOrder,
          lines: Object.values(session.topos[id].lines)
        })),
        groups.elsewhere.map((route) => route.id)
      ),
    [session.order, session.topos, groups.elsewhere]
  );

  const selectRoute = useCallback(
    (idRoute: string) => {
      const topo = findTopoOfRoute(
        session.order.map((id) => ({
          ...session.topos[id],
          lines: Object.values(session.topos[id].lines)
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

  const handleDelete = useCallback(() => {
    if (session.idSelectedPoint !== undefined) {
      dispatch({ type: 'DELETE_POINT', index: session.idSelectedPoint });
    }
  }, [session.idSelectedPoint, dispatch]);

  useEditorHotkeys({
    isEnabled: !session.isPreview,
    onUndo: undo,
    onRedo: redo,
    onDelete: handleDelete,
    onEscape: () => dispatch({ type: 'SELECT_ROUTE', idRoute: undefined })
  });

  return (
    <LayoutStyled>
      <StageColumnStyled>
        {activeTopo ? (
          <StageStyled
            topo={activeTopo}
            session={session}
            numberOf={numberOf}
            colorOf={colorOf}
            gradeOf={gradeOf}
            gradeScaleOf={gradeScaleOf}
            nameOf={nameOf}
            onAction={dispatch}
            idHoveredRoute={idHoveredRoute}
            onGestureStart={beginGesture}
            onGestureEnd={endGesture}
            onHoverRoute={setIdHoveredRoute}
          />
        ) : (
          <EmptyPhotoStyled>
            <Typography variant="body2" color="text.secondary">
              <Trans>Add a photo to start drawing routes on it.</Trans>
            </Typography>
          </EmptyPhotoStyled>
        )}
        <TopoThumbRail
          topos={session.order.map((id) => session.topos[id])}
          idActiveTopo={session.idActiveTopo}
          isBusy={actions.isBusy}
          onSelect={(idTopo) => dispatch({ type: 'SELECT_TOPO', idTopo })}
          onReorder={actions.movePhotoTo}
          onReplace={actions.replacePhoto}
          onAdd={actions.addPhoto}
          onDelete={actions.removePhoto}
        />
      </StageColumnStyled>
      <ColumnStyled>
        <TopoEditorRouteList
          onThisTopo={groups.onThisTopo}
          elsewhere={groups.elsewhere}
          numberOf={numberOf}
          idSelectedRoute={session.idSelectedRoute}
          idHoveredRoute={idHoveredRoute}
          isBusy={actions.isBusy}
          onSelect={selectRoute}
          onHover={setIdHoveredRoute}
          onAdd={actions.addRoute}
        />
      </ColumnStyled>
      <ColumnStyled>
        {selectedRoute && (
          <TopoEditorRoutePanel
            route={selectedRoute}
            number={numberOf[selectedRoute.id]}
            hasLine={
              (activeTopo?.lines[selectedRoute.id]?.points.length ?? 0) > 0
            }
            isDirty={
              selectedRoute.isDirty ||
              isGeometryDirty(session, selectedRoute.id)
            }
            isBusy={actions.isBusy}
            canUndo={editor.canUndo}
            canRedo={editor.canRedo}
            onChange={(patch) =>
              dispatch({ type: 'EDIT_ROUTE', idRoute: selectedRoute.id, patch })
            }
            onUndo={undo}
            onRedo={redo}
            onSave={() => actions.saveRoute(selectedRoute.id)}
            onRemoveLine={actions.removeLine}
            onDelete={() => actions.removeRoute(selectedRoute.id)}
          />
        )}
      </ColumnStyled>
    </LayoutStyled>
  );
};

const isGeometryDirty = (
  session: TopoEditorSessionApi['session'],
  idRoute: string
) => Object.values(session.topos).some((topo) => topo.lines[idRoute]?.isDirty);

const LayoutStyled = styled('div')`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px 360px;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-grow: 1;
  min-height: 0;
`;

const StageColumnStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
  min-height: 0;
`;

const StageStyled = styled(TopoEditStage)`
  flex-grow: 1;
  min-height: 0;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background: ${({ theme }) => theme.palette.background.paper};
`;

const EmptyPhotoStyled = styled('div')`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
`;

const ColumnStyled = styled('div')`
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;
