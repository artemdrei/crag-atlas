import type { Sector } from '@crag-atlas/api';
import { Plural, Trans } from '@lingui/react/macro';

import { ArchivedItemPanel } from './ArchivedItemPanel';

export interface Props {
  sector: Sector;
  onDone: () => void;
}

export const ArchivedSectorPanel = ({ sector, onDone }: Props) => (
  <ArchivedItemPanel
    scope="sectors"
    id={sector.id}
    name={sector.name}
    notice={
      <Trans>
        Restoring brings back its routes, except the ones archived on their own.
      </Trans>
    }
    catalogLoss={
      sector.routeCount > 0 && (
        <Trans>
          Erasing takes{' '}
          <Plural
            value={sector.routeCount}
            one="# route"
            few="# routes"
            many="# routes"
            other="# routes"
          />{' '}
          with it.
        </Trans>
      )
    }
    onDone={onDone}
  />
);
