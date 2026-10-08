import { Outlet } from 'react-router';

import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ROUTES } from '@web/app/router/routes';

import { AdminTabs } from '../common/ui';

const TABS = [
  { path: ROUTES.ADMIN_ACCESS, label: <Trans>Access</Trans> },
  { path: ROUTES.ADMIN_FEEDBACK, label: <Trans>Feedback</Trans> }
];

export const PageAdminMobile = () => {
  return (
    <PageStyled>
      <Typography variant="h5">
        <Trans>Admin</Trans>
      </Typography>
      <AdminTabs tabs={TABS} variant="fullWidth" />
      <Outlet />
    </PageStyled>
  );
};

const PageStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;
