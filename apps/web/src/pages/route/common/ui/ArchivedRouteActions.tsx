import { useNavigate } from 'react-router';

import { Trans } from '@lingui/react/macro';

import { buildSectorPath } from '@web/app/router/routes';
import { ArchivedItemPanel } from '@web/features/catalogEdit';

import type { Route } from '../entities';

export interface Props {
  route: Route;
}

export const ArchivedRouteActions = ({ route }: Props) => {
  const navigate = useNavigate();

  return (
    <ArchivedItemPanel
      scope="routes"
      id={route.id}
      name={route.name}
      notice={
        <Trans>Restoring puts it back in its sector, lines and all.</Trans>
      }
      onDone={() => navigate(buildSectorPath(route.idRegion, route.idSector))}
    />
  );
};
