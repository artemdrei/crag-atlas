import type { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';
import { ConfirmDialog, SubjectStyled } from '@web/shared/ui';

export interface Props {
  name: string;
  warning?: ReactNode;
  open: boolean;
  onConfirm: () => void;
}

const PurgeDialog = ({ name, warning, open, onConfirm }: Props) => {
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
      {warning && <WarningStyled> {warning}</WarningStyled>}
    </ConfirmDialog>
  );
};

const WarningStyled = styled('strong')`
  color: ${({ theme }) => theme.palette.error.main};
`;

export default PurgeDialog;
