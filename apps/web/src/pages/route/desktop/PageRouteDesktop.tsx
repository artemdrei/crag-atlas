import { useNavigate, useParams } from 'react-router';

import { useLingui } from '@lingui/react/macro';
import { styled, useTheme } from '@mui/material/styles';

import { useUser } from '@web/app/providers';
import {
  buildRegionPath,
  buildRouteEditPath,
  buildSectorPath
} from '@web/app/router/routes';
import { EditToggleButton } from '@web/features/catalogEdit';
import {
  TopoImage,
  useOpenTopoPhoto,
  usePhotoLabel,
  useRouteTopo
} from '@web/features/topo';
import { getGradeColor } from '@web/shared/theme/palette';
import {
  ApiFeedback,
  PageBreadcrumbs,
  PageShell,
  PageTitle,
  PhotoPlaceholder
} from '@web/shared/ui';
import { GradeConsensus } from '@web/widgets/gradeConsensus';

import {
  ArchivedRouteActions,
  ArchivedRouteNotice,
  LogTickButton,
  RouteDetails,
  RouteSkeleton,
  RouteStats,
  RouteTabs,
  useApiGetRoute
} from '../common';

export const PageRouteDesktop = () => {
  const { t } = useLingui();
  const { idRegion = '', idSector = '', idRoute = '' } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const openTopoPhoto = useOpenTopoPhoto();
  const { hasRole } = useUser();
  const { route, isLoading, failure } = useApiGetRoute(idRoute);
  const { topo, photoIndex, lines, numberOf } = useRouteTopo(idSector, idRoute);
  const photoLabel = usePhotoLabel();

  const colorOf = () =>
    getGradeColor(theme.palette.grade, route?.grade, route?.gradeScale);

  const openPhoto = () =>
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
      header={
        <HeaderRowStyled>
          <PageBreadcrumbs
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
          {route && !route.isArchived && (
            <EditToggleButton
              onClick={() =>
                navigate(buildRouteEditPath(idRegion, idSector, idRoute))
              }
            />
          )}
        </HeaderRowStyled>
      }
    >
      <ApiFeedback failure={failure} />
      {isLoading && <RouteSkeleton />}
      {route && (
        <ColumnsStyled>
          {route.isArchived && <NoticeStyled />}
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
                />
              </PhotoButtonStyled>
            ) : (
              <PhotoPlaceholder variant="wide" />
            )}
          </PhotoStyled>
          <MainColumnStyled>
            <DetailsBlockStyled>
              <PageTitle name={route.name} nameLocal={route.nameLocal} />
              <RouteDetails route={route} />
            </DetailsBlockStyled>
            <StatsRowStyled>
              {!!route.ascentsCount && (
                <StatsStyled
                  ascentsCount={route.ascentsCount}
                  onsightCount={route.onsightCount}
                />
              )}
              {!!route.votesNeutral && (
                <ConsensusStyled
                  grade={route.grade}
                  votesSoft={route.votesSoft ?? 0}
                  votesNeutral={route.votesNeutral}
                  votesHard={route.votesHard ?? 0}
                />
              )}
            </StatsRowStyled>
            <RouteTabs idRoute={route.id} />
          </MainColumnStyled>
          <ActionsStyled>
            {route.isDeleted && hasRole('admin') && (
              <ArchivedRouteActions route={route} />
            )}
            {!route.isArchived && (
              <LogTickButton
                idRoute={route.id}
                routeName={route.name}
                routeGrade={route.grade}
                routeGradeScale={route.gradeScale}
                place={`${route.sectorName}, ${route.regionName}`}
              />
            )}
          </ActionsStyled>
        </ColumnsStyled>
      )}
    </PageShell>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const NoticeStyled = styled(ArchivedRouteNotice)`
  grid-column: 1 / -1;
`;

const ColumnsStyled = styled('div')`
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr) 320px;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: start;

  ${({ theme }) => theme.breakpoints.down('lg')} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const MainColumnStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
`;

const DetailsBlockStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-width: 0;
`;

const StatsRowStyled = styled('div')`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(2)};

  ${({ theme }) => theme.breakpoints.down('md')} {
    flex-wrap: wrap;
  }
`;

const StatsStyled = styled(RouteStats)`
  display: contents;
`;

const ConsensusStyled = styled(GradeConsensus)`
  flex: 2 1 0;
  min-width: 0;
`;

const PhotoButtonStyled = styled('button')`
  position: relative;
  display: flex;
  width: 100%;
  padding: 0;
  cursor: zoom-in;
  border: none;
  background: none;
`;

const PhotoStyled = styled('div')`
  position: sticky;
  top: ${({ theme }) => theme.spacing(2)};
  height: 320px;
  display: flex;

  ${({ theme }) => theme.breakpoints.down('lg')} {
    position: static;
  }
`;

const ActionsStyled = styled('div')`
  position: sticky;
  top: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};

  ${({ theme }) => theme.breakpoints.down('lg')} {
    position: static;
  }
`;
