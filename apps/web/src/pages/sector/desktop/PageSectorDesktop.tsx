import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useUser } from '@web/app/providers';
import {
  buildRegionPath,
  buildRoutePath,
  buildSectorEditPath,
  ROUTES
} from '@web/app/router/routes';
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
  RoutesList,
  RoutesPanelHeader,
  useApiGetRoutes,
  useApiGetSector,
  useApiGetTickedRoutes,
  useGradeFilter,
  useRoutesByTopo,
  useSectorSelection
} from '../common';

export const PageSectorDesktop = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { idRegion = '', idSector = '' } = useParams();
  const navigate = useNavigate();
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
    numberOf
  });

  const colorOf = (idRoute: string) => {
    const route = routes.find(({ id }) => id === idRoute);

    return getGradeColor(theme.palette.grade, route?.grade, route?.gradeScale);
  };

  const openRoute = (route: Route) => {
    const topo = findTopoOfRoute(visibleTopos, route.id);

    if (topo && topo.id !== idActiveTopo) {
      selectTopo(topo.id);
      highlightRoute(route.id);

      return;
    }

    navigate(buildRoutePath(idRegion, idSector, route.id));
  };

  const openRouteById = (idRoute: string) => {
    const route = routes.find(({ id }) => id === idRoute);

    if (route) navigate(buildRoutePath(idRegion, idSector, route.id));
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
            <DirectionsButton point={coordsOf(sector)} />
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
