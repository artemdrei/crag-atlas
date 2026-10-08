import { Outlet } from 'react-router';

import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ROUTES } from '@web/app/router/routes';

import { AdminTabs } from '../common/ui';

const TABS = [
  { path: ROUTES.ADMIN_ACCESS, label: <Trans>Access</Trans> },
  { path: ROUTES.ADMIN_QR_CODES, label: <Trans>QR codes</Trans> },
  { path: ROUTES.ADMIN_FEEDBACK, label: <Trans>Feedback</Trans> }
];

export const PageAdminDesktop = () => {
  return (
    <PageStyled>
      <Typography variant="h4">
        <Trans>Admin</Trans>
      </Typography>
      <AdminTabs tabs={TABS} />
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
