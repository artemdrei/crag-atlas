import { useCallback, useMemo, useState } from 'react';

import type { Sector } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { SectorEditForm } from '@web/features/catalogEdit';

import type { RouteDraft, TopoEditorSessionApi } from '../common';
import { isRouteDirty } from '../common';
import type { TopoEditorActions } from './hooks';
import { useEditorHotkeys, useTopoEditorDerived } from './hooks';
import {
  TopoEditorRouteList,
  TopoEditorRoutePanel,
  TopoEditStage,
  TopoThumbRail
} from './ui';

export interface RouteGroupDraft {
  id: string;
  label: string;
  routes: RouteDraft[];
}

export interface Props {
  sector?: Sector;
  editor: TopoEditorSessionApi;
  actions: TopoEditorActions;
}

export const TopoEditorDesktop = ({ sector, editor, actions }: Props) => {
  const { t } = useLingui();
  const { session, dispatch, beginGesture, endGesture, undo, redo } = editor;
  const { numberOf, gradeOf, gradeScaleOf, nameOf, colorOf, selectRoute } =
    useTopoEditorDerived(editor);
  const [idHoveredRoute, setIdHoveredRoute] = useState<string>();
  // The name and description are set once and rarely touched; the route being
  // drawn is what this column is for.
  const [isSectorOpen, setIsSectorOpen] = useState(false);

  const activeTopo = session.idActiveTopo
    ? session.topos[session.idActiveTopo]
    : undefined;
  const selectedRoute = session.idSelectedRoute
    ? session.routes[session.idSelectedRoute]
    : undefined;

  // Same shape as the reader sees: photo by photo, each route in the order it
  // is numbered on the rock, and whatever is not drawn yet at the end.
  const groups = useMemo(() => {
    const byNumber = (routes: RouteDraft[]) =>
      [...routes].sort(
        (left, right) =>
          (numberOf[left.id] ?? Number.MAX_SAFE_INTEGER) -
          (numberOf[right.id] ?? Number.MAX_SAFE_INTEGER)
      );

    const placed = new Set<string>();
    const grouped: RouteGroupDraft[] = [];

    for (const idTopo of session.order) {
      const topo = session.topos[idTopo];
      const drawn = Object.values(topo.lines)
        .filter((line) => line.points.length > 0)
        .map((line) => session.routes[line.idRoute])
        .filter((route): route is RouteDraft => !!route);

      for (const route of drawn) placed.add(route.id);

      if (drawn.length > 0) {
        grouped.push({
          id: topo.id,
          label: topo.label,
          routes: byNumber(drawn)
        });
      }
    }

    const rest = session.routeOrder
      .map((id) => session.routes[id])
      .filter((route) => !!route && !placed.has(route.id));

    if (rest.length > 0) {
      grouped.push({
        id: 'rest',
        label: t`Not on a photo`,
        routes: byNumber(rest)
      });
    }

    return grouped;
  }, [
    session.order,
    session.topos,
    session.routes,
    session.routeOrder,
    numberOf,
    t
  ]);

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
          groups={groups}
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
        <SectionToggleStyled
          type="button"
          aria-expanded={isSectorOpen}
          onClick={() => setIsSectorOpen((open) => !open)}
        >
          <Typography variant="subtitle2">
            <Trans>Sector</Trans>
          </Typography>
          <ExpandMoreIcon fontSize="small" />
        </SectionToggleStyled>
        <Collapse in={isSectorOpen} unmountOnExit>
          {sector && <SectorEditForm sector={sector} />}
        </Collapse>
        <Divider />
        {selectedRoute && (
          <TopoEditorRoutePanel
            route={selectedRoute}
            number={numberOf[selectedRoute.id]}
            hasLine={
              (activeTopo?.lines[selectedRoute.id]?.points.length ?? 0) > 0
            }
            isDirty={isRouteDirty(session, selectedRoute.id)}
            isBusy={actions.isBusy}
            isPreview={session.isPreview}
            canUndo={editor.canUndo}
            canRedo={editor.canRedo}
            onChange={(patch) =>
              dispatch({ type: 'EDIT_ROUTE', idRoute: selectedRoute.id, patch })
            }
            onTogglePreview={() => dispatch({ type: 'TOGGLE_PREVIEW' })}
            onUndo={undo}
            onRedo={redo}
            onSave={() => actions.saveRoute(selectedRoute.id)}
            onRemoveLine={actions.removeLine}
            onDelete={() => actions.removeRoute(selectedRoute.id)}
          />
        )}
        {!selectedRoute && (
          <HintStyled>
            <span aria-hidden="true">👈</span>
            <Typography variant="body2" color="text.secondary">
              <Trans>Pick a route on the left to edit it.</Trans>
            </Typography>
            <CenteredStyled variant="body2" color="text.secondary">
              <Trans>Or</Trans>
            </CenteredStyled>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={<AddIcon fontSize="small" />}
              disabled={actions.isBusy}
              onClick={actions.addRoute}
            >
              <Trans>Add route</Trans>
            </Button>
          </HintStyled>
        )}
      </ColumnStyled>
    </LayoutStyled>
  );
};

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

const SectionToggleStyled = styled(ButtonBase)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(0.5, 0)};

  & svg {
    transition: transform 0.15s ease-out;
  }

  &[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }
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

const HintStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(2)};

  & > span {
    align-self: center;
    font-size: ${({ theme }) => theme.typography.h4.fontSize};
    line-height: 1;
  }
`;

const CenteredStyled = styled(Typography)`
  text-align: center;
`;
