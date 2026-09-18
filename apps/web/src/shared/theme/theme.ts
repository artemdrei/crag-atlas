import { createTheme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#2e5f4f' : '#7fb69a' },
      secondary: { main: mode === 'light' ? '#b56a3c' : '#d99a6c' }
    },
    shape: { borderRadius: 8 }
  });
