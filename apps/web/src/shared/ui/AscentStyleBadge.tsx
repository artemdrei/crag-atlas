import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

import type { AscentStyleTone } from '@web/shared/theme/palette';

import { AscentStyleLabel } from './AscentStyleLabel';

export interface Props {
  ascentStyle: AscentStyleTone;
}

export const AscentStyleBadge = ({ ascentStyle }: Props) => (
  <ChipStyled
    size="small"
    label={<AscentStyleLabel ascentStyle={ascentStyle} />}
    tone={ascentStyle}
  />
);

const ChipStyled = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'tone'
})<{ tone: AscentStyleTone }>`
  font-weight: 600;
  background-color: ${({ theme, tone }) =>
    theme.palette.ascentStyle[tone].background};
  color: ${({ theme, tone }) => theme.palette.ascentStyle[tone].text};
`;
