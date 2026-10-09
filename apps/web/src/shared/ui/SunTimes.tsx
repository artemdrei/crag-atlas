import LightModeIcon from '@mui/icons-material/LightMode';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import { styled } from '@mui/material/styles';

import { IconValue } from './IconValue';

export interface Props {
  sunrise: string;
  sunset: string;
  variant?: 'body2' | 'caption';
}

export const SunTimes = ({ sunrise, sunset, variant }: Props) => (
  <RowStyled>
    <IconValue
      isMuted
      variant={variant}
      icon={<LightModeIcon fontSize="small" color="inherit" />}
    >
      {sunrise}
    </IconValue>
    <IconValue
      isMuted
      variant={variant}
      icon={<WbTwilightIcon fontSize="small" color="inherit" />}
    >
      {sunset}
    </IconValue>
  </RowStyled>
);

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
