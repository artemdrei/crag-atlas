import { useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import { styled, useTheme } from '@mui/material/styles';

import { useModal } from '@web/app/providers';
import {
  buildRegionPath,
  buildSectorPath,
  ROUTES
} from '@web/app/router/routes';
import { TopoImage, usePhotoLabel, useRouteTopo } from '@web/features/topo';
import { getGradeColor } from '@web/shared/theme/palette';
import {
  ApiFeedback,
  PageBreadcrumbs,
  PageShell,
  PhotoPlaceholder
} from '@web/shared/ui';
import { GradeConsensus } from '@web/widgets/gradeConsensus';

import {
  ArchivedRouteNotice,
  LogTickButton,
  RouteDetails,
  RouteStats,
  RouteTabs,
  useApiGetRoute
} from '../common';

export const PageRouteMobile = () => {
  const { t } = useLingui();
  const { idRegion = '', idSector = '', idRoute = '' } = useParams();
  const theme = useTheme();
  const { openModal } = useModal();
  const { route, isLoading, failure } = useApiGetRoute(idRoute);
  const { topo, photoIndex, lines, numberOf } = useRouteTopo(idSector, idRoute);
  const photoLabel = usePhotoLabel();

  const colorOf = () =>
    getGradeColor(theme.palette.grade, route?.grade, route?.gradeScale);

  const openPhoto = () => {
    if (!topo) return;

    openModal('VIEW_TOPO_PHOTO', {
      photoUrl: topo.photoUrl,
      label: photoLabel(photoIndex),
      lines,
      numberOf,
      colorOf
    });
  };

  return (
    <PageShell spacing={2} isCompact>
      <HeaderRowStyled>
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
      </HeaderRowStyled>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading route…</Trans>}
      />
      {route && (
        <>
          {route.isArchived && <ArchivedRouteNotice />}
          <PhotoStyled>
            {topo ? (
              <PhotoButtonStyled
                type="button"
                aria-label={t`Open the photo`}
                onClick={openPhoto}
              >
                <TopoImage
                  photoUrl={topo.photoUrl}
                  label={photoLabel(photoIndex)}
                  lines={lines}
                  numberOf={numberOf}
                  colorOf={colorOf}
                  isContained
                />
              </PhotoButtonStyled>
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
          <RouteTabs idRoute={route.id} />
          {!route.isArchived && (
            <ActionBarStyled>
              <LogTickButton
                idRoute={route.id}
                routeName={route.name}
                routeGrade={route.grade}
                routeGradeScale={route.gradeScale}
                place={`${route.sectorName}, ${route.regionName}`}
              />
            </ActionBarStyled>
          )}
        </>
      )}
    </PageShell>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

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

const PhotoButtonStyled = styled('button')`
  position: relative;
  display: inline-flex;
  height: 100%;
  max-width: 100%;
  padding: 0;
  cursor: zoom-in;
  border: none;
  background: none;
`;

const PhotoStyled = styled('div')`
  height: 38svh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActionBarStyled = styled('div')`
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme }) => theme.palette.background.default};
`;
