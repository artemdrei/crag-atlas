import { Trans } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { ConfirmDialog, SubjectStyled } from '@web/shared/ui';

export interface Props {
  name: string;
  open: boolean;
  onConfirm: () => void;
}

const PurgeDialog = ({ name, open, onConfirm }: Props) => {
  const { closeModal } = useModal();

  return (
    <ConfirmDialog
      isDestructive
      open={open}
      title={<Trans>Erase this from the database?</Trans>}
      confirmLabel={<Trans>Erase for good</Trans>}
      onConfirm={onConfirm}
      onClose={() => closeModal('PURGE_CATALOG_ITEM')}
    >
      <Trans>
        <SubjectStyled>{name}</SubjectStyled> and everything filed under it
        leave the database for good — the archive will have nothing left to
        bring back. Climbers left nothing here, so none of their work goes with
        it.
      </Trans>
    </ConfirmDialog>
  );
};

export default PurgeDialog;
