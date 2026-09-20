import { useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { DEMO_ROUTE_COMMENTS, RouteComments } from '@web/widgets/routeComments';
import { DEMO_ROUTE_MEDIA, RouteMedia } from '@web/widgets/routeMedia';

import { RouteAscents } from './RouteAscents';

type TabId = 'media' | 'comments' | 'ascents';

export const RouteTabs = () => {
  const { t } = useLingui();
  const [tab, setTab] = useState<TabId>('media');

  return (
    <SectionStyled>
      <Tabs value={tab} onChange={(_, next: TabId) => setTab(next)}>
        <Tab value="media" label={t`Video and photo`} />
        <Tab value="comments" label={t`Comments`} />
        <Tab value="ascents" label={t`Ascents`} />
      </Tabs>
      {tab === 'media' && <RouteMedia items={DEMO_ROUTE_MEDIA} />}
      {tab === 'comments' && <RouteComments comments={DEMO_ROUTE_COMMENTS} />}
      {tab === 'ascents' && <RouteAscents />}
    </SectionStyled>
  );
};

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;
