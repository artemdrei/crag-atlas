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
  onToggleGrade: (key: string) => void;
  onClearGrades: () => void;
}

export const RoutesPanelHeader = ({
  routesCount,
  tickedCount,
  gradeHistogram,
  selectedGrades,
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
    {gradeHistogram.map((group) => (
      <GradeHistogram
        key={group.type}
        group={group}
        selectedGrades={selectedGrades}
        onToggleGrade={onToggleGrade}
        isCompact
      />
    ))}
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
