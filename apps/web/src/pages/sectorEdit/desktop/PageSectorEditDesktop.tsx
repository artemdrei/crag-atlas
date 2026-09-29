import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { Route } from '@crag-atlas/api';
import { Plural } from '@lingui/react/macro';

import { useEditModeWhileMounted, useModal } from '@web/app/providers';
import { buildSectorPath } from '@web/app/router/routes';
import { useApiArchiveAction } from '@web/features/catalogEdit';
import {
  hasUnsavedChanges,
  TopoEditorDesktop,
  useTopoEditorActions,
  useTopoEditorSession
} from '@web/features/topoEditor';
import { useSearchParamFlags, useWarnOnUnload } from '@web/shared/lib';
import {
  ApiFeedback,
  ArchivedToggle,
  EditorPageShell,
  ListSkeleton
} from '@web/shared/ui';

import { useSectorEditorData } from '../common';

export const PageSectorEditDesktop = () => {
  useEditModeWhileMounted();
  const { idRegion = '', idSector = '' } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [{ archive: isArchiveShown }, setFlags] = useSearchParamFlags([
    'archive'
  ]);
  const { sector, routes, archivedRoutes, topos, isLoading, failure } =
    useSectorEditorData(idSector, isArchiveShown);
  // An empty sector is legitimate, so emptiness cannot mean "not hydrated".
  const hasHydrated = useRef(false);
  const editor = useTopoEditorSession();
  const actions = useTopoEditorActions({ idSector, editor, topos, routes });
  const { session, dispatch } = editor;
  const { run: restoreRoute } = useApiArchiveAction<Route>('restore', {
    scope: 'routes',
    onDone: (route) => dispatch({ type: 'ROUTE_RESTORED', route })
  });
  const { run: eraseRoute } = useApiArchiveAction('erase', {
    scope: 'routes'
  });

  const isDirty = hasUnsavedChanges(session);

  const leave = () => {
    const go = () => navigate(buildSectorPath(idRegion, idSector));

    if (!isDirty) {
      go();

      return;
    }

    openModal('LEAVE_EDITOR', { onConfirm: go });
  };

  useEffect(() => {
    if (isLoading || hasHydrated.current) return;

    hasHydrated.current = true;
    dispatch({ type: 'SESSION_HYDRATED', topos, routes });
  }, [isLoading, topos, routes, dispatch]);

  useEffect(() => {
    if (isLoading || !hasHydrated.current) return;

    dispatch({ type: 'TOPOS_REPLACED', topos });
  }, [isLoading, topos, dispatch]);

  useWarnOnUnload(isDirty);

  return (
    <EditorPageShell
      title={
        <>
          {sector?.name ?? '…'} ·{' '}
          <Plural
            value={routes.length}
            one="# route"
            few="# routes"
            many="# routes"
            other="# routes"
          />
        </>
      }
      actions={
        <ArchivedToggle
          isOn={isArchiveShown}
          onToggle={() => setFlags({ archive: !isArchiveShown })}
        />
      }
      onLeave={leave}
    >
      <ApiFeedback failure={failure} />
      {isLoading && <ListSkeleton count={4} variant="row" />}
      {!isLoading && !failure && (
        <TopoEditorDesktop
          sector={sector ?? undefined}
          savedRoutes={routes}
          archivedRoutes={archivedRoutes}
          editor={editor}
          actions={actions}
          isArchiveShown={isArchiveShown}
          onRestoreRoute={restoreRoute}
          onEraseRoute={(route) =>
            openModal('PURGE_CATALOG_ITEM', {
              name: route.name,
              onConfirm: () => eraseRoute(route.id)
            })
          }
        />
      )}
    </EditorPageShell>
  );
};
