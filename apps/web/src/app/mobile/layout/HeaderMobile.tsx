import { useNavigate } from 'react-router';

import AppBar from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { ROUTES } from '@web/app/router/routes';

export const HeaderMobile = () => {
  const navigate = useNavigate();

  return (
    <HeaderStyled position="static" color="transparent" elevation={0}>
      <Toolbar>
        <LogoStyled
          variant="h6"
          component="span"
          onClick={() => navigate(ROUTES.INDEX)}
        >
          Crag Atlas
        </LogoStyled>
      </Toolbar>
    </HeaderStyled>
  );
};

const HeaderStyled = styled(AppBar)`
  padding-top: env(safe-area-inset-top);
`;

const LogoStyled = styled(Typography)`
  cursor: pointer;
` as typeof Typography;
