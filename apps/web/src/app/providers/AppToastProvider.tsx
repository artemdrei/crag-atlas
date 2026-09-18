import type { ReactNode } from 'react';
import { isMobile } from 'react-device-detect';

import { useTheme } from '@mui/material/styles';
import { Toaster } from 'sonner';

import { useThemeMode } from '@web/shared/theme/ThemeModeProvider';

export const AppToastProvider = ({ children }: { children: ReactNode }) => {
  const { mode } = useThemeMode();
  const theme = useTheme();

  return (
    <>
      {children}
      <Toaster
        theme={mode}
        position={isMobile ? 'top-center' : 'top-right'}
        richColors
        closeButton
        offset={{
          top: 'calc(env(safe-area-inset-top) + 12px)',
          right: 'calc(env(safe-area-inset-right) + 12px)',
          left: 'calc(env(safe-area-inset-left) + 12px)'
        }}
        toastOptions={{
          style: {
            fontFamily: theme.typography.fontFamily,
            borderRadius: theme.shape.borderRadius
          }
        }}
      />
    </>
  );
};
