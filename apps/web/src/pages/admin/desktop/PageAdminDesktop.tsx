import { Link, Outlet, useLocation } from 'react-router';

import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { ROUTES } from '@web/app/router/routes';

const TABS = [
  { path: ROUTES.ADMIN_ACCESS, label: <Trans>Access</Trans> },
  { path: ROUTES.ADMIN_QR_CODES, label: <Trans>QR codes</Trans> }
];

export const PageAdminDesktop = () => {
  const { pathname } = useLocation();
  const tab = TABS.find(({ path }) => pathname.startsWith(path))?.path ?? false;

  return (
    <PageStyled>
      <Typography variant="h4">
        <Trans>Admin</Trans>
      </Typography>
      <Tabs value={tab}>
        {TABS.map(({ path, label }) => (
          <Tab
            key={path}
            value={path}
            label={label}
            component={Link}
            to={path}
          />
        ))}
      </Tabs>
      <Outlet />
    </PageStyled>
  );
};

const PageStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;
