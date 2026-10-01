import type { PropsWithChildren } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';

import type { TickHeader } from '../common';
import { TickFormHeader } from '../common';

export interface Props extends TickHeader {
  open: boolean;
  onClose: () => void;
}

export const TickFormDialog = ({
  routeName,
  routeGrade,
  routeGradeScale,
  place,
  open,
  children,
  onClose
}: PropsWithChildren<Props>) => (
  <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
    <DialogTitle>
      <TickFormHeader
        routeName={routeName}
        routeGrade={routeGrade}
        routeGradeScale={routeGradeScale}
        place={place}
      />
    </DialogTitle>
    <ContentStyled>{children}</ContentStyled>
  </Dialog>
);

// The form's actions stick to the bottom of this scroller, so its gutter has
// to go — content would scroll through it.
const ContentStyled = styled(DialogContent)`
  padding-bottom: 0;
`;
