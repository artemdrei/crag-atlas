import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { BottomSheet, FormActions } from '@web/shared/ui';

import { DeleteFeedbackSummary, useRemoveFeedback } from '../common';

export interface Props {
  open: boolean;
  idFeedback: string;
  rating: number;
  message: string | null;
  authorName: string | null;
}

const DeleteFeedbackSheet = ({
  open,
  idFeedback,
  rating,
  message,
  authorName
}: Props) => {
  const { t } = useLingui();
  const { isPending, close, remove } = useRemoveFeedback(idFeedback);

  return (
    <BottomSheet title={t`Delete feedback?`} isOpen={open} onClose={close}>
      <BodyStyled>
        <DeleteFeedbackSummary
          rating={rating}
          message={message}
          authorName={authorName}
        />
      </BodyStyled>
      <FormActions>
        <Button type="button" onClick={close}>
          <Trans>Cancel</Trans>
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={isPending}
          onClick={remove}
        >
          {isPending ? <Trans>Deleting…</Trans> : <Trans>Delete</Trans>}
        </Button>
      </FormActions>
    </BottomSheet>
  );
};

const BodyStyled = styled('div')`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export default DeleteFeedbackSheet;
