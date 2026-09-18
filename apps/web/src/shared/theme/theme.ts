import { createTheme } from '@mui/material/styles';

import { palette } from './palette';
import { typography } from './typography';

export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: { mode, ...palette[mode] },
    typography,
    shape: { borderRadius: mode === 'dark' ? 12 : 10 }
  });
