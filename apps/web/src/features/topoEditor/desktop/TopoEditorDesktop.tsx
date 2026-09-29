import { useCallback, useMemo, useState } from 'react';

import type { Route, Sector } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { SectorEditForm } from '@web/features/catalogEdit';
import { sortByNumber, usePhotoLabel } from '@web/features/topo';

import type {
  RouteDraft,
  TopoEditorActions,
  TopoEditorSessionApi
} from '../common';
import {
  changedRouteFields,
  dirtyRouteIds,
  isRouteDirty,
  orderedTopos,
  photoOf
} from '../common';
import { useEditorHotkeys, useTopoEditorDerived } from './hooks';
import {
  TopoEditorArchivedRoutes,
  TopoEditorRouteList,
  TopoEditorRoutePanel,
  TopoEditStage,
  TopoThumbRail
} from './ui';

export const REST_GROUP = 'rest';

export interface RouteGroupDraft {
  id: string;
  label: string;
  routes: RouteDraft[];
}

export interface Props {
  sector?: Sector;
  savedRoutes: Route[];
  // Kept out of the session on purpose — see TopoEditorArchivedRoutes.
  archivedRoutes: Route[];
  editor: TopoEditorSessionApi;
  actions: TopoEditorActions;
  isArchiveShown: boolean;
  onRestoreRoute: (idRoute: string) => void;
  onEraseRoute: (route: Route) => void;
}

export const TopoEditorDesktop = ({
  sector,
  savedRoutes,
  archivedRoutes,
  editor,
  actions,
  isArchiveShown,
  onRestoreRoute,
  onEraseRoute
}: Props) => {
  const { t } = useLingui();
  const { session, dispatch, beginGesture, endGesture, undo, redo } = editor;
  const { numberOf, gradeOf, gradeScaleOf, nameOf, colorOf, selectRoute } =
    useTopoEditorDerived(editor);
  const [idHoveredRoute, setIdHoveredRoute] = useState<string>();
  const [isSectorOpen, setIsSectorOpen] = useState(false);

  const activeTopo = session.idActiveTopo
    ? session.topos[session.idActiveTopo]
    : undefined;
  const selectedRoute = session.idSelectedRoute
    ? session.routes[session.idSelectedRoute]
    : undefined;

  const photoLabel = usePhotoLabel();

  const topos = useMemo(
    () => orderedTopos(session.order, session.topos),
    [session.order, session.topos]
  );

  const groups = useMemo(() => {
    const placed = new Set<string>();
    const grouped: RouteGroupDraft[] = [];

    for (const [index, topo] of topos.entries()) {
      const drawn = Object.values(topo.lines)
        .filter((line) => line.points.length > 0)
        .flatMap((line) => session.routes[line.idRoute] ?? []);

      for (const route of drawn) placed.add(route.id);

      grouped.push({
        id: topo.id,
        label: photoLabel(index),
        routes: sortByNumber(drawn, numberOf)
      });
    }

    const rest = session.routeOrder
      .flatMap((id) => session.routes[id] ?? [])
      .filter((route) => !placed.has(route.id));

    if (rest.length > 0) {
      grouped.push({
        id: REST_GROUP,
        label: t`Not on a photo yet`,
        routes: sortByNumber(rest, numberOf)
      });
    }

    return grouped;
  }, [topos, session.routes, session.routeOrder, numberOf, photoLabel, t]);

  const photos = groups.filter((group) => group.id !== REST_GROUP);

  const idsDirtyRoutes = new Set(dirtyRouteIds(session));

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
    <LayoutStyled isArchiveShown={isArchiveShown}>
      <StageColumnStyled>
        {activeTopo ? (
          <StageStyled
            topo={activeTopo}
            label={photoLabel(session.order.indexOf(activeTopo.id))}
            session={session}
            access={{ kind: 'sector' }}
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
          topos={topos}
          idActiveTopo={session.idActiveTopo}
          mode={{
            kind: 'manage',
            onReorder: actions.movePhotoTo,
            onReplace: actions.replacePhoto,
            onAdd: actions.addPhoto,
            onDelete: actions.removePhoto
          }}
          isBusy={actions.isBusy}
          onSelect={(idTopo) => dispatch({ type: 'SELECT_TOPO', idTopo })}
        />
      </StageColumnStyled>
      <ColumnStyled>
        {isArchiveShown ? (
          <TopoEditorArchivedRoutes
            routes={archivedRoutes}
            isBusy={actions.isBusy}
            onRestore={onRestoreRoute}
            onErase={onEraseRoute}
          />
        ) : (
          <TopoEditorRouteList
            groups={groups}
            numberOf={numberOf}
            idsDirtyRoutes={idsDirtyRoutes}
            idSelectedRoute={session.idSelectedRoute}
            idHoveredRoute={idHoveredRoute}
            onSelect={selectRoute}
            onHover={setIdHoveredRoute}
            onMoveToPhoto={(idRoute, idTopo) =>
              dispatch({ type: 'MOVE_LINE', idRoute, idTopo })
            }
          />
        )}
      </ColumnStyled>
      {!isArchiveShown && (
        <ColumnStyled>
          <SectorSectionStyled>
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
              <SectorFormStyled>
                {sector && <SectorEditForm sector={sector} />}
              </SectorFormStyled>
            </Collapse>
          </SectorSectionStyled>
          {selectedRoute && (
            <TopoEditorRoutePanel
              route={selectedRoute}
              number={numberOf[selectedRoute.id]}
              hasLine={
                (activeTopo?.lines[selectedRoute.id]?.points.length ?? 0) > 0
              }
              changed={changedRouteFields(
                selectedRoute,
                savedRoutes.find(({ id }) => id === selectedRoute.id)
              )}
              isDirty={isRouteDirty(session, selectedRoute.id)}
              isBusy={actions.isBusy}
              isPreview={session.isPreview}
              canUndo={editor.canUndo}
              canRedo={editor.canRedo}
              onChange={(patch) =>
                dispatch({
                  type: 'EDIT_ROUTE',
                  idRoute: selectedRoute.id,
                  patch
                })
              }
              onTogglePreview={() => dispatch({ type: 'TOGGLE_PREVIEW' })}
              onUndo={undo}
              onRedo={redo}
              onReset={() => actions.resetRoute(selectedRoute.id)}
              onSave={() => actions.saveRoute(selectedRoute.id)}
              photos={photos}
              idPhoto={photoOf(session, selectedRoute.id)}
              onMoveToPhoto={(idTopo) =>
                dispatch({
                  type: 'MOVE_LINE',
                  idRoute: selectedRoute.id,
                  idTopo
                })
              }
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
      )}
    </LayoutStyled>
  );
};

const LayoutStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isArchiveShown'
})<{ isArchiveShown: boolean }>`
  display: grid;
  grid-template-columns: ${({ isArchiveShown }) =>
    isArchiveShown ? 'minmax(0, 1fr) 480px' : 'minmax(0, 1fr) 320px 360px'};
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

const SectorSectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const SectorFormStyled = styled('div')`
  padding-top: ${({ theme }) => theme.spacing(2)};
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
  overflow: hidden;
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
