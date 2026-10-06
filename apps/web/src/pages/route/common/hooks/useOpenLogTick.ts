import { track } from '@crag-atlas/analytics';

import { useModal, useUser } from '@web/app/providers';
import type { TickHeader } from '@web/features/logTick';

import type { Route } from '../entities';

export interface LogTickTarget extends TickHeader {
  idRoute: string;
}

export const toLogTickTarget = (route: Route): LogTickTarget => ({
  idRoute: route.id,
  routeName: route.name,
  routeGrade: route.grade,
  routeGradeScale: route.gradeScale,
  place: `${route.sectorName}, ${route.regionName}`
});

export const useOpenLogTick = (target: LogTickTarget) => {
  const { isAuthenticated } = useUser();
  const { openModal } = useModal();

  return () => {
    if (!isAuthenticated) {
      track({ name: 'Sign In Prompted', props: { action: 'tick' } });
      openModal('SIGN_IN_PROMPT');
      return;
    }

    openModal('LOG_TICK', target);
  };
};
