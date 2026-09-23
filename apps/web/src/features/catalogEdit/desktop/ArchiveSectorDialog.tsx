import { Trans } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { ConfirmDialog, SubjectStyled } from '@web/shared/ui';

export interface Props {
  sectorName: string;
  routeCount: number;
  open: boolean;
  onConfirm: () => void;
}

const ArchiveSectorDialog = ({
  sectorName,
  routeCount,
  open,
  onConfirm
}: Props) => {
  const { closeModal } = useModal();
  const sector = <SubjectStyled>{sectorName}</SubjectStyled>;

  return (
    <ConfirmDialog
      open={open}
      title={<Trans>Move the sector to the archive?</Trans>}
      confirmLabel={<Trans>Archive sector</Trans>}
      onConfirm={onConfirm}
      onClose={() => closeModal('ARCHIVE_SECTOR')}
    >
      {routeCount > 0 ? (
        <Trans>
          {sector} leaves the catalog for everyone, together with its routes.
          Nothing is erased: everything climbers left stays, and you can bring
          the sector back from the archive.
        </Trans>
      ) : (
        <Trans>
          {sector} is empty, so only the sector itself and its photos leave the
          catalog. You can bring it back from the archive.
        </Trans>
      )}
    </ConfirmDialog>
  );
};

export default ArchiveSectorDialog;
