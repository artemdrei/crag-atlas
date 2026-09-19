import { createTheme } from '@mui/material/styles';

import type { GradeColor, GradeTone } from './palette';
import { palette } from './palette';
import { typography } from './typography';

declare module '@mui/material/styles' {
  interface Palette {
    grade: Record<GradeTone, GradeColor>;
  }

  interface PaletteOptions {
    grade?: Record<GradeTone, GradeColor>;
  }
}

export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: { mode, ...palette[mode] },
    typography,
    shape: { borderRadius: mode === 'dark' ? 12 : 10 }
  });
