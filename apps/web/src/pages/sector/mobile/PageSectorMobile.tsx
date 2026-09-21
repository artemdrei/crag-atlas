import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  buildRegionPath,
  buildRoutePath,
  ROUTES
} from '@web/app/router/routes';
import { EditToggleButton, SectorEditForm } from '@web/features/catalogEdit';
import {
  orderRoutes,
  TopoGalleryMobile,
  useApiGetTopos,
  useTopoGallery
} from '@web/features/topo';
import { getGradeColor } from '@web/shared/theme/palette';
import { ApiFeedback, PageBreadcrumbs } from '@web/shared/ui';

import type { Route } from '../common';
import {
  RoutesList,
  RoutesPanelHeader,
  useApiGetRoutes,
  useApiGetSector,
  useRoutesByTopo
} from '../common';

export const PageSectorMobile = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { idRegion = '', idSector = '' } = useParams();
  const navigate = useNavigate();
  const { sector } = useApiGetSector(idSector);
  const [isEditing, setIsEditing] = useState(false);
  const { routes, isLoading, failure } = useApiGetRoutes(idSector);
  const { topos } = useApiGetTopos(idSector);
  const { idActiveTopo, selectTopo } = useTopoGallery({ topos });
  const numberOf = useMemo(
    () =>
      orderRoutes(
        topos,
        routes.map((route) => route.id)
      ),
    [topos, routes]
  );

  const groups = useRoutesByTopo({ routes, topos });

  const colorOf = (idRoute: string) => {
    const route = routes.find(({ id }) => id === idRoute);

    return getGradeColor(theme.palette.grade, route?.grade, route?.gradeScale);
  };

  const openRoute = (route: Route) =>
    navigate(buildRoutePath(idRegion, idSector, route.id));

  const openRouteById = (idRoute: string) => {
    const route = routes.find(({ id }) => id === idRoute);

    if (route) openRoute(route);
  };

  return (
    <PageStyled spacing={2}>
      <HeaderRowStyled>
        <PageBreadcrumbs
          maxItems={2}
          items={[
            { label: t`Regions`, to: ROUTES.INDEX },
            { label: sector?.regionName ?? '…', to: buildRegionPath(idRegion) },
            { label: sector?.name ?? '…' }
          ]}
        />
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
      <TopoGalleryMobile
        topos={topos}
        idActiveTopo={idActiveTopo}
        colorOf={colorOf}
        numberOf={numberOf}
        onSelectTopo={selectTopo}
        onSelectRoute={openRouteById}
      />
      <RoutesPanelHeader routesCount={routes.length} />
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading routes…</Trans>}
      />
      <RoutesList groups={groups} numberOf={numberOf} onOpen={openRoute} />
      <ActionBarStyled></ActionBarStyled>
    </PageStyled>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ActionBarStyled = styled('div')`
  position: sticky;
  bottom: 0;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme }) => theme.palette.background.default};
`;

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(2)};
`;
