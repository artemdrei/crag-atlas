import Button from '@mui/material/Button';

import { useThemeMode } from '@web/shared/theme/ThemeModeProvider';

export const HomeThemeToggle = () => {
  const { mode, toggle } = useThemeMode();

  return (
    <Button variant="outlined" onClick={toggle}>
      {mode === 'light' ? 'Dark mode' : 'Light mode'}
    </Button>
  );
};
