import { useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { trackListControl } from '@web/shared/lib';
import { RouteComments } from '@web/widgets/routeComments';
import { RouteMedia, useRouteMediaCount } from '@web/widgets/routeMedia';

import type { Route } from '../entities';
import { RouteAscents } from './RouteAscents';

type TabId = 'media' | 'comments' | 'logbook';

export interface Props {
  route: Route;
  hasLogbookTab?: boolean;
}

export const RouteTabs = ({ route, hasLogbookTab }: Props) => {
  const idRoute = route.id;
  const { t } = useLingui();
  const [tab, setTab] = useState<TabId>('media');
  const mediaCount = useRouteMediaCount(idRoute);

  return (
    <SectionStyled>
      <Tabs
        value={tab}
        onChange={(_, next: TabId) => {
          trackListControl('route', 'tab', next);
          setTab(next);
        }}
      >
        <Tab
          value="media"
          label={
            mediaCount ? t`Video and photo (${mediaCount})` : t`Video and photo`
          }
        />
        <Tab value="comments" label={t`Comments`} />
        {hasLogbookTab && <Tab value="logbook" label={t`Logbook`} />}
      </Tabs>
      {tab === 'media' && <RouteMedia idRoute={idRoute} />}
      {tab === 'comments' && <RouteComments idRoute={idRoute} />}
      {tab === 'logbook' && <RouteAscents route={route} isPill />}
    </SectionStyled>
  );
};

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;
