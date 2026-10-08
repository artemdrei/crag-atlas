import { track } from '@crag-atlas/analytics';

import { useModal, useUser } from '@web/app/providers';
import type { TickHeader } from '@web/features/logTick';
import { coordsOf } from '@web/shared/lib';
import type { Coords } from '@web/shared/types';

import type { Route } from '../entities';

export interface LogTickTarget extends TickHeader {
  idRoute: string;
  coords?: Coords;
}

export const toLogTickTarget = (route: Route): LogTickTarget => ({
  idRoute: route.id,
  routeName: route.name,
  routeGrade: route.grade,
  routeGradeScale: route.gradeScale,
  place: `${route.sectorName}, ${route.regionName}`,
  coords: coordsOf({ lat: route.sectorLat, lng: route.sectorLng })
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
