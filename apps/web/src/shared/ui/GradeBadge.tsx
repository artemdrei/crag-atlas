import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

import type { GradeTone } from '@web/shared/theme/palette';
import { resolveGradeTone } from '@web/shared/theme/palette';

export interface Props {
  grade?: string | null;
}

export const GradeBadge = ({ grade }: Props) =>
  grade ? (
    <ChipStyled size="small" label={grade} tone={resolveGradeTone(grade)} />
  ) : null;

const ChipStyled = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'tone'
})<{ tone: GradeTone }>`
  font-weight: 600;
  background-color: ${({ theme, tone }) =>
    theme.palette.grade[tone].background};
  color: ${({ theme, tone }) => theme.palette.grade[tone].text};
`;
