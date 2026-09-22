import { useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { RouteComments } from '@web/widgets/routeComments';
import { RouteMedia } from '@web/widgets/routeMedia';

type TabId = 'comments' | 'media';

export interface Props {
  idRoute: string;
}

export const RouteTabs = ({ idRoute }: Props) => {
  const { t } = useLingui();
  const [tab, setTab] = useState<TabId>('comments');

  return (
    <SectionStyled>
      <Tabs value={tab} onChange={(_, next: TabId) => setTab(next)}>
        <Tab value="comments" label={t`Comments`} />
        <Tab value="media" label={t`Video and photo`} />
      </Tabs>
      {tab === 'comments' && <RouteComments idRoute={idRoute} />}
      {tab === 'media' && <RouteMedia idRoute={idRoute} />}
    </SectionStyled>
  );
};

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;
