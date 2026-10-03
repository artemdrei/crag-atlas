import { createSvgIcon } from '@mui/material/utils';

// @mui/icons-material ships no rain glyph, so these reuse its CloudySnowing
// cloud and draw the drops beneath it.
const CLOUD =
  'M17.5 16h-10C4.47 16 2 13.53 2 10.5c0-2.76 2.09-5.09 4.78-5.44C7.83 3.18 9.82 2 12 2c2.97 0 5.45 2.18 5.92 5.02C20.21 7.23 22 9.16 22 11.5c0 2.48-2.02 4.5-4.5 4.5';

export const RainIcon = createSvgIcon(
  <path
    d={`${CLOUD}M7.4 17.5H9l-1.4 4.5H6zm5 0H14l-1.4 4.5H11zm5 0H19l-1.4 4.5H16z`}
  />,
  'Rain'
);

export const DrizzleIcon = createSvgIcon(
  <path d={`${CLOUD}M8.6 17.5h1.5l-.9 2.5H7.7zm5 0h1.5l-.9 2.5h-1.5z`} />,
  'Drizzle'
);
