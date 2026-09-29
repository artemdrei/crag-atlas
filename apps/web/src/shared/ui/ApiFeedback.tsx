import { type Failure, resolveFailureMessage } from '@crag-atlas/utils';
import Typography from '@mui/material/Typography';

export interface Props {
  failure: Failure | null;
}

export const ApiFeedback = ({ failure }: Props) => {
  if (!failure) return null;

  return (
    <Typography color="error">{resolveFailureMessage(failure)}</Typography>
  );
};
