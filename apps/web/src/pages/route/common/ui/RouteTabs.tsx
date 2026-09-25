import { useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { RouteComments } from '@web/widgets/routeComments';
import { RouteMedia, useRouteMediaCount } from '@web/widgets/routeMedia';

import { RouteLogbook } from './RouteLogbook';

type TabId = 'media' | 'comments' | 'logbook';

export interface Props {
  idRoute: string;
}

export const RouteTabs = ({ idRoute }: Props) => {
  const { t } = useLingui();
  const [tab, setTab] = useState<TabId>('media');
  const mediaCount = useRouteMediaCount(idRoute);

  return (
    <SectionStyled>
      <Tabs value={tab} onChange={(_, next: TabId) => setTab(next)}>
        <Tab
          value="media"
          label={
            mediaCount ? t`Video and photo (${mediaCount})` : t`Video and photo`
          }
        />
        <Tab value="comments" label={t`Comments`} />
        <Tab value="logbook" label={t`Logbook`} />
      </Tabs>
      {tab === 'media' && <RouteMedia idRoute={idRoute} />}
      {tab === 'comments' && <RouteComments idRoute={idRoute} />}
      {tab === 'logbook' && <RouteLogbook idRoute={idRoute} />}
    </SectionStyled>
  );
};

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;
