import { styled } from '@mui/material/styles';

import { AdminList, GrantAdminButton } from '../common';

export const PageAdminAccessMobile = () => (
  <SectionStyled>
    <GrantAdminButton isFullWidth />
    <AdminList />
  </SectionStyled>
);

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;
