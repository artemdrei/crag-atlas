import type { ReactNode } from 'react';

import type { GradeHistogramGroup } from '@crag-atlas/api';
import { Plural, Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeHistogram, TickProgress } from '@web/shared/ui';

export interface Props {
  routesCount: number;
  tickedCount?: number;
  gradeHistogram: GradeHistogramGroup[];
  selectedGrades: string[];
  sortButton?: ReactNode;
  onToggleGrade: (key: string) => void;
  onClearGrades: () => void;
}

export const RoutesPanelHeader = ({
  routesCount,
  tickedCount,
  gradeHistogram,
  selectedGrades,
  sortButton,
  onToggleGrade,
  onClearGrades
}: Props) => (
  <HeaderStyled>
    <TitleRowStyled>
      <Typography variant="subtitle1" noWrap>
        <Plural value={routesCount} one="# route" other="# routes" />
      </Typography>
      <ResetButtonStyled
        size="small"
        isVisible={selectedGrades.length > 0}
        disabled={selectedGrades.length === 0}
        onClick={onClearGrades}
      >
        <Trans>Reset filters</Trans>
      </ResetButtonStyled>
      {tickedCount !== undefined && (
        <ProgressStyled tickedCount={tickedCount} routesCount={routesCount} />
      )}
    </TitleRowStyled>
    <GradesRowStyled>
      <GradesStyled>
        {gradeHistogram.map((group) => (
          <GradeHistogram
            key={group.type}
            group={group}
            selectedGrades={selectedGrades}
            onToggleGrade={onToggleGrade}
            isCompact
            hasScrollHint
          />
        ))}
      </GradesStyled>
      {sortButton && <SortSlotStyled>{sortButton}</SortSlotStyled>}
    </GradesRowStyled>
  </HeaderStyled>
);

const HeaderStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const TitleRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const GradesRowStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

// The bars scroll inside this column instead of pushing the button out of the
// row, so the button sits in the same place whatever a sector's grade spread.
const GradesStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1 1 auto;
  min-width: 0;
`;

const SortSlotStyled = styled('div')`
  display: flex;
  align-items: center;
  flex: none;
`;

const ProgressStyled = styled(TickProgress)`
  flex: none;
  width: 90px;
  margin-left: auto;
`;

const ResetButtonStyled = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isVisible'
})<{ isVisible: boolean }>`
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
`;
