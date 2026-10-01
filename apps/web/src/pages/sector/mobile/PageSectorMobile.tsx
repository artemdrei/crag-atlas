import { useMemo } from 'react';
import { useParams } from 'react-router';

import type { CatalogSource } from '@crag-atlas/analytics';
import { useLingui } from '@lingui/react/macro';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { buildRegionPath, ROUTES } from '@web/app/router/routes';
import { useOpenCatalogItem } from '@web/app/router/useOpenCatalogItem';
import {
  orderRoutes,
  TopoGalleryMobile,
  useApiGetTopos,
  useTopoGallery
} from '@web/features/topo';
import { coordsOf, useSearchParamList } from '@web/shared/lib';
import { getGradeColor } from '@web/shared/theme/palette';
import {
  ApiFeedback,
  DirectionsButton,
  PageBreadcrumbs,
  PageShell,
  PageTitle
} from '@web/shared/ui';

import type { Route } from '../common';
import {
  ArchivedSectorNotice,
  gradeOrder,
  RoutesList,
  RoutesPanelHeader,
  RoutesSortDirectionButton,
  useApiGetRoutes,
  useApiGetSector,
  useApiGetTickedRoutes,
  useGradeFilter,
  useRoutesByTopo,
  useRoutesSort
} from '../common';
import { RoutesSortButton } from './RoutesSortButton';

export const PageSectorMobile = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { idRegion = '', idSector = '' } = useParams();
  const openCatalogItem = useOpenCatalogItem();
  const { sector } = useApiGetSector(idSector);
  const { routes, isLoading, failure } = useApiGetRoutes(idSector);
  const { topos } = useApiGetTopos(idSector);
  const [selectedGrades, selectGrades] = useSearchParamList('grades');
  const { toggleGrade, clearGrades, visibleRoutes, visibleTopos } =
    useGradeFilter({
      routes,
      topos,
      selectedGrades,
      onSelectGrades: selectGrades
    });
  const { tickedRoutes, tickedCount } = useApiGetTickedRoutes(
    idSector,
    visibleRoutes
  );
  const { idActiveTopo, selectTopo } = useTopoGallery({
    topos: visibleTopos
  });
  const { sort, direction, changeSort, toggleDirection } = useRoutesSort();

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
    sort,
    direction,
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
    <PageShell spacing={2} isCompact>
      <HeaderRowStyled>
        <PageBreadcrumbs
          maxItems={2}
          items={[
            { label: t`Regions`, to: ROUTES.INDEX },
            { label: sector?.regionName ?? '…', to: buildRegionPath(idRegion) },
            { label: sector?.name ?? '…' }
          ]}
        />
      </HeaderRowStyled>
      {sector?.isArchived && <ArchivedSectorNotice />}
      <TitleRowStyled>
        <PageTitle
          name={sector?.name}
          nameLocal={sector?.nameLocal}
          variant="h5"
        />
        <DirectionsButton entityType="sector" point={coordsOf(sector)} />
      </TitleRowStyled>
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
        onSelectTopo={selectTopo}
        onSelectRoute={openRouteById}
      />
      <RoutesPanelHeader
        routesCount={visibleRoutes.length}
        tickedCount={tickedCount}
        gradeHistogram={sector?.gradeHistogram ?? []}
        selectedGrades={selectedGrades}
        sortButton={
          <>
            <RoutesSortDirectionButton
              direction={direction}
              isVisible={sort !== 'default'}
              onToggleDirection={toggleDirection}
            />
            <RoutesSortButton sort={sort} onSortChange={changeSort} />
          </>
        }
        onToggleGrade={toggleGrade}
        onClearGrades={clearGrades}
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

const TitleRowStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1.5)};

  & > *:first-of-type {
    min-width: 0;
  }

  & > *:last-child {
    flex: none;
  }
`;

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
