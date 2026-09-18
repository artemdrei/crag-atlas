import { useNavigate } from 'react-router';

import { Trans } from '@lingui/react/macro';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { ROUTES } from '@web/app/router/routes';

export const AppHeaderDesktop = () => {
  const navigate = useNavigate();

  return (
    <HeaderStyled position="static" color="transparent" elevation={0}>
      <ToolbarStyled>
        <LogoStyled
          variant="h6"
          component="span"
          onClick={() => navigate(ROUTES.INDEX)}
        >
          Crag Atlas
        </LogoStyled>
        <Button color="inherit" onClick={() => navigate(ROUTES.INDEX)}>
          <Trans>Regions</Trans>
        </Button>
        <Button color="inherit" disabled>
          <Trans>My logbook</Trans>
        </Button>
        <SpacerStyled />
      </ToolbarStyled>
    </HeaderStyled>
  );
};

const HeaderStyled = styled(AppBar)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`
}));

const ToolbarStyled = styled(Toolbar)({
  gap: 24
});

const LogoStyled = styled(Typography)({
  cursor: 'pointer'
}) as typeof Typography;

const SpacerStyled = styled(Box)({
  flexGrow: 1
});
