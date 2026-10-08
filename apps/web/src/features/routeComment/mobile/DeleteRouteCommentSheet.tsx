import { Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { BottomSheet, FormActions } from '@web/shared/ui';

import { DeleteRouteCommentActions, useRemoveRouteComment } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
  idComment: string;
}

const DeleteRouteCommentSheet = ({ open, idRoute, idComment }: Props) => {
  const { t } = useLingui();
  const { isPending, close, deleteComment } = useRemoveRouteComment({
    idRoute,
    idComment
  });

  return (
    <BottomSheet title={t`Delete comment`} isOpen={open} onClose={close}>
      <TextStyled variant="body2" color="text.secondary">
        <Trans>This cannot be undone.</Trans>
      </TextStyled>
      <FormActions>
        <DeleteRouteCommentActions
          isPending={isPending}
          onConfirm={() => deleteComment()}
          onCancel={close}
        />
      </FormActions>
    </BottomSheet>
  );
};

const TextStyled = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

export default DeleteRouteCommentSheet;
