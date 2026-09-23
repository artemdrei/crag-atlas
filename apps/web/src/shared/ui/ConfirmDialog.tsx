import type { PropsWithChildren, ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';

export interface Props {
  title: ReactNode;
  confirmLabel: ReactNode;
  open: boolean;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog = ({
  title,
  confirmLabel,
  open,
  isDestructive,
  children,
  onConfirm,
  onClose
}: PropsWithChildren<Props>) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{children}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>
        <Trans>Cancel</Trans>
      </Button>
      <Button
        variant="contained"
        color={isDestructive ? 'error' : 'primary'}
        onClick={() => {
          onConfirm();
          onClose();
        }}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export const SubjectStyled = styled('strong')`
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: 600;
`;
