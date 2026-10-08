import type { Failure } from '@crag-atlas/utils';
import Paper from '@mui/material/Paper';
import { alpha, styled } from '@mui/material/styles';

import type { SectorConditions } from '../entities';
import { ConditionsPanel } from './ConditionsPanel';

export interface Props {
  list: 'sector' | 'region';
  conditions: SectorConditions | null;
  failure: Failure | null;
  isLoading: boolean;
  isOffline: boolean;
  className?: string;
}

export const ConditionsSection = ({
  list,
  conditions,
  failure,
  isLoading,
  isOffline,
  className
}: Props) => (
  <PaperStyled variant="outlined" className={className}>
    <ConditionsPanel
      list={list}
      conditions={conditions}
      failure={failure}
      isLoading={isLoading}
      isOffline={isOffline}
    />
  </PaperStyled>
);

const PaperStyled = styled(Paper)`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => alpha(theme.palette.background.paper, 0.6)};
`;
