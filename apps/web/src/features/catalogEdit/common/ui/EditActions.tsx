import type { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export interface Props {
  isPending: boolean;
  onCancel?: () => void;
  leftAction?: ReactNode;
}

export const EditActions = ({ isPending, onCancel, leftAction }: Props) => (
  <ActionsStyled>
    {leftAction && <LeftSlotStyled>{leftAction}</LeftSlotStyled>}
    {onCancel && (
      <Button type="button" onClick={onCancel}>
        <Trans>Close</Trans>
      </Button>
    )}
    <Button type="submit" variant="contained" disabled={isPending}>
      {isPending ? <Trans>Saving…</Trans> : <Trans>Save</Trans>}
    </Button>
  </ActionsStyled>
);

const ActionsStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const LeftSlotStyled = styled('div')`
  margin-right: auto;
`;
