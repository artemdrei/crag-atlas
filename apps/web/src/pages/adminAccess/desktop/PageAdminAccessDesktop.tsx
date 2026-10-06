import { styled } from '@mui/material/styles';

import { AdminList, GrantAdminButton } from '../common';

export const PageAdminAccessDesktop = () => (
  <SectionStyled>
    <ActionsStyled>
      <GrantAdminButton />
    </ActionsStyled>
    <AdminList />
  </SectionStyled>
);

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  max-width: 720px;
`;

const ActionsStyled = styled('div')`
  display: flex;
  justify-content: flex-end;
`;
