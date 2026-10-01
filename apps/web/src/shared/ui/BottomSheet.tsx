import type { ReactNode } from 'react';
import { Sheet } from 'react-modal-sheet';

import { alpha, styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  title?: string;
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
}

export const BottomSheet = ({ title, isOpen, children, onClose }: Props) => {
  const theme = useTheme();

  return (
    <SheetStyled
      detent="content"
      isOpen={isOpen}
      // Without it the library paints a white sheet through inline styles.
      unstyled
      onClose={onClose}
      // The library hard-codes z-index 9999 unless style.zIndex is given,
      // burying every MUI menu opened from inside the sheet.
      style={{ zIndex: theme.zIndex.drawer }}
    >
      <Sheet.Container>
        <Sheet.Header />
        <Sheet.Content>
          {title && <TitleStyled variant="h6">{title}</TitleStyled>}
          {children}
        </Sheet.Content>
      </Sheet.Container>

      <Sheet.Backdrop onTap={onClose} />
    </SheetStyled>
  );
};

const TitleStyled = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

// react-modal-sheet renders its own DOM, so its classes are the only hook.
const SheetStyled = styled(Sheet)`
  .react-modal-sheet-backdrop {
    background-color: ${({ theme }) => alpha(theme.palette.common.black, 0.5)};
  }

  .react-modal-sheet-container {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
    background-color: ${({ theme }) => theme.palette.background.paper};
    box-shadow: ${({ theme }) => theme.shadows[8]};
    padding: 0 ${({ theme }) => theme.spacing(2)}
      calc(${({ theme }) => theme.spacing(3)} + env(safe-area-inset-bottom));
  }

  .react-modal-sheet-header {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .react-modal-sheet-drag-indicator {
    width: 32px;
    height: 4px;
    border-radius: 2px;
    background-color: ${({ theme }) => theme.palette.divider};
  }
`;
