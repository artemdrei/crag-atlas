import { type ReactNode, useState } from 'react';

import type { GradeHistogramGroup } from '@crag-atlas/api';
import { Plural } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { BottomSheet } from '@web/shared/ui';

import {
  ActiveFilterChips,
  FiltersHeader,
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

export const RouteFilterPanelMobile = ({
  state,
  title,
  routesCount,
  tickedCount,
  gradeHistogram,
  gradeOrder
}: Props) => {
  const chips = useFilterChips(state, gradeOrder);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PanelStyled>
      <RouteFilterSummary
        title={title}
        routesCount={routesCount}
        tickedCount={tickedCount}
        action={
          <FiltersToggleButton
            activeCount={state.activeCount}
            isExpanded={isOpen}
            onClick={() => setIsOpen(true)}
          />
        }
      />
      <ActiveFilterChips chips={chips} onClearAll={state.clearFilters} />
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <SheetBodyStyled>
          <FiltersHeader
            isActive={state.activeCount > 0}
            onClearAll={state.clearFilters}
          />
          <RouteFilterFields state={state} gradeHistogram={gradeHistogram} />
          <Button
            variant="contained"
            fullWidth
            onClick={() => setIsOpen(false)}
          >
            <Plural
              value={routesCount}
              one="Show # route"
              other="Show # routes"
            />
          </Button>
        </SheetBodyStyled>
      </BottomSheet>
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

const SheetBodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
