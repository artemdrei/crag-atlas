import { useCallback, useMemo, useState } from 'react';

import type { Route } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { usePhotoLabel } from '@web/features/topo';

import type { TopoEditorActions, TopoEditorSessionApi } from '../common';
import {
  changedRouteFields,
  isRouteDirty,
  orderedTopos,
  photoOf
} from '../common';
import { useEditorHotkeys, useTopoEditorDerived } from './hooks';
import { TopoEditorRoutePanel, TopoEditStage, TopoThumbRail } from './ui';

export interface Props {
  idRoute: string;
  savedRoutes: Route[];
  editor: TopoEditorSessionApi;
  actions: TopoEditorActions;
  onDeleted: () => void;
}

export const TopoEditorRouteDesktop = ({
  idRoute,
  savedRoutes,
  editor,
  actions,
  onDeleted
}: Props) => {
  const { session, dispatch, beginGesture, endGesture, undo, redo } = editor;
  const { numberOf, gradeOf, gradeScaleOf, nameOf, colorOf } =
    useTopoEditorDerived(editor);
  const [idHoveredRoute, setIdHoveredRoute] = useState<string>();

  const activeTopo = session.idActiveTopo
    ? session.topos[session.idActiveTopo]
    : undefined;
  const route = session.routes[idRoute];

  const photoLabel = usePhotoLabel();

  const topos = useMemo(
    () => orderedTopos(session.order, session.topos),
    [session.order, session.topos]
  );

  const photos = useMemo(
    () =>
      topos.map((topo, index) => ({ id: topo.id, label: photoLabel(index) })),
    [topos, photoLabel]
  );

  const handleDeletePoint = useCallback(() => {
    if (session.idSelectedPoint !== undefined) {
      dispatch({ type: 'DELETE_POINT', index: session.idSelectedPoint });
    }
  }, [session.idSelectedPoint, dispatch]);

  const handleDeleteRoute = async () => {
    if (await actions.removeRoute(idRoute)) onDeleted();
  };

  useEditorHotkeys({
    isEnabled: !session.isPreview,
    onUndo: undo,
    onRedo: redo,
    onDelete: handleDeletePoint,
    onEscape: () => dispatch({ type: 'SELECT_POINT', index: undefined })
  });

  if (!route) return null;

  return (
    <LayoutStyled>
      <StageColumnStyled>
        {activeTopo ? (
          <StageStyled
            topo={activeTopo}
            label={photoLabel(session.order.indexOf(activeTopo.id))}
            session={session}
            access={{ kind: 'route', idRoute }}
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
              <Trans>
                The sector has no photo yet — add one in the sector editor.
              </Trans>
            </Typography>
          </EmptyPhotoStyled>
        )}
        <TopoThumbRail
          topos={topos}
          idActiveTopo={session.idActiveTopo}
          mode={{ kind: 'browse' }}
          isBusy={actions.isBusy}
          onSelect={(idTopo) => dispatch({ type: 'SELECT_TOPO', idTopo })}
        />
      </StageColumnStyled>
      <ColumnStyled>
        <TopoEditorRoutePanel
          route={route}
          number={numberOf[idRoute]}
          hasLine={(activeTopo?.lines[idRoute]?.points.length ?? 0) > 0}
          changed={changedRouteFields(
            route,
            savedRoutes.find(({ id }) => id === idRoute)
          )}
          isDirty={isRouteDirty(session, idRoute)}
          isBusy={actions.isBusy}
          isPreview={session.isPreview}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          onChange={(patch) => dispatch({ type: 'EDIT_ROUTE', idRoute, patch })}
          onTogglePreview={() => dispatch({ type: 'TOGGLE_PREVIEW' })}
          onUndo={undo}
          onRedo={redo}
          onReset={() => actions.resetRoute(idRoute)}
          onSave={() => actions.saveRoute(idRoute)}
          photos={photos}
          idPhoto={photoOf(session, idRoute)}
          onMoveToPhoto={(idTopo) =>
            dispatch({ type: 'MOVE_LINE', idRoute, idTopo })
          }
          onRemoveLine={actions.removeLine}
          onDelete={handleDeleteRoute}
        />
      </ColumnStyled>
    </LayoutStyled>
  );
};

const LayoutStyled = styled('div')`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
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
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-height: 0;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;
