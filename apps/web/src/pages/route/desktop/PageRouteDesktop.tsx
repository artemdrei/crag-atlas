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
import { GradeConsensus } from '@web/widgets/gradeConsensus';

import {
  LogTickButton,
  MyAscentsCard,
  RouteDetails,
  RouteStats,
  RouteTabs,
  useApiGetRoute
} from '../common';

export const PageRouteDesktop = () => {
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
      <HeaderRowStyled>
        <PageBreadcrumbs
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
        {route && !isEditing && (
          <EditToggleButton onClick={() => setIsEditing(true)} />
        )}
      </HeaderRowStyled>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading route…</Trans>}
      />
      {route && !isEditing && (
        <ColumnsStyled>
          <PhotoStyled>
            {topo ? (
              <TopoImage topo={topo} isContained areLinesHidden />
            ) : (
              <PhotoPlaceholder variant="wide" />
            )}
          </PhotoStyled>
          <MainColumnStyled>
            <RouteDetails route={route} />
            {!!route.ascentsCount && (
              <RouteStats
                ascentsCount={route.ascentsCount}
                onsightCount={route.onsightCount}
              />
            )}
            {!!route.votesNeutral && (
              <GradeConsensus
                grade={route.grade}
                votesSoft={route.votesSoft ?? 0}
                votesNeutral={route.votesNeutral}
                votesHard={route.votesHard ?? 0}
              />
            )}
            <RouteTabs />
          </MainColumnStyled>
          <ActionsStyled>
            <LogTickButton idRoute={route.id} />
            <MyAscentsCard />
          </ActionsStyled>
        </ColumnsStyled>
      )}
      {route && isEditing && (
        <RouteEditForm route={route} onClose={() => setIsEditing(false)} />
      )}
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

const PhotoStyled = styled('div')`
  position: sticky;
  top: ${({ theme }) => theme.spacing(2)};
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;

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

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(1, 3, 3)};
`;
