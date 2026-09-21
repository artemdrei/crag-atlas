import type { GradeScale } from '@crag-atlas/api';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

import { useDisplayGrade } from '@web/shared/lib';
import type { GradeTone } from '@web/shared/theme/palette';
import { resolveGradeTone } from '@web/shared/theme/palette';

export interface Props {
  grade?: string | null;
  /** Omitted for text that is not a single grade, such as a range. */
  scale?: GradeScale | null;
}

export const GradeBadge = ({ grade, scale }: Props) => {
  const displayGrade = useDisplayGrade();

  if (!grade) return null;

  return (
    <ChipStyled
      size="small"
      label={scale ? displayGrade(grade, scale) : grade}
      tone={scale ? resolveGradeTone(grade, scale) : 'neutral'}
    />
  );
};

const ChipStyled = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'tone'
})<{ tone: GradeTone }>`
  font-weight: 600;
  background-color: ${({ theme, tone }) =>
    theme.palette.grade[tone].background};
  color: ${({ theme, tone }) => theme.palette.grade[tone].text};
`;
