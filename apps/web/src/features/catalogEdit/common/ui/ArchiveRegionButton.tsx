import type { Region } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { DangerButton } from '@web/shared/ui';

import { useApiArchiveAction } from '../hooks';

export interface Props {
  region: Region;
  onArchived: () => void;
}

export const ArchiveRegionButton = ({ region, onArchived }: Props) => {
  const { openModal } = useModal();
  const { isPending, run } = useApiArchiveAction('archive', {
    scope: 'regions',
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
        openModal('ARCHIVE_REGION', {
          regionName: region.name,
          sectorCount: region.sectorCount,
          onConfirm: () => run(region.id)
        })
      }
    >
      <Trans>Archive region</Trans>
    </DangerButton>
  );
};
