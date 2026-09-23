import { Trans } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { ConfirmDialog, SubjectStyled } from '@web/shared/ui';

export interface Props {
  regionName: string;
  sectorCount: number;
  open: boolean;
  onConfirm: () => void;
}

const ArchiveRegionDialog = ({
  regionName,
  sectorCount,
  open,
  onConfirm
}: Props) => {
  const { closeModal } = useModal();
  const region = <SubjectStyled>{regionName}</SubjectStyled>;

  return (
    <ConfirmDialog
      open={open}
      title={<Trans>Move the region to the archive?</Trans>}
      confirmLabel={<Trans>Archive region</Trans>}
      onConfirm={onConfirm}
      onClose={() => closeModal('ARCHIVE_REGION')}
    >
      {sectorCount > 0 ? (
        <Trans>
          {region} leaves the catalog for everyone, together with its sectors
          and their routes. Nothing is erased: everything climbers left stays,
          and you can bring the region back from the archive.
        </Trans>
      ) : (
        <Trans>
          {region} is empty, so only the region itself and its photo leave the
          catalog. You can bring it back from the archive.
        </Trans>
      )}
    </ConfirmDialog>
  );
};

export default ArchiveRegionDialog;
