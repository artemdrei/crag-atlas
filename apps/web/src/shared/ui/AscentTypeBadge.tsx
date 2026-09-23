import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

import type { AscentTypeTone } from '@web/shared/theme/palette';

import { AscentTypeLabel } from './AscentTypeLabel';

export interface Props {
  ascentType: AscentTypeTone;
}

export const AscentTypeBadge = ({ ascentType }: Props) => (
  <ChipStyled
    size="small"
    label={<AscentTypeLabel ascentType={ascentType} />}
    tone={ascentType}
  />
);

const ChipStyled = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'tone'
})<{ tone: AscentTypeTone }>`
  font-weight: 600;
  background-color: ${({ theme, tone }) =>
    theme.palette.ascentType[tone].background};
  color: ${({ theme, tone }) => theme.palette.ascentType[tone].text};
`;
