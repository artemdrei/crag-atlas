import type { Sector } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { DangerButton } from '@web/shared/ui';

import { useApiArchiveAction } from '../hooks';

export interface Props {
  sector: Sector;
  onArchived: () => void;
}

export const ArchiveSectorButton = ({ sector, onArchived }: Props) => {
  const { openModal } = useModal();
  const { isPending, run } = useApiArchiveAction('archive', {
    scope: 'sectors',
    onDone: onArchived
  });

  return (
    <DangerButton
      type="button"
      size="small"
      color="error"
      variant="outlined"
      disabled={isPending}
      onClick={() =>
        openModal('ARCHIVE_SECTOR', {
          sectorName: sector.name,
          routeCount: sector.routeCount,
          onConfirm: () => run(sector.id)
        })
      }
    >
      <Trans>Archive sector</Trans>
    </DangerButton>
  );
};
