import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import Typography from '@mui/material/Typography';

import { useEditModeWhileMounted, useModal } from '@web/app/providers';
import { buildRoutePath, buildSectorPath } from '@web/app/router/routes';
import { findTopoOfRoute } from '@web/features/topo';
import {
  isRouteDirty,
  TopoEditorRouteDesktop,
  useTopoEditorActions,
  useTopoEditorSession
} from '@web/features/topoEditor';
import { useSectorEditorData } from '@web/pages/sectorEdit';
import { useWarnOnUnload } from '@web/shared/lib';
import { ApiFeedback, EditorPageShell } from '@web/shared/ui';

export const PageRouteEditDesktop = () => {
  useEditModeWhileMounted();
  const { t } = useLingui();
  const { idRegion = '', idSector = '', idRoute = '' } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  // The numbering readers see is computed across the whole sector, so the
  // session is hydrated with all of it even though one route is edited.
  const { routes, topos, isLoading, failure } = useSectorEditorData(idSector);
  const editor = useTopoEditorSession();
  const actions = useTopoEditorActions({ idSector, editor, topos, routes });
  const { session, dispatch } = editor;

  const route = session.routes[idRoute];
  const isDirty = isRouteDirty(session, idRoute);

  const leave = () => {
    const go = () => navigate(buildRoutePath(idRegion, idSector, idRoute));

    if (!isDirty) {
      go();

      return;
    }

    openModal('LEAVE_EDITOR', { onConfirm: go });
  };

  // An empty sector is legitimate, so emptiness cannot mean "not hydrated".
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (isLoading || hasHydrated.current) return;

    hasHydrated.current = true;
    dispatch({ type: 'SESSION_HYDRATED', topos, routes });

    // The stage has to open on the photo this route is drawn on, not on the
    // first one, or the line being edited is off screen.
    const topo = findTopoOfRoute(topos, idRoute);

    if (topo) dispatch({ type: 'SELECT_TOPO', idTopo: topo.id });

    dispatch({ type: 'SELECT_ROUTE', idRoute });
  }, [isLoading, topos, routes, idRoute, dispatch]);

  useEffect(() => {
    if (isLoading || !hasHydrated.current) return;

    dispatch({ type: 'TOPOS_REPLACED', topos });
  }, [isLoading, topos, dispatch]);

  useWarnOnUnload(isDirty);

  return (
    <EditorPageShell
      title={route ? `${route.name || t`New route`} · ${route.grade}` : '…'}
      onLeave={leave}
    >
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading the route…</Trans>}
      />
      {!isLoading && !failure && !route && (
        <Typography variant="body2" color="text.secondary">
          <Trans>This route is not in the sector any more.</Trans>
        </Typography>
      )}
      {!isLoading && !failure && route && (
        <TopoEditorRouteDesktop
          idRoute={idRoute}
          savedRoutes={routes}
          editor={editor}
          actions={actions}
          onDeleted={() => navigate(buildSectorPath(idRegion, idSector))}
        />
      )}
    </EditorPageShell>
  );
};
