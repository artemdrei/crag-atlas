import { useState } from 'react';
import { useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import {
  buildRegionPath,
  buildSectorPath,
  ROUTES
} from '@web/app/router/routes';
import { EditToggleButton, RouteEditForm } from '@web/features/catalogEdit';
import { TopoImage, useApiGetTopos } from '@web/features/topo';
import { ApiFeedback, PageBreadcrumbs, PhotoPlaceholder } from '@web/shared/ui';

import { LogTickButton, RouteDetails, useApiGetRoute } from '../common';

export const PageRouteMobile = () => {
  const { t } = useLingui();
  const { idRegion = '', idSector = '', idRoute = '' } = useParams();
  const { route, isLoading, failure } = useApiGetRoute(idRoute);
  const [isEditing, setIsEditing] = useState(false);
  const { topos } = useApiGetTopos(idSector);
  // A route is drawn on exactly one of the sector's topos.
  const topo = topos.find((item) =>
    item.lines.some((line) => line.idRoute === idRoute)
  );

  return (
    <PageStyled spacing={2}>
      <PageBreadcrumbs
        maxItems={2}
        items={[
          { label: t`Regions`, to: ROUTES.INDEX },
          { label: route?.regionName ?? '…', to: buildRegionPath(idRegion) },
          {
            label: route?.sectorName ?? '…',
            to: buildSectorPath(idRegion, idSector)
          },
          { label: route?.name ?? '…' }
        ]}
      />
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading route…</Trans>}
      />
      {route && !isEditing && (
        <>
          <HeaderRowStyled>
            <RouteDetails route={route} />
            <EditToggleButton onClick={() => setIsEditing(true)} />
          </HeaderRowStyled>
          {topo ? (
            <TopoImage topo={topo} idHighlightedRoute={route.id} />
          ) : (
            <PhotoPlaceholder variant="wide" />
          )}
          <LogTickButton idRoute={route.id} />
        </>
      )}
      {route && isEditing && (
        <RouteEditForm route={route} onClose={() => setIsEditing(false)} />
      )}
    </PageStyled>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(2)};
`;
