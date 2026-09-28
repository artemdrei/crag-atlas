import type { GradeHistogramGroup } from '@crag-atlas/api';
import { Plural, Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeHistogram } from '@web/shared/ui';

export interface Props {
  routesCount: number;
  gradeHistogram: GradeHistogramGroup[];
  selectedGrades: string[];
  onToggleGrade: (key: string) => void;
  onClearGrades: () => void;
}

export const RoutesPanelHeader = ({
  routesCount,
  gradeHistogram,
  selectedGrades,
  onToggleGrade,
  onClearGrades
}: Props) => (
  <HeaderStyled>
    <TitleRowStyled>
      <Typography variant="subtitle1">
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

const ResetButtonStyled = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isVisible'
})<{ isVisible: boolean }>`
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
`;
