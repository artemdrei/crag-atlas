import type { Region } from '@crag-atlas/api';
import { Plural, Trans } from '@lingui/react/macro';

import { useApiSectorQrs } from '@web/features/sectorQr';

import { ArchivedItemPanel } from './ArchivedItemPanel';

export interface Props {
  region: Region;
  onDone: () => void;
}

export const ArchivedRegionPanel = ({ region, onDone }: Props) => {
  const { rows } = useApiSectorQrs({ idRegion: region.id });
  const hasQrCodes = rows.some(({ path }) => !!path);

  return (
    <ArchivedItemPanel
      scope="regions"
      id={region.id}
      name={region.name}
      notice={
        <Trans>
          Restoring brings back its sectors and routes, except the ones archived
          on their own.
        </Trans>
      }
      catalogLoss={
        region.sectorCount + region.routeCount > 0 && (
          <Trans>
            Erasing takes{' '}
            <Plural
              value={region.sectorCount}
              one="# sector"
              few="# sectors"
              many="# sectors"
              other="# sectors"
            />{' '}
            and{' '}
            <Plural
              value={region.routeCount}
              one="# route"
              few="# routes"
              many="# routes"
              other="# routes"
            />{' '}
            with it.
          </Trans>
        )
      }
      purgeWarning={
        hasQrCodes && (
          <Trans>Printed QR codes of its sectors stop working.</Trans>
        )
      }
      onDone={onDone}
    />
  );
};
