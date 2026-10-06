import type { ConditionBand } from '@crag-atlas/api';
import { alpha, createTheme } from '@mui/material/styles';

import type { AscentTypeTone, GradeColor, GradeTone } from './palette';
import { resolvePalette } from './palette';
import { typography } from './typography';

declare module '@mui/material/styles' {
  interface Palette {
    grade: Record<GradeTone, GradeColor>;
    ascentType: Record<AscentTypeTone, GradeColor>;
    conditionBand: Record<ConditionBand, string>;
    sectorPin: string[];
    inverse: Palette['primary'];
  }

  interface PaletteOptions {
    grade?: Record<GradeTone, GradeColor>;
    ascentType?: Record<AscentTypeTone, GradeColor>;
    conditionBand?: Record<ConditionBand, string>;
    sectorPin?: string[];
    inverse?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    inverse: true;
  }
}

const CONTROL_RADIUS = 50;

export const createAppTheme = (mode: 'light' | 'dark', isEditing = false) =>
  createTheme({
    palette: { mode, ...resolvePalette(mode, isEditing) },
    typography,
    shape: { borderRadius: mode === 'dark' ? 12 : 10 },
    components: {
      MuiBackdrop: {
        styleOverrides: {
          // Menus and popovers ride on an invisible backdrop.
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
          // A phone has no room for the 32px MUI leaves around a dialog.
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
          root: { textTransform: 'capitalize', borderRadius: CONTROL_RADIUS }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          // A textarea curved like a pill crops its own first line, and the
          // notch a floating label cuts lands inside the curve.
          root: ({ ownerState, theme }) => ({
            borderRadius:
              ownerState.multiline || ownerState.label
                ? theme.shape.borderRadius
                : CONTROL_RADIUS
          })
        }
      },
      MuiToggleButton: {
        styleOverrides: {
          root: { textTransform: 'capitalize', borderRadius: CONTROL_RADIUS }
        }
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          // The buttons carry the pill radius on their own, so a group has to
          // flatten the edges where they meet.
          firstButton: {
            borderRadius: `${CONTROL_RADIUS}px 0 0 ${CONTROL_RADIUS}px`
          },
          middleButton: { borderRadius: 0 },
          lastButton: {
            borderRadius: `0 ${CONTROL_RADIUS}px ${CONTROL_RADIUS}px 0`
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'capitalize' }
        }
      }
    }
  });
