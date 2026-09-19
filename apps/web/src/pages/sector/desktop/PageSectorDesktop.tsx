import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  buildRegionPath,
  buildRoutePath,
  ROUTES
} from '@web/app/router/routes';
import { EditToggleButton, SectorEditForm } from '@web/features/catalogEdit';
import { TopoImage, useApiGetTopos } from '@web/features/topo';
import { ApiFeedback, PageBreadcrumbs, PhotoPlaceholder } from '@web/shared/ui';

import { RoutesList, useApiGetRoutes, useApiGetSector } from '../common';

export const PageSectorDesktop = () => {
  const { t } = useLingui();
  const { idRegion = '', idSector = '' } = useParams();
  const navigate = useNavigate();
  const { sector } = useApiGetSector(idSector);
  const [isEditing, setIsEditing] = useState(false);
  const { routes, isLoading, failure } = useApiGetRoutes(idSector);
  const { topos } = useApiGetTopos(idSector);

  return (
    <PageStyled spacing={3}>
      <PageBreadcrumbs
        items={[
          { label: t`Regions`, to: ROUTES.INDEX },
          { label: sector?.regionName ?? '…', to: buildRegionPath(idRegion) },
          { label: sector?.name ?? '…' }
        ]}
      />
      <HeaderRowStyled>
        <Typography variant="h4">{sector?.name ?? '…'}</Typography>
        {!isEditing && <EditToggleButton onClick={() => setIsEditing(true)} />}
      </HeaderRowStyled>
      {isEditing && sector && (
        <SectorEditForm sector={sector} onClose={() => setIsEditing(false)} />
      )}
      {!isEditing && sector?.description && (
        <Typography variant="body2" color="text.secondary">
          {sector.description}
        </Typography>
      )}
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading routes…</Trans>}
      />
      {topos.length === 0 ? (
        <PhotoPlaceholder variant="wide" />
      ) : (
        topos.map((topo) => <TopoImage key={topo.id} topo={topo} />)
      )}
      <RoutesList
        routes={routes}
        onSelect={(route) =>
          navigate(buildRoutePath(idRegion, idSector, route.id))
        }
      />
    </PageStyled>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(4)};
`;
