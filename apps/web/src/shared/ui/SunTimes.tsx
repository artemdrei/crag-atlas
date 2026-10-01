import LightModeIcon from '@mui/icons-material/LightMode';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';

import { IconValue } from './IconValue';

export interface Props {
  sunrise: string;
  sunset: string;
  variant?: 'body2' | 'caption';
}

export const SunTimes = ({ sunrise, sunset, variant }: Props) => (
  <>
    <IconValue
      isMuted
      variant={variant}
      icon={<LightModeIcon fontSize="small" color="warning" />}
    >
      {sunrise}
    </IconValue>
    <IconValue
      isMuted
      variant={variant}
      icon={<WbTwilightIcon fontSize="small" color="warning" />}
    >
      {sunset}
    </IconValue>
  </>
);
