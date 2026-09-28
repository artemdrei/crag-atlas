import AppBar from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';

import { ROUTES } from '@web/app/router/routes';
import { Wordmark } from '@web/shared/ui';

export const HeaderMobile = () => (
  <HeaderStyled position="static" color="transparent" elevation={0}>
    <Toolbar>
      <Wordmark to={ROUTES.INDEX} />
    </Toolbar>
  </HeaderStyled>
);

const HeaderStyled = styled(AppBar)`
  padding-top: env(safe-area-inset-top);
`;
