import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { CatalogSource } from '@crag-atlas/analytics';
import { Trans, useLingui } from '@lingui/react/macro';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useUser } from '@web/app/providers';
import {
  buildRegionPath,
  buildSectorEditPath,
  ROUTES
} from '@web/app/router/routes';
import { useOpenCatalogItem } from '@web/app/router/useOpenCatalogItem';
import {
  findTopoOfRoute,
  orderRoutes,
  TopoGalleryDesktop,
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
  useRoutesSort,
  useSectorSelection
} from '../common';
import { RoutesSortButton } from './RoutesSortButton';

export const PageSectorDesktop = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { idRegion = '', idSector = '' } = useParams();
  const navigate = useNavigate();
  const openCatalogItem = useOpenCatalogItem();
  const { hasRole } = useUser();
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
  const { idHighlightedRoute, highlightRoute } = useSectorSelection();

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

  const openRoute = (route: Route, source: CatalogSource = 'card') => {
    const topo = findTopoOfRoute(visibleTopos, route.id);

    if (topo && topo.id !== idActiveTopo) {
      selectTopo(topo.id);
      highlightRoute(route.id);

      return;
    }

    openCatalogItem(source, {
      name: route.name,
      idRegion,
      idSector,
      idRoute: route.id
    });
  };

  // No topo check: the line was clicked on the topo already open.
  const openRouteById = (idRoute: string) => {
    const route = routes.find(({ id }) => id === idRoute);

    if (!route) return;

    openCatalogItem('topo', {
      name: route.name,
      idRegion,
      idSector,
      idRoute: route.id
    });
  };

  return (
    <PageShell spacing={1} isFixedHeight>
      <HeaderRowStyled>
        <PageBreadcrumbs
          items={[
            { label: t`Regions`, to: ROUTES.INDEX },
            { label: sector?.regionName ?? '…', to: buildRegionPath(idRegion) },
            { label: sector?.name ?? '…' }
          ]}
        />
        <ActionsStyled>
          {hasRole('admin') && !sector?.isArchived && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(buildSectorEditPath(idRegion, idSector))}
            >
              <Trans>Edit</Trans>
            </Button>
          )}
        </ActionsStyled>
      </HeaderRowStyled>
      {sector?.isArchived && <ArchivedSectorNotice />}
      <ColumnsStyled>
        <MainColumnStyled>
          <TitleRowStyled>
            <PageTitle name={sector?.name} nameLocal={sector?.nameLocal} />
            <DirectionsButton entityType="sector" point={coordsOf(sector)} />
          </TitleRowStyled>
          {sector?.description && (
            <Typography variant="body2" color="text.secondary">
              {sector.description}
            </Typography>
          )}
          <GalleryAreaStyled>
            <TopoGalleryDesktop
              topos={visibleTopos}
              idActiveTopo={idActiveTopo}
              idHighlightedRoute={idHighlightedRoute}
              colorOf={colorOf}
              numberOf={numberOf}
              onSelectTopo={selectTopo}
              onSelectRoute={openRouteById}
              onHoverRoute={highlightRoute}
            />
          </GalleryAreaStyled>
        </MainColumnStyled>
        <PanelStyled>
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
          <ScrollAreaStyled>
            <RoutesList
              groups={groups}
              numberOf={numberOf}
              idHighlightedRoute={idHighlightedRoute}
              tickedRoutes={tickedRoutes}
              isLoading={isLoading}
              onOpen={openRoute}
              onHover={highlightRoute}
            />
          </ScrollAreaStyled>
        </PanelStyled>
      </ColumnsStyled>
    </PageShell>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const TitleRowStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};

  & > *:first-of-type {
    min-width: 0;
  }

  & > *:last-child {
    flex: none;
  }
`;

const ActionsStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ColumnsStyled = styled('div')`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 480px;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: stretch;
  flex-grow: 1;
  min-height: 0;
`;

const MainColumnStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 100%;
  min-width: 0;
  min-height: 0;
`;

const GalleryAreaStyled = styled('div')`
  flex-grow: 1;
  min-height: 0;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const PanelStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  height: 100%;
  min-height: 0;
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const ScrollAreaStyled = styled('div')`
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
`;
