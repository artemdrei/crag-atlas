import type { Failure } from '@crag-atlas/utils';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

import type { SectorConditions } from '../entities';
import { ConditionsPanel } from './ConditionsPanel';

export interface Props {
  conditions: SectorConditions | null;
  failure: Failure | null;
  isLoading: boolean;
  className?: string;
}

export const ConditionsSection = ({
  conditions,
  failure,
  isLoading,
  className
}: Props) => (
  <PaperStyled variant="outlined" className={className}>
    <ConditionsPanel
      conditions={conditions}
      failure={failure}
      isLoading={isLoading}
    />
  </PaperStyled>
);

const PaperStyled = styled(Paper)`
  display: flex;
  flex-direction: column;
`;
