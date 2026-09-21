import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Plural, Trans, useLingui } from '@lingui/react/macro';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { buildSectorPath } from '@web/app/router/routes';
import {
  hasUnsavedChanges,
  TopoEditorDesktop,
  useTopoEditorActions,
  useTopoEditorSession
} from '@web/features/topoEditor';
import { ApiFeedback } from '@web/shared/ui';

import { useSectorEditorData } from '../common';

export const PageSectorEditDesktop = () => {
  const { t } = useLingui();
  const { idRegion = '', idSector = '' } = useParams();
  const navigate = useNavigate();
  const { sector, routes, topos, isLoading, failure } =
    useSectorEditorData(idSector);
  const editor = useTopoEditorSession();
  const actions = useTopoEditorActions({ idSector, editor, topos });
  const { session, dispatch } = editor;

  const isDirty = hasUnsavedChanges(session);

  const leave = () => {
    if (isDirty && !window.confirm(t`Leave with unsaved changes?`)) return;

    navigate(buildSectorPath(idRegion, idSector));
  };

  // An empty sector is legitimate, so emptiness cannot mean "not hydrated".
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (isLoading || hasHydrated.current) return;

    hasHydrated.current = true;
    dispatch({ type: 'SESSION_HYDRATED', topos, routes });
  }, [isLoading, topos, routes, dispatch]);

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
        <IconButton aria-label={t`Back to the sector`} onClick={leave}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={t`Editor`}
        />
        <TitleStyled variant="subtitle1">
          {sector?.name ?? '…'} ·{' '}
          <Plural
            value={routes.length}
            one="# route"
            few="# routes"
            many="# routes"
            other="# routes"
          />
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
        loadingLabel={<Trans>Loading the sector…</Trans>}
      />
      {!isLoading && !failure && (
        <TopoEditorDesktop
          sector={sector ?? undefined}
          editor={editor}
          actions={actions}
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
