import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { AdminList, GrantAdminButton } from '../common';

export const PageAdminAccessMobile = () => (
  <PageStyled>
    <Typography variant="h5">
      <Trans>Access</Trans>
    </Typography>

    <GrantAdminButton isFullWidth />

    <AdminList />
  </PageStyled>
);

const PageStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;
