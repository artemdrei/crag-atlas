import { useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';

import { useUser } from '@web/app/providers';
import { useApiGetMyRouteTicks } from '@web/features/logTick';
import { trackListControl } from '@web/shared/lib';
import { ApiFeedback } from '@web/shared/ui';
import {
  DEFAULT_TICK_VIEW,
  type LogbookTab,
  LogbookTabs,
  TicksList,
  type TickView,
  TickViewSelect
} from '@web/widgets/tickList';

import type { Route } from '../entities';
import {
  toLogTickTarget,
  useApiGetRouteLogbook,
  useOpenLogTick
} from '../hooks';
import { RouteAscentsInvite } from './RouteAscentsInvite';

export interface Props {
  route: Route;
  isPill?: boolean;
}

export const RouteAscents = ({ route, isPill }: Props) => {
  const { t } = useLingui();
  const idRoute = route.id;
  const { isAuthenticated } = useUser();
  const openLogTick = useOpenLogTick(toLogTickTarget(route));
  const [tab, setTab] = useState<LogbookTab>('mine');
  const [view, setView] = useState<TickView>(DEFAULT_TICK_VIEW);
  const activeTab = isAuthenticated ? tab : 'feed';

  const mine = useApiGetMyRouteTicks(idRoute, activeTab === 'mine');
  const community = useApiGetRouteLogbook(idRoute, activeTab === 'feed');
  const { ticks, isLoading, failure } =
    activeTab === 'mine'
      ? { ...mine, ticks: [...mine.ticks].reverse() }
      : community;
  const isEmpty = !isLoading && !failure && ticks.length === 0;

  const changeTab = (next: LogbookTab) => {
    trackListControl('route', 'tab', next);
    setTab(next);
  };

  const changeView = (next: TickView) => {
    trackListControl('route', 'view', next);
    setView(next);
  };

  return (
    <SectionStyled aria-label={t`Ascents`}>
      {isAuthenticated && (
        <LogbookTabs tab={activeTab} isPill={isPill} onChange={changeTab} />
      )}
      {!isEmpty && <ViewSelectStyled view={view} onChange={changeView} />}
      <ApiFeedback failure={failure} />
      {isEmpty ? (
        <RouteAscentsInvite
          isMine={activeTab === 'mine'}
          onLog={route.isArchived ? undefined : openLogTick}
        />
      ) : (
        <TicksList
          ticks={ticks}
          isCompact={view === 'compact'}
          isRouteHidden
          isLoading={isLoading}
        />
      )}
    </SectionStyled>
  );
};

const SectionStyled = styled('section')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const ViewSelectStyled = styled(TickViewSelect)`
  align-self: flex-end;
  min-width: ${({ theme }) => theme.spacing(20)};
`;
