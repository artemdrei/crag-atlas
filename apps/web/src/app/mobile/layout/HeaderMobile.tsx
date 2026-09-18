import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export const HeaderMobile = () => (
  <AppBar
    position="static"
    color="transparent"
    elevation={0}
    sx={{ pt: 'env(safe-area-inset-top)' }}
  >
    <Toolbar>
      <Typography variant="h6">Crag Atlas</Typography>
    </Toolbar>
  </AppBar>
);
