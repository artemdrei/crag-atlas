import { createContext, useContext, useMemo, useState } from 'react';

import { ThemeProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';

import { createAppTheme } from '@web/shared/theme/theme';

type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'crag-atlas:theme-mode';

const ThemeModeContext = createContext<{
  mode: ThemeMode;
  toggle: () => void;
} | null>(null);

const readStoredMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

export const ThemeModeProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [mode, setMode] = useState<ThemeMode>(readStoredMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggle = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx)
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
};
