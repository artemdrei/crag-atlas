import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { AdminList, GrantAdminButton } from '../common';

export const PageAdminAccessDesktop = () => (
  <PageStyled>
    <HeaderStyled>
      <Typography variant="h4">
        <Trans>Access</Trans>
      </Typography>
      <GrantAdminButton />
    </HeaderStyled>

    <AdminList />
  </PageStyled>
);

const PageStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const HeaderStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;
