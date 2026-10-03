import type { GradeScale } from '@crag-atlas/api';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

import { useDisplayGrade } from '@web/shared/lib';
import type { GradeTone } from '@web/shared/theme/palette';
import {
  resolveGradeFill,
  resolveGradeInk,
  resolveGradeTone
} from '@web/shared/theme/palette';

export interface Props {
  grade?: string | null;
  scale?: GradeScale | null;
  size?: 'small' | 'medium';
}

export const GradeBadge = ({ grade, scale, size = 'small' }: Props) => {
  const displayGrade = useDisplayGrade();

  if (!grade) return null;

  return (
    <ChipStyled
      size={size}
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
    resolveGradeFill(theme.palette.mode, tone)};
  border: 1px solid
    ${({ theme, tone }) => resolveGradeInk(theme.palette.mode, tone)};
  color: ${({ theme, tone }) => resolveGradeInk(theme.palette.mode, tone)};

  &.MuiChip-sizeMedium {
    font-size: ${({ theme }) => theme.typography.body1.fontSize};
  }
`;
