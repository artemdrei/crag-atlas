import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export interface Props {
  isPending: boolean;
  onCancel: () => void;
}

export const EditActions = ({ isPending, onCancel }: Props) => (
  <ActionsStyled>
    <Button type="button" onClick={onCancel}>
      <Trans>Cancel</Trans>
    </Button>
    <Button type="submit" variant="contained" disabled={isPending}>
      {isPending ? <Trans>Saving…</Trans> : <Trans>Save</Trans>}
    </Button>
  </ActionsStyled>
);

const ActionsStyled = styled('div')`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;
