import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';

export interface Props {
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteTickActions = ({
  isPending,
  onConfirm,
  onCancel
}: Props) => (
  <>
    <Button type="button" onClick={onCancel}>
      <Trans>Cancel</Trans>
    </Button>
    <Button
      type="button"
      color="error"
      variant="contained"
      disabled={isPending}
      onClick={onConfirm}
    >
      {isPending ? <Trans>Deleting…</Trans> : <Trans>Delete</Trans>}
    </Button>
  </>
);
