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
import { ApiFeedback, PageBreadcrumbs } from '@web/shared/ui';

import { RoutesList, useApiGetRoutes, useApiGetSector } from '../common';

export const PageSectorMobile = () => {
  const { t } = useLingui();
  const { idRegion = '', idSector = '' } = useParams();
  const navigate = useNavigate();
  const { sector } = useApiGetSector(idSector);
  const [isEditing, setIsEditing] = useState(false);
  const { routes, isLoading, failure } = useApiGetRoutes(idSector);

  return (
    <PageStyled spacing={2}>
      <PageBreadcrumbs
        maxItems={2}
        items={[
          { label: t`Regions`, to: ROUTES.INDEX },
          { label: sector?.regionName ?? '…', to: buildRegionPath(idRegion) },
          { label: sector?.name ?? '…' }
        ]}
      />
      <HeaderRowStyled>
        <Typography variant="h5">{sector?.name ?? '…'}</Typography>
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
  padding: ${({ theme }) => theme.spacing(2)};
`;
