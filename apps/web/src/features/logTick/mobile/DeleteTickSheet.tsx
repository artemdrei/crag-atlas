import { Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { BottomSheet, FormActions } from '@web/shared/ui';

import { DeleteTickActions, useRemoveTick } from '../common';

export interface Props {
  open: boolean;
  idTick: string;
}

const DeleteTickSheet = ({ open, idTick }: Props) => {
  const { t } = useLingui();
  const { isPending, close, deleteTick } = useRemoveTick(idTick);

  return (
    <BottomSheet title={t`Delete ascent`} isOpen={open} onClose={close}>
      <TextStyled variant="body2" color="text.secondary">
        <Trans>This cannot be undone.</Trans>
      </TextStyled>
      <FormActions>
        <DeleteTickActions
          isPending={isPending}
          onConfirm={() => deleteTick()}
          onCancel={close}
        />
      </FormActions>
    </BottomSheet>
  );
};

const TextStyled = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export default DeleteTickSheet;
