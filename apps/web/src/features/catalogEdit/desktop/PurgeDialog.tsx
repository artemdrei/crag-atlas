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
      title={<Trans>Erase for good?</Trans>}
      confirmLabel={<Trans>Erase for good</Trans>}
      onConfirm={onConfirm}
      onClose={() => closeModal('PURGE_CATALOG_ITEM')}
    >
      <Trans>
        <SubjectStyled>{name}</SubjectStyled> and whatever catalog rows sit
        under it are dropped from the database. Climbers left nothing here, so
        none of their work goes with it — but this one cannot be undone.
      </Trans>
    </ConfirmDialog>
  );
};

export default PurgeDialog;
