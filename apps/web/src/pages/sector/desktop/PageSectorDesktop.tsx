import { useState } from 'react';
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
  TopoGalleryDesktop,
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
  useSectorSelection
} from '../common';

export const PageSectorDesktop = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { idRegion = '', idSector = '' } = useParams();
  const navigate = useNavigate();
  const { sector } = useApiGetSector(idSector);
  const [isEditing, setIsEditing] = useState(false);
  const { routes, isLoading, failure } = useApiGetRoutes(idSector);
  const { topos } = useApiGetTopos(idSector);
  const { idActiveTopo, selectTopo } = useTopoGallery({ topos });
  const { idHighlightedRoute, highlightRoute } = useSectorSelection();

  const colorOf = (idRoute: string) =>
    getGradeColor(
      theme.palette.grade,
      routes.find(({ id }) => id === idRoute)?.grade
    );

  const openRoute = (route: Route) =>
    navigate(buildRoutePath(idRegion, idSector, route.id));

  return (
    <PageStyled spacing={1}>
      <HeaderRowStyled>
        <PageBreadcrumbs
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
      <ColumnsStyled>
        <TopoGalleryDesktop
          topos={topos}
          idActiveTopo={idActiveTopo}
          idHighlightedRoute={idHighlightedRoute}
          colorOf={colorOf}
          onSelectTopo={selectTopo}
        />
        <PanelStyled>
          <RoutesPanelHeader routesCount={routes.length} />
          <ApiFeedback
            isLoading={isLoading}
            failure={failure}
            loadingLabel={<Trans>Loading routes…</Trans>}
          />
          <ScrollAreaStyled>
            <RoutesList
              routes={routes}
              idHighlightedRoute={idHighlightedRoute}
              onOpen={openRoute}
              onHover={highlightRoute}
            />
          </ScrollAreaStyled>
        </PanelStyled>
      </ColumnsStyled>
    </PageStyled>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const ColumnsStyled = styled('div')`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 480px;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: stretch;
  flex-grow: 1;
  min-height: 0;
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

const PageStyled = styled(Stack)`
  height: 100%;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1, 3, 2)};
`;
