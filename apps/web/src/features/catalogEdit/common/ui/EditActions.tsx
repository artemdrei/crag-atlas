import type { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export interface Props {
  submitLabel?: ReactNode;
  leftAction?: ReactNode;
  isPending: boolean;
  isDisabled?: boolean;
  isCancelDisabled?: boolean;
  onCancel?: () => void;
}

export const EditActions = ({
  submitLabel,
  leftAction,
  isPending,
  isDisabled,
  isCancelDisabled,
  onCancel
}: Props) => (
  <ActionsStyled>
    {leftAction && <LeftSlotStyled>{leftAction}</LeftSlotStyled>}
    {onCancel && (
      <Button
        type="button"
        disabled={isPending || isCancelDisabled}
        onClick={onCancel}
      >
        <Trans>Cancel</Trans>
      </Button>
    )}
    <Button
      type="submit"
      variant="contained"
      disabled={isPending || isDisabled}
    >
      {submitLabel ??
        (isPending ? <Trans>Saving…</Trans> : <Trans>Save</Trans>)}
    </Button>
  </ActionsStyled>
);

// The sidebar is the scrolling column, so the row rides its bottom edge.
const ActionsStyled = styled('div')`
  position: sticky;
  bottom: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1.5)};
  background-color: ${({ theme }) => theme.palette.background.default};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;

const LeftSlotStyled = styled('div')`
  margin-right: auto;
`;
