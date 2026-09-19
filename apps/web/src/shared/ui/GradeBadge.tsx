import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

import type { GradeTone } from '@web/shared/theme/palette';

export interface Props {
  /** A single grade ("7a+"), a range ("5a-8b") or anything else ("project"). */
  grade: string;
}

export const GradeBadge = ({ grade }: Props) => (
  <ChipStyled size="small" label={grade} tone={resolveGradeTone(grade)} />
);

// A range spans several levels, so colouring it by one of them would lie —
// it gets the neutral tone, as does anything unreadable. Everything below 5
// reads as 5 and above 9 as 9: the scale groups routes by feel, not exhaustively.
const resolveGradeTone = (grade: string): GradeTone => {
  const matches = grade.match(/\d\s*[abc]/gi) ?? [];

  if (matches.length !== 1) return 'neutral';

  const digit = matches[0][0];

  if (Number(digit) < 5) return '5';
  if (Number(digit) > 9) return '9';

  return digit as GradeTone;
};

const ChipStyled = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'tone'
})<{ tone: GradeTone }>`
  font-weight: 600;
  background-color: ${({ theme, tone }) => theme.palette.grade[tone].background};
  color: ${({ theme, tone }) => theme.palette.grade[tone].text};
`;
