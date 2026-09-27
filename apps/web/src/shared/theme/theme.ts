import { alpha, createTheme } from '@mui/material/styles';

import type { AscentTypeTone, GradeColor, GradeTone } from './palette';
import { resolvePalette } from './palette';
import { typography } from './typography';

declare module '@mui/material/styles' {
  interface Palette {
    grade: Record<GradeTone, GradeColor>;
    ascentType: Record<AscentTypeTone, GradeColor>;
    sectorPin: string[];
  }

  interface PaletteOptions {
    grade?: Record<GradeTone, GradeColor>;
    ascentType?: Record<AscentTypeTone, GradeColor>;
    sectorPin?: string[];
  }
}

export const createAppTheme = (mode: 'light' | 'dark', isEditing = false) =>
  createTheme({
    palette: { mode, ...resolvePalette(mode, isEditing) },
    typography,
    shape: { borderRadius: mode === 'dark' ? 12 : 10 },
    components: {
      MuiBackdrop: {
        styleOverrides: {
          // Menus and popovers ride on an invisible backdrop; only the ones
          // meant to dim the page get the deeper tint.
          root: ({ ownerState, theme }) =>
            ownerState.invisible
              ? {}
              : {
                  backgroundColor: alpha(theme.palette.common.black, 0.72)
                }
        }
      },
      MuiDialog: {
        styleOverrides: {
          // A phone has no room for the 32px MUI leaves around a dialog: the
          // gutter here is the one every modal on a narrow screen gets.
          paper: ({ ownerState, theme }) =>
            ownerState.fullScreen
              ? {}
              : {
                  [theme.breakpoints.down('sm')]: {
                    margin: theme.spacing(2),
                    width: `calc(100% - ${theme.spacing(4)})`,
                    maxWidth: `calc(100% - ${theme.spacing(4)})`
                  }
                }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'capitalize' }
        }
      },
      MuiToggleButton: {
        styleOverrides: {
          root: { textTransform: 'capitalize' }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'capitalize' }
        }
      }
    }
  });
