import { Outlet } from 'react-router';

import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const PageAdminMobile = () => (
  <PageStyled>
    <Typography variant="h5">
      <Trans>Admin</Trans>
    </Typography>
    <Outlet />
  </PageStyled>
);

const PageStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;
