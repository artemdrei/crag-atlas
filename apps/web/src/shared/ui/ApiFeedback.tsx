import type { ReactNode } from 'react';

import { type Failure, resolveFailureMessage } from '@crag-atlas/utils';
import Typography from '@mui/material/Typography';

export interface Props {
  isLoading: boolean;
  failure: Failure | null;
  loadingLabel: ReactNode;
}

export const ApiFeedback = ({ isLoading, failure, loadingLabel }: Props) => {
  if (failure) {
    return (
      <Typography color="error">{resolveFailureMessage(failure)}</Typography>
    );
  }

  if (isLoading) {
    return <Typography color="text.secondary">{loadingLabel}</Typography>;
  }

  return null;
};
