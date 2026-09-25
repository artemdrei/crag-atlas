import { Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { BottomSheet, FormActions } from '@web/shared/ui';

import { DeleteRouteMediaActions, useRemoveRouteMedia } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
  idMedia: string;
}

const DeleteRouteMediaSheet = ({ open, idRoute, idMedia }: Props) => {
  const { t } = useLingui();
  const { isPending, close, deleteMedia } = useRemoveRouteMedia({
    idRoute,
    idMedia
  });

  return (
    <BottomSheet title={t`Delete media`} isOpen={open} onClose={close}>
      <TextStyled variant="body2" color="text.secondary">
        <Trans>This cannot be undone.</Trans>
      </TextStyled>
      <FormActions>
        <DeleteRouteMediaActions
          isPending={isPending}
          onConfirm={() => deleteMedia()}
          onCancel={close}
        />
      </FormActions>
    </BottomSheet>
  );
};

const TextStyled = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export default DeleteRouteMediaSheet;
