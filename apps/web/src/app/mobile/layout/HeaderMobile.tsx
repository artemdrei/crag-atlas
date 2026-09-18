import AppBar from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export const HeaderMobile = () => (
  <HeaderStyled position="static" color="transparent" elevation={0}>
    <Toolbar>
      <Typography variant="h6">Crag Atlas</Typography>
    </Toolbar>
  </HeaderStyled>
);

const HeaderStyled = styled(AppBar)`
  padding-top: env(safe-area-inset-top);
`;
