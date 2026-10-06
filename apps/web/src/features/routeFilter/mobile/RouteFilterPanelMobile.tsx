import { type ReactNode, useState } from 'react';

import type { GradeHistogramGroup } from '@crag-atlas/api';
import { Plural, Trans } from '@lingui/react/macro';
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
            summary={title}
            isActive={state.activeCount > 0}
            onClearAll={state.clearFilters}
          />
          <RouteFilterFields state={state} gradeHistogram={gradeHistogram} />
          <ActionsStyled>
            <Button
              variant="outlined"
              color="inverse"
              onClick={() => setIsOpen(false)}
            >
              <Trans>Close</Trans>
            </Button>
            <ShowButtonStyled
              variant="contained"
              onClick={() => setIsOpen(false)}
            >
              <Plural
                value={routesCount}
                one="Show # route"
                other="Show # routes"
              />
            </ShowButtonStyled>
          </ActionsStyled>
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

const ActionsStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ShowButtonStyled = styled(Button)`
  flex: 1 1 auto;
`;
