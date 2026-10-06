import { useParams } from 'react-router';

import { styled, useTheme } from '@mui/material/styles';

import { buildRegionPath, buildSectorPath } from '@web/app/router/routes';
import {
  TopoImage,
  useOpenTopoPhoto,
  usePhotoLabel,
  useRouteTopo
} from '@web/features/topo';
import { useApiGetSector } from '@web/pages/sector';
import { coordsOf } from '@web/shared/lib';
import { getGradeColor } from '@web/shared/theme/palette';
import {
  ApiFeedback,
  DirectionsButton,
  PageBreadcrumbs,
  PageShell,
  PageTitle,
  PageTitleRow,
  PhotoPlaceholder,
  ZoomStageShell
} from '@web/shared/ui';
import { GradeConsensus } from '@web/widgets/gradeConsensus';

import {
  ArchivedRouteNotice,
  LogTickButton,
  RouteDetails,
  RouteSkeleton,
  RouteStats,
  RouteTabs,
  toLogTickTarget,
  useApiGetRoute
} from '../common';

export const PageRouteMobile = () => {
  const { idRegion = '', idSector = '', idRoute = '' } = useParams();
  const theme = useTheme();
  const openTopoPhoto = useOpenTopoPhoto();
  const { route, isLoading, failure } = useApiGetRoute(idRoute);
  const { sector } = useApiGetSector(idSector);
  const { topo, photoIndex, lines, numberOf } = useRouteTopo(idSector, idRoute);
  const photoLabel = usePhotoLabel();

  const colorOf = () =>
    getGradeColor(theme.palette.grade, route?.grade, route?.gradeScale);

  const handleSelectPhoto = () =>
    openTopoPhoto({
      topo,
      label: photoLabel(photoIndex),
      lines,
      numberOf,
      colorOf
    });

  return (
    <PageShell
      spacing={2}
      isCompact
      header={
        <PageBreadcrumbs
          maxItems={2}
          items={[
            {
              label: route?.regionName ?? '…',
              to: buildRegionPath(idRegion)
            },
            {
              label: route?.sectorName ?? '…',
              to: buildSectorPath(idRegion, idSector)
            },
            { label: route?.name ?? '…' }
          ]}
        />
      }
    >
      <ApiFeedback failure={failure} />
      {isLoading && <RouteSkeleton />}
      {route && (
        <>
          {route.isArchived && <ArchivedRouteNotice />}
          <PageTitleRow>
            <PageTitle
              name={route.name}
              nameLocal={route.nameLocal}
              variant="h5"
            />
            <DirectionsButton entityType="sector" point={coordsOf(sector)} />
          </PageTitleRow>
          <PhotoStyled>
            {topo ? (
              <ZoomStageShell>
                <TopoImage
                  photoUrl={topo.photoUrl}
                  label={photoLabel(photoIndex)}
                  lines={lines}
                  numberOf={numberOf}
                  colorOf={colorOf}
                  onSelectPhoto={handleSelectPhoto}
                />
              </ZoomStageShell>
            ) : (
              <PhotoPlaceholder variant="wide" />
            )}
          </PhotoStyled>
          <RouteDetails route={route} />
          <StatsRowStyled>
            {!!route.ascentsCount && (
              <StatsStyled
                ascentsCount={route.ascentsCount}
                onsightCount={route.onsightCount}
                isCompact
              />
            )}
            {!!route.votesNeutral && (
              <ConsensusStyled
                grade={route.grade}
                votesSoft={route.votesSoft ?? 0}
                votesNeutral={route.votesNeutral}
                votesHard={route.votesHard ?? 0}
                isCompact
              />
            )}
          </StatsRowStyled>
          <RouteTabs route={route} hasLogbookTab />
          {!route.isArchived && (
            <ActionBarStyled>
              <LogTickButton {...toLogTickTarget(route)} />
            </ActionBarStyled>
          )}
        </>
      )}
    </PageShell>
  );
};

const StatsRowStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StatsStyled = styled(RouteStats)`
  display: contents;
`;

const ConsensusStyled = styled(GradeConsensus)`
  flex: 1 1 100%;
  min-width: 0;
`;

const PhotoStyled = styled('div')`
  display: flex;
  height: 38svh;
`;

const ActionBarStyled = styled('div')`
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1, 0)};
`;
