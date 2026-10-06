import { type ReactNode, useState } from 'react';

import type { GradeHistogramGroup } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';

import {
  ActiveFilterChips,
  FiltersToggleButton,
  RouteFilterFields,
  type RouteFilterState,
  RouteFilterSummary,
  useFilterChips
} from '../common';

export interface Props {
  state: RouteFilterState;
  title: ReactNode;
  routesCount: number;
  tickedCount?: number;
  gradeHistogram: GradeHistogramGroup[];
  gradeOrder: Record<string, number>;
}

export const RouteFilterPanelDesktop = ({
  state,
  title,
  routesCount,
  tickedCount,
  gradeHistogram,
  gradeOrder
}: Props) => {
  const chips = useFilterChips(state, gradeOrder);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <PanelStyled>
      <RouteFilterSummary
        title={title}
        routesCount={routesCount}
        tickedCount={tickedCount}
        action={
          <FiltersToggleButton
            activeCount={state.activeCount}
            isExpanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        }
      />
      <ActiveFilterChips
        chips={chips}
        onClearAll={isExpanded ? undefined : state.clearFilters}
      />
      {isExpanded && (
        <CardStyled>
          <RouteFilterFields state={state} gradeHistogram={gradeHistogram} />
          <DividerStyled />
          <FooterStyled>
            <ButtonStyled
              size="small"
              variant="outlined"
              color="inverse"
              startIcon={<CloseIcon />}
              disabled={state.activeCount === 0}
              onClick={state.clearFilters}
            >
              <Trans>Clear all filters</Trans>
            </ButtonStyled>
            <ButtonStyled
              size="small"
              variant="outlined"
              color="inverse"
              startIcon={<ExpandLessIcon />}
              onClick={() => setIsExpanded(false)}
            >
              <Trans>Collapse</Trans>
            </ButtonStyled>
          </FooterStyled>
        </CardStyled>
      )}
    </PanelStyled>
  );
};

const PanelStyled = styled('div')`
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(1.5)};
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const CardStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1.5)};
  border: 1px solid ${({ theme }) => theme.palette.primary.main};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const DividerStyled = styled(Divider)`
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const FooterStyled = styled('div')`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ButtonStyled = styled(Button)`
  text-transform: none;
`;
