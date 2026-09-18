import { useNavigate } from 'react-router';

import { Trans } from '@lingui/react/macro';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { ROUTES } from '@web/app/router/routes';

export const AppHeaderDesktop = () => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ gap: 3 }}>
        <Typography
          variant="h6"
          component="span"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate(ROUTES.INDEX)}
        >
          Crag Atlas
        </Typography>
        <Button color="inherit" onClick={() => navigate(ROUTES.INDEX)}>
          <Trans>Regions</Trans>
        </Button>
        <Button color="inherit" disabled>
          <Trans>My logbook</Trans>
        </Button>
        <Box sx={{ flexGrow: 1 }} />
      </Toolbar>
    </AppBar>
  );
};
