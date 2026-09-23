import type { PropsWithChildren } from 'react';

import Alert from '@mui/material/Alert';

export interface Props {
  className?: string;
}

export const ArchivedNotice = ({
  className,
  children
}: PropsWithChildren<Props>) => (
  <Alert className={className} severity="info">
    {children}
  </Alert>
);
