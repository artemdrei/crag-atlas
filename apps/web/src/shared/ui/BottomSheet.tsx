import type { ReactNode } from 'react';
import { Sheet } from 'react-modal-sheet';

import { styled, useTheme } from '@mui/material/styles';

export interface Props {
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
}

export const BottomSheet = ({ isOpen, children, onClose }: Props) => {
  const theme = useTheme();

  return (
    <SheetStyled
      detent="content"
      isOpen={isOpen}
      onClose={onClose}
      // The library hard-codes z-index 9999 inline unless style.zIndex is
      // given, which would bury every MUI menu opened from inside the sheet.
      style={{ zIndex: theme.zIndex.drawer }}
    >
      <Sheet.Container>
        <Sheet.Header />
        <Sheet.Content>{children}</Sheet.Content>
      </Sheet.Container>

      <Sheet.Backdrop onTap={onClose} />
    </SheetStyled>
  );
};

// react-modal-sheet renders its own DOM, so its classes are the only hook for
// theming it.
const SheetStyled = styled(Sheet)`
  .react-modal-sheet-container {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
    background-color: ${({ theme }) => theme.palette.background.paper};
    padding: 0 ${({ theme }) => theme.spacing(2)}
      calc(${({ theme }) => theme.spacing(3)} + env(safe-area-inset-bottom));
  }

  .react-modal-sheet-drag-indicator {
    background-color: ${({ theme }) => theme.palette.divider};
  }
`;
