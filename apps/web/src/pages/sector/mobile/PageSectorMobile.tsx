import { useMemo } from 'react';
import { useParams } from 'react-router';

import type { CatalogSource } from '@crag-atlas/analytics';
import { Plural } from '@lingui/react/macro';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { buildRegionPath } from '@web/app/router/routes';
import { useOpenCatalogItem } from '@web/app/router/useOpenCatalogItem';
import {
  gradeOrder,
  RouteFilterPanelMobile,
  useRouteFilter
} from '@web/features/routeFilter';
import { SectorConditionsMobile } from '@web/features/sectorConditions';
import {
  orderRoutes,
  TopoGalleryMobile,
  useApiGetTopos,
  useTopoGallery
} from '@web/features/topo';
import { coordsOf } from '@web/shared/lib';
import { getGradeColor } from '@web/shared/theme/palette';
import {
  ApiFeedback,
  DirectionsButton,
  PageBreadcrumbs,
  PageShell,
  PageTitle,
  PageTitleRow
} from '@web/shared/ui';

import type { Route } from '../common';
import {
  ArchivedSectorNotice,
  RoutesList,
  useApiGetRoutes,
  useApiGetSector,
  useApiGetTickedRoutes,
  useRoutesByTopo,
  useVisibleRoutes
} from '../common';

export const PageSectorMobile = () => {
  const theme = useTheme();
  const { idRegion = '', idSector = '' } = useParams();
  const openCatalogItem = useOpenCatalogItem();
  const { sector } = useApiGetSector(idSector);
  const { routes, isLoading, failure } = useApiGetRoutes(idSector);
  const { topos } = useApiGetTopos(idSector);
  const filterState = useRouteFilter('routes');
  const { tickedRoutes } = useApiGetTickedRoutes(idSector);
  const { visibleRoutes, visibleTopos, tickedCount } = useVisibleRoutes({
    routes,
    topos,
    filter: filterState.filter,
    tickedRoutes
  });
  const { idActiveTopo, selectTopo } = useTopoGallery({
    topos: visibleTopos
  });

  const orderOfGrade = useMemo(
    () => gradeOrder(sector?.gradeHistogram ?? []),
    [sector?.gradeHistogram]
  );

  const numberOf = useMemo(
    () =>
      orderRoutes(
        topos,
        routes.map((route) => route.id)
      ),
    [topos, routes]
  );

  const groups = useRoutesByTopo({
    routes: visibleRoutes,
    topos: visibleTopos,
    numberOf,
    sort: filterState.sort,
    direction: filterState.direction,
    gradeOrder: orderOfGrade
  });

  const colorOf = (idRoute: string) => {
    const route = routes.find(({ id }) => id === idRoute);

    return getGradeColor(theme.palette.grade, route?.grade, route?.gradeScale);
  };

  const openRoute = (route: Route, source: CatalogSource = 'card') =>
    openCatalogItem(source, {
      name: route.name,
      idRegion,
      idSector,
      idRoute: route.id
    });

  const openRouteById = (idRoute: string) => {
    const route = routes.find(({ id }) => id === idRoute);

    if (route) openRoute(route, 'topo');
  };

  return (
    <PageShell
      spacing={2}
      isCompact
      header={
        <PageBreadcrumbs
          maxItems={2}
          items={[
            {
              label: sector?.regionName ?? '…',
              to: buildRegionPath(idRegion)
            },
            { label: sector?.name ?? '…' }
          ]}
        />
      }
    >
      {sector?.isArchived && <ArchivedSectorNotice />}
      <PageTitleRow>
        <PageTitle
          name={sector?.name}
          nameLocal={sector?.nameLocal}
          variant="h5"
        />
        <DirectionsButton entityType="sector" point={coordsOf(sector)} />
      </PageTitleRow>
      {sector?.description && (
        <Typography variant="body2" color="text.secondary">
          {sector.description}
        </Typography>
      )}
      <TopoGalleryMobile
        topos={visibleTopos}
        idActiveTopo={idActiveTopo}
        colorOf={colorOf}
        numberOf={numberOf}
        tickedRoutes={tickedRoutes}
        onSelectTopo={selectTopo}
        onSelectRoute={openRouteById}
      />
      {sector && (
        <SectorConditionsMobile idSector={idSector} coords={coordsOf(sector)} />
      )}
      <RouteFilterPanelMobile
        state={filterState}
        title={
          <Plural value={visibleRoutes.length} one="# route" other="# routes" />
        }
        routesCount={visibleRoutes.length}
        tickedCount={tickedCount}
        gradeHistogram={sector?.gradeHistogram ?? []}
        gradeOrder={orderOfGrade}
      />
      <ApiFeedback failure={failure} />
      <RoutesList
        groups={groups}
        numberOf={numberOf}
        tickedRoutes={tickedRoutes}
        isLoading={isLoading}
        onOpen={openRoute}
      />
      <ActionBarStyled></ActionBarStyled>
    </PageShell>
  );
};

const ActionBarStyled = styled('div')`
  position: sticky;
  bottom: 0;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme }) => theme.palette.background.default};
`;
