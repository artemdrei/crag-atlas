import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useThemeMode } from '@web/shared/theme/ThemeModeProvider';

export const Home = () => {
  const { mode, toggle } = useThemeMode();

  return (
    <Stack spacing={2} sx={{ p: 4 }}>
      <Typography variant="h4">
        <Trans>Find your next climb</Trans>
      </Typography>
      <Button variant="outlined" onClick={toggle}>
        {mode === 'light' ? 'Dark mode' : 'Light mode'}
      </Button>
    </Stack>
  );
};
