import { useCallback, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { TopoEditorSessionApi } from '../common';
import { isRouteDirty } from '../common';
import type { TopoEditorActions } from './hooks';
import { useEditorHotkeys, useTopoEditorDerived } from './hooks';
import { TopoEditorRoutePanel, TopoEditStage, TopoThumbRail } from './ui';

export interface Props {
  idRoute: string;
  editor: TopoEditorSessionApi;
  actions: TopoEditorActions;
  onDeleted: () => void;
}

/** The sector editor narrowed to one route: the photo strip only switches
    photos, and everything the sector owns is edited there, not here. */
export const TopoEditorRouteDesktop = ({
  idRoute,
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
            session={session}
            idLockedRoute={idRoute}
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
          topos={session.order.map((id) => session.topos[id])}
          idActiveTopo={session.idActiveTopo}
          isBusy={actions.isBusy}
          onSelect={(idTopo) => dispatch({ type: 'SELECT_TOPO', idTopo })}
        />
      </StageColumnStyled>
      <ColumnStyled>
        <TopoEditorRoutePanel
          route={route}
          number={numberOf[idRoute]}
          hasLine={(activeTopo?.lines[idRoute]?.points.length ?? 0) > 0}
          isDirty={isRouteDirty(session, idRoute)}
          isBusy={actions.isBusy}
          isPreview={session.isPreview}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          onChange={(patch) => dispatch({ type: 'EDIT_ROUTE', idRoute, patch })}
          onTogglePreview={() => dispatch({ type: 'TOGGLE_PREVIEW' })}
          onUndo={undo}
          onRedo={redo}
          onSave={() => actions.saveRoute(idRoute)}
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
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;
