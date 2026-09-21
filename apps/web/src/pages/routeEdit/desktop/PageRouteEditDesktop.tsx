import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { buildRoutePath, buildSectorPath } from '@web/app/router/routes';
import { findTopoOfRoute } from '@web/features/topo';
import {
  isRouteDirty,
  TopoEditorRouteDesktop,
  useTopoEditorActions,
  useTopoEditorSession
} from '@web/features/topoEditor';
import { useSectorEditorData } from '@web/pages/sectorEdit';
import { ApiFeedback } from '@web/shared/ui';

export const PageRouteEditDesktop = () => {
  const { t } = useLingui();
  const { idRegion = '', idSector = '', idRoute = '' } = useParams();
  const navigate = useNavigate();
  // The numbering readers see is computed across the whole sector, so the
  // session is hydrated with all of it even though one route is edited.
  const { routes, topos, isLoading, failure } = useSectorEditorData(idSector);
  const editor = useTopoEditorSession();
  const actions = useTopoEditorActions({ idSector, editor, topos });
  const { session, dispatch } = editor;

  const route = session.routes[idRoute];
  const isDirty = isRouteDirty(session, idRoute);

  const leave = () => {
    if (isDirty && !window.confirm(t`Leave with unsaved changes?`)) return;

    navigate(buildRoutePath(idRegion, idSector, idRoute));
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

  useEffect(() => {
    if (!isDirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener('beforeunload', warn);

    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  return (
    <PageStyled spacing={1}>
      <TopBarStyled>
        <IconButton aria-label={t`Back to the route`} onClick={leave}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={t`Editor`}
        />
        <TitleStyled variant="subtitle1">
          {route ? `${route.name || t`New route`} · ${route.grade}` : '…'}
        </TitleStyled>
        <Button
          size="small"
          variant="outlined"
          startIcon={<CloseIcon fontSize="small" />}
          onClick={leave}
        >
          <Trans>Close the editor</Trans>
        </Button>
      </TopBarStyled>
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
          editor={editor}
          actions={actions}
          onDeleted={() => navigate(buildSectorPath(idRegion, idSector))}
        />
      )}
    </PageStyled>
  );
};

const TopBarStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const TitleStyled = styled(Typography)`
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PageStyled = styled(Stack)`
  height: 100%;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2, 3, 3)};
`;
